const {BigBatch} = require('@qualdesk/firestore-big-batch')

const {db} = require('./client')
const moment = require("moment-timezone")

module.exports.stats_winnaars_aantal_dbupdate = (data) => {
    if (data.length > 0) {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})

        let cycle = new Promise((resolve) => {
            let index = 0


            data.forEach(d => {
                batch.set(
                    db.collection('stats').doc('winnaars').collection('aantal').doc(d.gebruiker), d, {merge: true}
                )

                return index++
            })
            if (index === data.length) {
                return resolve()
            }
        })

        return cycle
            .then(() => batch.commit())
    } else {
        return true
    }
}

//STATS
module.exports.stats_inzendingen_aantal_dbupdate = (data) => {
    if (data.length > 0) {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})

        let cycle = new Promise((resolve) => {
            let index = 0


            data.forEach(d => {
                batch.set(
                    db.collection('stats').doc('inzendingen').collection('aantal').doc(d.gebruiker), d, {merge: true}
                )
                return index++
            })
            if (index === data.length) {
                return resolve()
            }
        })

        return cycle
            .then(() => batch.commit())
    }
    return true
}

//STATS
module.exports.stats_inzendingen_speed_dbupdate = (data) => {
    if (data.length > 0) {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})

        let cycle = new Promise((resolve) => {
            let index = 0


            db.collection('stats').doc('inzendingen').collection('speed').get()
                .then(snapshot => {
                    let batchdelete = new BigBatch({firestore: db})
                    snapshot.forEach(doc =>
                        batchdelete.delete(doc.ref)
                    )
                    return batchdelete.commit()
                })
                .then(() => {
                    data.forEach(d => {
                        batch.set(
                            db.collection('stats').doc('inzendingen').collection('speed').doc(String(d.timestamp)), d, {merge: true}
                        )
                        return index++
                    })
                    if (index === data.length) {
                        return resolve()
                    }
                })
        })

        return cycle
            .then(() => batch.commit())
    }
    return true
}

//STATS
module.exports.stats_inzendingen_series_dbupdate = (data) => {
    if (data.length > 0) {

        let batch = new BigBatch({firestore: db})

        db.collection('stats').doc('inzendingen').collection('series').get()
            .then(snapshot => {
                let batchdelete = new BigBatch({firestore: db})
                snapshot.forEach(doc =>
                    batchdelete.delete(doc.ref)
                )
                return batchdelete.commit()
            })
            .then(() =>
                new Promise((resolve) => {
                    let index = 0

                    console.log(`Data size: ${data.length}`)
                    data.forEach(async d => {
                        batch.set(
                            db.collection('stats').doc('inzendingen').collection('series').doc(`${d.gebruiker}-${d.serie[0]}`), d
                        )
                        return index++
                    })
                    if (index === data.length) {
                        batch.commit()
                        return resolve()
                    }
                }))
    }
    return true
}

//STATS
module.exports.stats_rondes_aantal_dbupdate = (data) => {
    if (data.length > 0) {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})

        let cycle = new Promise((resolve) => {
            let index = 0


            data.forEach(d => {
                batch.set(
                    db.collection('stats').doc('rondes').collection('aantal').doc(String(d.ronde)), d, {merge: true}
                )
                return index++
            })
            if (index === data.length) {
                return resolve()
            }
        })

        return cycle
            .then(() => batch.commit())
    }
    return true
}

module.exports.stats_updatetime = () =>
    db.collection('stats').doc('inzendingen').set({updated: String(moment().tz("Europe/Amsterdam").format("HH:mm"))}, {merge: true})

module.exports.stats_alle_inzendingen_dbupdate = (s) =>
    db.collection('stats').doc('inzendingen').set({
        totaal: s
    }, {merge: true})

module.exports.stats_alle_winnaars_dbupdate = (s) =>
    db.collection('stats').doc('winnaars').set({
        totaal: s
    }, {merge: true})

module.exports.stats_winnaars_speed_dbupdate = (data) => {
    if (data.length > 0) {
        // let batch = db.batch()
        const batch = new BigBatch({firestore: db})

        let cycle = new Promise((resolve) => {
            let index = 0


            db.collection('stats').doc('winnaars').collection('speed').get()
                .then(snapshot => {
                    let batchdelete = new BigBatch({firestore: db})
                    snapshot.forEach(doc =>
                        batchdelete.delete(doc.ref)
                    )
                    return batchdelete.commit()
                })
                .then(() => {
                    data.forEach(d => {
                        batch.set(
                            db.collection('stats').doc('winnaars').collection('speed').doc(String(d.timestamp)), d, {merge: true}
                        )
                        return index++
                    })
                    if (index === data.length) {
                        return resolve()
                    }
                })
        })

        return cycle
            .then(() => batch.commit())
    }
    return true
}

module.exports.stats_alle_gebruikers_dbupdate = (s) =>
    db.collection('stats').doc('gebruikers').set({
        totaal: s
    }, {merge: true})

module.exports.stats_clips_statuses_dbupdate = (s) =>
    db.collection('stats').doc('clips').set(s, {merge: true})
