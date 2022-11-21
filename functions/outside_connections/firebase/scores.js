const {db} = require('./client')
const {tweet_versturen} = require("../twitter/statuses")

module.exports.check_dubbel_antwoord = ({ronde, speler}) =>
    new Promise((resolve, reject) => {
        return db.collection('scores').where('ronde', '==', parseInt(ronde, 10)).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        if (data.speler === speler && data.beoordeling === 3) {
                            return resolve('dubbel')
                        }
                    })
                }
            })
            .then(() => resolve(null))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.zoek_scores_bij_ronde = (ronde) =>
    new Promise((resolve, reject) => {
        let toReturn = []
        return db.collection('scores').where('ronde', '==', parseInt(ronde, 10)).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        if (data.beoordeling === 3) {
                            toReturn.push({id:doc.id,...doc.data()})
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

module.exports.sla_score_op = ({speler_naam, bron, ronde, timestamp, beoordeling}) =>
    db.collection('scores').doc(timestamp.toString()).set({
        speler: speler_naam,
        ronde: ronde,
        timestamp: timestamp,
        beoordeling: beoordeling || 0,
        bron: bron
    }, {merge: true}).then(() =>
            beoordeling === 3 && db.collection('dms').doc(timestamp.toString()).set({
                score: true
            }, {merge: true})
    )

module.exports.zoek_rondescore = ({speler, ronde}) =>
    new Promise((resolve) =>
        db.collection('scores').where('speler', '==', speler).get()
            .then(snapshot => {
                let max_beoordeling = 0
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        if (parseInt(data.ronde, 10) === parseInt(ronde, 10) && data.beoordeling > max_beoordeling) {
                            max_beoordeling = data.beoordeling
                        }
                    })
                    return resolve(parseInt(max_beoordeling, 10))
                } else {
                    return resolve(0)
                }
            })
    )

module.exports.feestscore = ({speler_naam}) =>
    db.collection('scores').where('beoordeling', '==', 3).get()
        .then(snapshot => {
            let antwoorden = snapshot.docs.length
            if ((antwoorden + 1) % 500 === 0) {
                tweet_versturen(`Zojuist heeft @${speler_naam} het ${antwoorden+1}e antwoord gegeven in de #videoclipgifquiz!`)
            }
            return true
        })

module.exports.zoek_nieuwste_score = () =>
    new Promise((resolve, reject) =>
        db.collection('scores').orderBy('timestamp', 'desc').limit(1).get()
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

module.exports.zoek_stat_score = () =>
    new Promise((resolve, reject) =>
        db.collection('stats').doc('scores').get()
            .then(doc => {
                let data = doc.data()
                return resolve(data.nieuwste_score)
            })
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.schrijf_stat_score = (timestamp) =>
    new Promise((resolve, reject) =>
        db.collection('stats').doc('scores').set({
            nieuwste_score: timestamp
        }, {merge: true})
            .then(() => resolve(true))
            .catch(e => {
                console.log(JSON.stringify(e))
                return reject(null)
            })
    )

module.exports.verwijder_score=(id)=>
    new Promise((resolve,reject)=> {
        console.log('Score verwijderen:',id)
            db.collection('scores').doc(id).set({beoordeling:0},{merge:true})
                .then(()=>
                    db.collection('dms').doc(id).set({score:false},{merge:true})
                )
                .then(()=>
                    db.collection('inzendingen').doc(id).set({beoordeling:0},{merge:true})
                )
                .then(()=>
                    resolve(true)
                )
                .catch(e => {
                    console.log(JSON.stringify(e))
                    return reject(null)
                })
        }
    )
