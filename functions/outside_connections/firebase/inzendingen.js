const {db} = require("./client")
const {tweet_versturen} = require("../twitter/statuses")

module.exports.sla_inzending_op = ({gebruiker, timestamp, tekst, script, medium, ronde, beoordeling}) =>
    db.collection('inzendingen').doc(timestamp.toString()).set({
        gebruiker: gebruiker,
        ronde: parseInt(ronde, 10),
        timestamp: parseInt(timestamp, 10),
        beoordeling: parseInt(beoordeling, 10) || 0,
        tekst: tekst,
        script: script,
        medium: medium
    }, {merge: true})
        .then(e => {
            console.log('--- sla_inzending_op ---', JSON.stringify(e))
            return true
        })
        .catch(e => {
            console.error('--- sla_inzending_op ---', JSON.stringify(e))
            return true
        })

module.exports.zoek_inzending = (id) =>
    new Promise((resolve, reject) =>
        db.collection('inzendingen').doc(String(id)).get()
            .then(doc => resolve(doc.data()))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    )

module.exports.zoek_correcte_inzendingen_bij_ronde = (ronde) =>
    new Promise((resolve, reject) => {
        let toReturn = []
        return db.collection('inzendingen').where('ronde', '==', parseInt(ronde, 10)).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        if (data.beoordeling === 3) {
                            toReturn.push({id: doc.id, ...doc.data()})
                        }
                    })
                }
            })
            .then(() => resolve(toReturn))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.zoek_nieuwste_inzending = () =>
    new Promise((resolve, reject) =>
        db.collection('inzendingen').orderBy('timestamp', 'desc').limit(1).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        return resolve(data.timestamp)
                    })
                }
            })
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.zoek_nieuwste_correcte_inzending = () =>
    new Promise((resolve, reject) =>
        db.collection('inzendingen').orderBy('timestamp', 'desc').where('beoordeling','==',3).limit(1).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        return resolve(data.timestamp)
                    })
                }
            })
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.zoek_stat_inzending = () =>
    new Promise((resolve, reject) =>
        db.collection('stats').doc('inzendingen').get()
            .then(doc => {
                let data = doc.data()
                return resolve(data.nieuwste_inzending)
            })
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.schrijf_stat_inzending = (timestamp) =>
    new Promise((resolve, reject) =>
        db.collection('stats').doc('inzendingen').set({
            nieuwste_inzending: timestamp
        }, {merge: true})
            .then(() => resolve(true))
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.zoek_feest_inzending = () =>
    new Promise((resolve, reject) =>
        db.collection('tellers').doc('feestscore').get()
            .then(doc => {
                let data = doc.data()
                return resolve(data.nieuwste_inzending)
            })
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.schrijf_feest_inzending = (timestamp) =>
    new Promise((resolve, reject) =>
        db.collection('tellers').doc('feestscore').set({
            nieuwste_inzending: timestamp
        }, {merge: true})
            .then(() => resolve(true))
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.feestinzending = ({speler_naam}) =>
    db.collection('inzendingen').where('beoordeling', '==', 3).get()
        .then(async snapshot => {
            let antwoorden = snapshot.docs.length
            if ((antwoorden + 1) % 500 === 0) {
                await tweet_versturen(`Zojuist heeft @${speler_naam} het ${antwoorden + 1}e antwoord gegeven in de #videoclipgifquiz!`)
            }
            return true
        })

module.exports.alle_inzendingen=({correct})=>
    new Promise((resolve)=> {
        let toReturn = []
        return correct ?
            db.collection('inzendingen').where('beoordeling', '==', 3).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        toReturn.push({id: doc.id, ...doc.data()})
                    })
                    return resolve(toReturn)
                })
            :
            db.collection('inzendingen').get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        toReturn.push({id: doc.id, ...doc.data()})
                    })
                    return resolve(toReturn)
                })
    })

module.exports.tel_alle_inzendingen=({correct})=>
    new Promise((resolve)=> {
        return correct ?
            db.collection('inzendingen').where('beoordeling', '==', 3).get()
                .then(snapshot => {
                    return resolve(snapshot.size)
                })
            :
            db.collection('inzendingen').get()
                .then(snapshot => {
                    return resolve(snapshot.size)
                })
    })