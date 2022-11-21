const {BigBatch} = require('@qualdesk/firestore-big-batch')
const {db, db_fb} = require('./client')

module.exports.stats_winnaar_aantal_plus = async (gebruiker) => {
    let docRef = db.collection('stats').doc('winnaars').collection('aantal').doc(gebruiker)
    let w = await docRef.get()
    w.exists ?
        await docRef.update({count:w.data().count + 1})
        :
        await docRef.set({gebruiker:gebruiker, count:1})

    return true
}
