const {db} = require('../../outside_connections/firebase/client')
const {huidige_ronde} = require("../../outside_connections/firebase/tellers")
const {BigBatch} = require("@qualdesk/firestore-big-batch")

module.exports.count_artists = () =>
    new Promise(async (resolve) => {
            let batch = new BigBatch({firestore: db})
            let hr = await huidige_ronde()
            let rondes = []
            let artists = []
            db.collection('rondes').where('ronde', '<', parseInt(hr, 10)).get()
                .then(snapshot => {
                    for (let doc of snapshot.docs) {
                        rondes.push({id: doc.data().ronde, clip: doc.data().clip})
                    }
                    return true
                })
                .then(() =>
                    db.collection('clips').where('status', '==', 2).get()
                        .then(snapshot => {
                            for (let doc of snapshot.docs) {
                                let r = rondes.findIndex(o => o.clip === doc.data().id)
                                let i = artists.findIndex(o => o.artiest === doc.data().artiest)
                                if (i >= 0) {
                                    artists[i].count++
                                    artists[i].rondes.push(rondes[r].id)
                                } else {
                                    artists.push({artiest: doc.data().artiest, count: 1, rondes:[rondes[r].id]})
                                }
                            }
                            return true
                        })
                )
                .then(() => {
                    for (let a of artists) {
                        batch.set(db.collection('stats').doc('clips').collection('artiesten').doc(a.artiest.replace('/','')),
                            a, {merge: true}
                        )
                    }
                    return true
                })
                .then(() =>
                    batch.commit()
                )
                .then(() =>
                    resolve(true)
                )

        }
    )
