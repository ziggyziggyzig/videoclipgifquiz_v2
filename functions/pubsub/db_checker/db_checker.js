const moment = require("moment-timezone")
const {db} = require("../../outside_connections/firebase/client")
const {split_en_tweet} = require("../../outside_connections/twitter-api-v2/statuses")
const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {snapshot_to_array} = require("../../helpers/arrays")

module.exports.db_checker = () =>
    new Promise(async (resolve) => {
        let batch = new BigBatch({firestore:db})
        let batch_gevuld = false
        let own_accounts = ['Treindienstldr', 'regenrace', 'videoclipquiz', 'ziggyziggyzig']

// LAAD DATA

// ALTIJD
        let tellers = await snapshot_to_array(await db.collection('tellers').get())
        let huidige_ronde = tellers.filter(doc => doc.doc_id === "huidige_ronde")[0].id

        let inzendingen = await snapshot_to_array(await db.collection('inzendingen').get())
        inzendingen.sort((a, b) => a.timestamp - b.timestamp)
        let correcte_inzendingen = inzendingen.filter(o => o.beoordeling === 3)
        let nieuwste_inzending = correcte_inzendingen[correcte_inzendingen.length - 1]
        let feest_inzending = tellers.filter(doc => doc.doc_id === "feestscore")[0].nieuwste_inzending

        let rondes = await snapshot_to_array(await db.collection('rondes').get())

        let clips = await snapshot_to_array(await db.collection('clips').get())


// EIGEN ACCOUNTS VERWIJDEREN, DAGELIJKS VOOR EEN NIEUWE RONDE
        if (parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) > 1945 && parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) <= 2015) {
            console.log('eigen accounts verwijderen')
            let dms = await snapshot_to_array(await db.collection('dms').get())
            let remove_from_dms = dms.filter(o => own_accounts.includes(o.speler_naam))
            for (let i of remove_from_dms) {
                console.log(`deleting ${i.doc_ref}`)
                batch.delete(i.doc_ref)
                batch_gevuld = true
            }
            let remove_from_inzendingen = inzendingen.filter(o => own_accounts.includes(o.gebruiker))
            for (let i of remove_from_inzendingen) {
                console.log(`deleting ${i.doc_ref}`)
                batch.delete(i.doc_ref)
                batch_gevuld = true
            }
            let spelers = await snapshot_to_array(await db.collection('spelers').get())
            for (let i of own_accounts) {
                if (spelers.find(o => o.doc_id === i)) {
                    console.log(`deleting ${i.doc_ref}`)
                    batch.delete(db.collection('spelers').doc(i))
                    batch_gevuld = true
                }
            }
        }

        // ALLEEN BIJ EEN NIEUWE INZENDING
        if (nieuwste_inzending.timestamp && feest_inzending && nieuwste_inzending.timestamp !== feest_inzending) {

            // FEESTSCORES CHECKEN
            console.log('feestscores checken')
            let laatste_feestcount = tellers.filter(doc => doc.doc_id === "feestscore")[0].count
            if (correcte_inzendingen.length - laatste_feestcount >= 500) {
                let nieuwe_feestcount = correcte_inzendingen.length - (correcte_inzendingen.length % 500)
                console.log(`--- feestscore --- Hoera! ${nieuwe_feestcount} is een nieuwe feestscore!`)
                batch.update(db.collection('tellers').doc('feestscore'),
                    {
                        count:nieuwe_feestcount,
                        nieuwste_inzending:nieuwste_inzending.timestamp
                    })
                batch_gevuld = true
                let feestbeest = correcte_inzendingen[nieuwe_feestcount - 1].gebruiker
                await split_en_tweet(`Zojuist heeft @${feestbeest} het ${nieuwe_feestcount}e antwoord gegeven in de #videoclipgifquiz!`)
            }

        }


