const {db}=require('./client')
const {Firestore} = require("@bountyrush/firestore")
const {BigBatch} = require('@qualdesk/firestore-big-batch')

module.exports.zoek_clip = (clip) =>
    new Promise((resolve, reject) => {
        db.collection('clips').doc(clip).get()
            .then(doc => resolve(doc.data()))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.admin_alle_clips = () =>
    new Promise((resolve, reject) => {
        let toReturn = []
        db.collection('clips').get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        toReturn.push({id: doc.id, ...doc.data()})
                    })
                }
            })
            .then(() => {
                return resolve(toReturn)
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.admin_update_clips = (toUpdate) => {
    try {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})
        let cycle = new Promise((resolve) => {
            let index = 0
            toUpdate.forEach(i => {
                batch.update(
                    db.collection('clips').doc(i.id), i
                )
                return index++
            })
            if (index === toUpdate.length) {
                return resolve()
            }
        })

        return cycle
            .then(() => {
                console.log(`Updated ${toUpdate.length} documents`)
                toUpdate.length > 0 && batch.commit()
            })
            .then(() => {
                return true
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return false
            })
    } catch (e) {
        console.error(JSON.stringify(e))
        return false
    }
}

module.exports.verander_status = (clip, status) =>
    db.collection('clips').doc(clip).update({
        status: status
    })

module.exports.schrijf_mediaId=(clip, mediaId)=>
    db.collection('clips').doc(clip).update({
        twitter_mediaId: mediaId
    })

module.exports.delete_status = () =>
    db.collection('clips').get()
        .then(snapshot => {
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    db.collection('clips').doc(doc.id).update({
                        status: Firestore.FieldValue.delete()
                    })
                })
            }
        })
