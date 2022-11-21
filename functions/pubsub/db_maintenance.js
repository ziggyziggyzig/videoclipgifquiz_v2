const {admin_alle_clips, admin_update_clips} = require("../outside_connections/firebase/clips")
const {admin_alle_rondes} = require("../outside_connections/firebase/rondes")
const {huidige_ronde} = require("../outside_connections/firebase/tellers")
const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../outside_connections/firebase/client")
const moment = require("moment-timezone")

module.exports.check_clips_en_rondes = () =>
    new Promise(async (resolve, reject) => {
        let nu = parseInt(moment().format("x"), 10)
        let toUpdate = []
        let huidigeRonde = await huidige_ronde()
        let alleRondes = await admin_alle_rondes()
        return admin_alle_clips()
            .then((clips) => {
                console.log(`Checking ${clips.length} clips met ${alleRondes.length} rondes`)
                return clips.forEach(async clip => {
                    let status = 0
                    let ronde = alleRondes.find(o => o.clip === clip.id)
                    if (ronde && ronde.ronde >= huidigeRonde) {
                        status = 1
                    } else if (ronde && ronde.ronde < huidigeRonde) {
                        status = 2
                    }
                    if (!clip.x_artiest || !clip.x_titel) {
                        toUpdate.push({...clip, regex_check: false, status: status, ronde: ronde ? ronde.ronde : null})
                    } else if (!new RegExp(clip.x_artiest, "ig").test(clip.artiest) || !new RegExp(clip.x_titel, "ig").test(clip.titel)) {
                        toUpdate.push({...clip, regex_check: false, status: status, ronde: ronde ? ronde.ronde : null})
                    } else if ((!clip.regex_check || clip.regex_check === false) && clip.x_artiest && clip.x_titel && new RegExp(clip.x_artiest, "ig").test(clip.artiest) && new RegExp(clip.x_titel, "ig").test(clip.titel)) {
                        toUpdate.push({...clip, regex_check: true, status: status, ronde: ronde ? ronde.ronde : null})
                    } else {
                        toUpdate.push({...clip, status: status, ronde: ronde ? ronde.ronde : null})
                    }
                    return true
                })
            })
            .then(() => {
                if (toUpdate.length > 0) {
                    admin_update_clips(toUpdate)
                }
                return true
            })
            .then(() => console.log("Einde check_clips_en_rondes", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
            .catch(e => {
                console.error(JSON.stringify(e))
                return reject(e)
            })
    })

module.exports.remove_own_accounts = () =>
    new Promise(async (resolve) => {
        const {db} = require('../outside_connections/firebase/client')
        let batch = new BigBatch({firestore: db})

        db.collection('dms').where('speler_naam', '==', 'Treindienstldr').get()
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('scores').where('speler', '==', 'Treindienstldr').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('inzendingen').where('gebruiker', '==', 'Treindienstldr').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() =>
                db.collection('dms').where('speler_naam', '==', 'regenrace').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('scores').where('speler', '==', 'regenrace').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('inzendingen').where('gebruiker', '==', 'regenrace').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() =>
                db.collection('dms').where('speler_naam', '==', 'videoclipquiz').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('scores').where('speler', '==', 'videoclipquiz').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('inzendingen').where('gebruiker', '==', 'videoclipquiz').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() =>
                db.collection('dms').where('speler_naam', '==', 'ziggyziggyzig').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('scores').where('speler', '==', 'ziggyziggyzig').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('inzendingen').where('gebruiker', '==', 'ziggyziggyzig').get())
            .then(snapshot =>
                snapshot.forEach(doc => {
                    batch.delete(doc.ref)
                    console.log(JSON.stringify(doc.data()))
                    return true
                }))
            .then(() => db.collection('spelers').doc('Treindienstldr').delete())
            .then(() => db.collection('spelers').doc('regenrace').delete())
            .then(() => db.collection('spelers').doc('videoclipquiz').delete())
            .then(() => db.collection('spelers').doc('ziggyziggyzig').delete())
            .then(() =>
                batch.commit()
            )
            .then(() =>
                resolve(true))
    })

module.exports.tel_bonuspunten = () =>
    new Promise(async (resolve) => {
        let batch = new BigBatch({firestore: db})

        let zoek_rondes = () =>
            new Promise((res) => {
                let bonusrondes = []
                db.collection('rondes').where('bonus', '==', true).get()
                    .then(sRondes => {
                        if (!sRondes.empty) {
                            sRondes.forEach(doc =>
                                bonusrondes.push(parseInt(doc.id, 10))
                            )
                        }
                    })
                    .then(() =>
                        res(bonusrondes)
                    )
            })

        let zoek_scores = (ronde) =>
            new Promise(res => {
                let bonusscores = []
                db.collection('inzendingen').where('ronde', '==', ronde).get()
                    .then(sInzendingen => {
                        if (!sInzendingen.empty) {
                            sInzendingen.forEach(doc => {
                                if (doc.data().beoordeling === 3) {
                                    bonusscores.push(doc.data().gebruiker)
                                }
                                return true
                            })
                        }
                    })
                    .then(() =>
                        res(bonusscores)
                    )
            })

        let bonusrondes = await zoek_rondes()
        let alle_punten = []
        for (const b of bonusrondes) {
            let punten = await zoek_scores(b)
            for (let s of punten) {
                let i = alle_punten.findIndex(o => o.gebruiker === s)
                if (i > -1) {
                    alle_punten[i] = {gebruiker: s, count: alle_punten[i].count + 1}
                } else {
                    alle_punten.push({gebruiker: s, count: 1})
                }
            }
        }
        for (let p of alle_punten) {
            batch.update(db.collection('spelers').doc(p.gebruiker), {bonus: p.count})
        }
        batch.commit()
            .then(() =>
                resolve(true))
    })