// BONUSPUNTEN TELLEN, ALLEEN NA EEN BONUSRONDE
        if ((huidige_ronde - 1) % 100 === 0 && parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) > 2015 && parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) <= 2045) {
            console.log('bonuspunten tellen')
            let bonusrondes = []
            for (let i of rondes) {
                if (i.bonus) bonusrondes.push(parseInt(i.doc_id, 10))
            }
            let bonusinzendingen = correcte_inzendingen.filter(o => bonusrondes.includes(o.ronde))
            let bonusspelers = []
            for (let b of bonusinzendingen) {
                let i = bonusspelers.findIndex(o => o.gebruiker === b.gebruiker)
                if (i > -1) {
                    bonusspelers[i].count++
                } else {
                    bonusspelers.push({gebruiker:b.gebruiker, count:1})
                }
            }
            for (let b of bonusspelers) {
                batch.update(db.collection('spelers').doc(b.gebruiker), {bonus:b.count})
                batch_gevuld = true
            }
        }

// CLIPSTATUSSEN VERIFIEREN
        console.log('clipstatussen verifiëren')
        for (let c of clips) {
            let gevonden_ronde = rondes.find(o => o.clip === c.doc_id)

            let juiste_status = 0

            if (gevonden_ronde && gevonden_ronde.ronde >= huidige_ronde) {
                juiste_status = 1
            } else if (gevonden_ronde && gevonden_ronde.ronde < huidige_ronde) {
                juiste_status = 2
            }
            let payload = {}
            if (c.status !== juiste_status) payload = {status:juiste_status, ...payload}
            if (gevonden_ronde && gevonden_ronde.ronde && (!c.ronde || c.ronde !== gevonden_ronde.ronde)) payload = {ronde:gevonden_ronde.ronde, ...payload}
            if (Object.keys(payload).length > 0) {
                await batch.update(db.collection('clips').doc(c.id), payload)
                batch_gevuld = true
                console.log(`clipstatus gewijzigd: ${c.id} => ${JSON.stringify(payload)}`)
            }
        }

        // NA IEDERE RONDE
        if (parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) > 2015 && parseInt(moment().tz('Europe/Amsterdam').format('HHmm'), 10) <= 2045) {


// ARTIESTEN TELLEN
            console.log('artiesten tellen')
            let oude_clips = clips.filter(o => o.status === 2)
            let artiesten = []

            for (let c of oude_clips) {
                let artiest = c.artiest.replaceAll(" feat. ", " & ")
                artiest = artiest.replaceAll(" feat ", " & ")
                artiest=artiest.replaceAll(" vs. "," & ")
                let artiestsplit = artiest.split(" & ")
                for (let a of artiestsplit) {
                    let i = artiesten.findIndex(o => o.artiest === a)
                    let r = rondes.find(o => o.clip === c.doc_id)
                    if (i > -1) {
                        artiesten[i].count++
                        artiesten[i].rondes.push(r.ronde)
                    } else {
                        artiesten.push({artiest:a, count:1, rondes:[r.ronde]})
                    }
                }
            }
            for (let a of artiesten) {
                batch.set(db.collection('stats').doc('clips').collection('artiesten').doc(a.artiest.replace('/', '')),
                    a, {merge:true}
                )
                batch_gevuld = true
            }

// JAREN TELLEN
            console.log('jaartallen tellen')
            let jaren = []
            for (let c of oude_clips) {
                if (c.ronde && c.jaar && c.jaar !== 0) {
                    let i = jaren.findIndex(o => o.jaar === c.jaar)
                    if (i > -1) {
                        jaren[i].count++
                    } else {
                        jaren.push({jaar:c.jaar, count:1})
                    }
                }
            }
            for (let j of jaren) {
                batch.set(db.collection('stats').doc('clips').collection('jaren').doc(`${j.jaar}`),
                    j, {merge:true}
                )
                batch_gevuld = true
            }

        }

// ALLES COMMITTEN NAAR DB
        if (batch_gevuld) {
            console.log('Items in batch')
            await batch.commit()
        } else {
            console.log('Geen items in batch')
        }
        return resolve(true)
    })
