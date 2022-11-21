const {db} = require('./client')

module.exports.dm_opslaan = ({speler_naam, speler_id, timestamp, tekst,medium}) =>
    db.collection('dms').doc(timestamp).set({
        speler_id: speler_id,
        speler_naam: speler_naam,
        tekst: tekst,
        timestamp: parseInt(timestamp, 10),
        medium: medium
    }, {merge: true})

module.exports.zoek_dm = (id) =>
    new Promise((resolve, reject) =>
        db.collection('dms').doc(String(id)).get()
            .then(doc => resolve(doc.data()))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    )

module.exports.admin_alle_dms = () =>
    new Promise((resolve, reject) => {
        let toReturn = []
        db.collection('dms').get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        toReturn.push({id: doc.id, ...doc.data()})
                    })
                } else {
                    return resolve([])
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
