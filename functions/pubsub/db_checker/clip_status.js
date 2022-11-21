const {admin_alle_clips} = require("../../outside_connections/firebase/clips")
const {admin_alle_rondes} = require("../../outside_connections/firebase/rondes")
const {huidige_ronde} = require("../../outside_connections/firebase/tellers")
const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../../outside_connections/firebase/client")

module.exports.clip_status = () =>
    new Promise(async (resolve) => {
        let batch = new BigBatch({firestore: db})

        let hr = await huidige_ronde()

        let clips = await admin_alle_clips()

        let rondes = await admin_alle_rondes()

        for (let clip of clips) {
            let gevonden = rondes.find(o => o.clip === clip.id)

            let juiste_status = 0

            if (gevonden && gevonden.ronde >= hr) {
                juiste_status = 1
            } else if (gevonden && gevonden.ronde < hr) {
                juiste_status = 2
            }

            let payload = {}
            if (clip.status !== juiste_status) payload = {status: juiste_status, ...payload}
            if (gevonden && gevonden.ronde && (!clip.ronde || clip.ronde !== gevonden.ronde)) payload = {ronde: gevonden.ronde, ...payload}
            if (Object.keys(payload).length>0) {
                await batch.update(db.collection('clips').doc(clip.id), payload)
                console.log(`${clip.id} / ${JSON.stringify(payload)}`)
            }
        }
        await batch.commit()
        return resolve(true)
    })
