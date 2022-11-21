const {db} = require('./client')

const {Firestore} = require("@bountyrush/firestore")

module.exports.rondescores_naar_nul = () => {
    let batch = db.batch()
    let i = 0
    return db.collection('spelers').get()
        .then(snapshot => {
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    batch.update(
                        db.collection('spelers').doc(doc.id), {rondescore:0}
                    )
                    i++
                    return true
                })
            }
            return true
        })
        .then(() =>
            setTimeout(() => {
                batch.commit()
            }, 1000)
        )
        .then(() =>
            console.log(`${i} rondescores gereset`)
        )
        .catch(e => {
            console.error(JSON.stringify(e))
        })
}

module.exports.zoek_speler = (speler) =>
    new Promise((resolve, reject) => {
        db.collection('spelers').doc(speler).get()
            .then(doc => resolve(doc.data()))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.zoek_spelers_met_reminder = () =>
    new Promise((resolve, reject) => {
        db.collection('spelers').where('reminder', '==', true).get()
            .then(snapshot => {
                let toReturn = []
                if (snapshot.empty) {
                    return {}
                } else {
                    snapshot.forEach(doc => {
                        toReturn.push(doc.id)
                    })
                }
                return toReturn
            })
            .then((toReturn) => {
                return resolve(toReturn)
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.sla_speler_op = (data) =>
    db.collection('spelers').doc(data.speler).set(data, {merge:true})

module.exports.update_rondescore = (speler, rondescore) => db.collection(`spelers`).doc(speler).set({rondescore:rondescore}, {merge:true})

module.exports.rondewinnaar = (ronde) =>
    new Promise((resolve) => {
        let alleScores = []
        db.collection('inzendingen').where('ronde', '==', parseInt(ronde, 10)).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        if (data.beoordeling === 3) {
                            alleScores.push(doc.data())
                        }
                    })
                }
            })
            .then(async () => {
                if (alleScores.length === 0) {
                    return resolve(0)
                } else {
                    alleScores.sort((a, b) => a.timestamp - b.timestamp)
                    // db.collection('spelers').doc(alleScores[0].speler).update({
                    //     winsten:Firestore.FieldValue.increment(1)
                    // })
                    return resolve(alleScores[0].gebruiker)
                }
            })
    })

module.exports.admin_alle_spelers = () =>
    new Promise((resolve, reject) => {
        let toReturn = []
        db.collection('spelers').get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        toReturn.push(doc.data())
                    })
                }
            })
            .then(() => {
                resolve(toReturn)
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.bonus_inzending = ({speler}) =>
    new Promise((resolve, reject) =>
        db.collection('spelers').doc(speler).update({
            bonus:Firestore.FieldValue.increment(1)
        })
            .then(() => {
                resolve(true)
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    )
