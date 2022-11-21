const {db} = require('./client')
const moment = require("moment-timezone")

module.exports.huidige_rondedata = () =>
    new Promise((resolve) =>
        db.collection('tellers').doc('huidige_ronde').get()
            .then(doc =>
                db.collection('rondes').doc(String(doc.data().id)).get()
            )
            .then(doc =>
                resolve(doc.data())
            )
    )

module.exports.zoek_ronde_op_timestamp = (timestamp) =>
    new Promise((resolve, reject) => {
        return db.collection(`rondes`).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let rondestart = moment.tz(`${doc.data().start} 20:15:00`, "Europe/Amsterdam").utc()
                        if (parseInt(timestamp, 10) >= parseInt(rondestart.format("x"), 10) &&
                            parseInt(timestamp, 10) < parseInt(rondestart.add(1, "days").format("x"), 10)) {
                            return resolve(doc.data())
                        }
                    })
                    return reject([])
                } else {
                    return reject([])
                }
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.zoek_ronde_op_nummer = (ronde) =>
    new Promise((resolve, reject) => {
        db.collection(`rondes`).where(`ronde`, "==", parseInt(ronde, 10)).limit(1).get()
            .then(snapshot => {
                let i = 0
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                            i === 0 && resolve(doc.data())
                            i++
                        }
                    )
                }
            })
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.admin_alle_rondes = () =>
    new Promise((resolve, reject) => {
        let toReturn = []
        db.collection('rondes').get()
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

module.exports.voeg_ronde_toe = (data) =>
    new Promise((resolve, reject) =>
        db.collection('rondes').doc(String(data.ronde)).set(data)
            .then(() => {
                return resolve(true)
            })
            .catch((e) => {
                console.error(JSON.stringify(e))
                return reject(true)
            }))

module.exports.sla_tweetid_op = ({ronde, tweet_id}) =>
    new Promise((resolve, reject) =>
        db.collection('rondes').doc(String(ronde)).update({tweet_id: String(tweet_id)})
            .then(() => {
                return resolve(true)
            })
            .catch((e) => {
                console.error(JSON.stringify(e))
                return reject(true)
            })
    )
