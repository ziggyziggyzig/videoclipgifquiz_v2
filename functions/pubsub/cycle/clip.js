const {db} = require("../../outside_connections/firebase/client")

module.exports.cycle_clip_all = () =>
    new Promise(async resolve => {
        let clips = await db.collection('clips').get()
        let toResolve = []
        for (let clip of clips.docs) {
            toResolve.push(clip.data())
        }
        return resolve(toResolve)
    })
