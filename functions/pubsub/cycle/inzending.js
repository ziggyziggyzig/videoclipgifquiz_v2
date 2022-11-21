const {db} = require("../../outside_connections/firebase/client")
const {BigBatch} = require("@qualdesk/firestore-big-batch")

module.exports.cycle_inzending_all_correct = () =>
    new Promise(async resolve => {
        let inzendingen = await db.collection('inzendingen').where('beoordeling', '==', 3).get()
        let toResolve = []
        for (let inzending of inzendingen.docs) {
            toResolve.push(inzending.data())
        }
        toResolve.sort((a, b) => a.timestamp - b.timestamp)
        return resolve(toResolve)
    })

module.exports.cycle_inzending_speeds=(all_corrects,all_rounds)=>
    new Promise(async resolve => {
        console.log('CYCLE_INZENDING: SPEEDS')
        let batch = new BigBatch({firestore:db})
        for (let c of all_corrects) {
            if (!c.SPEED && c.timestamp && c.ronde > 0) {
                let start_timestamp = all_rounds.find(o => o.ronde === c.ronde).TIMESTAMP_START
                let speed = c.timestamp - start_timestamp
                await batch.update(db.collection('inzendingen').doc(String(c.timestamp)), {
                    SPEED:speed
                })
            }
        }
        await batch.commit()
        return resolve(true)
    })
