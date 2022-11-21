const {db} = require("../../outside_connections/firebase/client")
const moment = require("moment-timezone")
const {converteer_tijdzones} = require("../../helpers/time")

module.exports.cycle_ronde_all = (end = null) =>
    new Promise(async resolve => {
        let rondes
        if (end) {
            rondes = await db.collection('rondes').where('ronde', '<=', end).get()
        } else {
            rondes = await db.collection('rondes').get()
        }
        let toResolve = []
        for (let ronde of rondes.docs) {
            toResolve.push(ronde.data())
        }
        toResolve.sort((a, b) => a.ronde - b.ronde)
        return resolve(toResolve)
    })

module.exports.cycle_ronde_correct_count = (ronde, alle_correcte_inzendingen) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: CORRECT_COUNT (${ronde})`)
        let teller = 0
        for (let een_correcte_inzending of alle_correcte_inzendingen) {
            if (een_correcte_inzending.ronde === ronde) teller++
        }
        await db.collection('rondes').doc(String(ronde)).update({
            CORRECT_COUNT:teller
        })
        return resolve(true)
    })

module.exports.cycle_ronde_correct_first = (ronde, alle_correcte_inzendingen) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: CORRECT_FIRST (${ronde})`)
        let alle_correcte_inzendingen_deze_ronde = []
        for (let een_correcte_inzending of alle_correcte_inzendingen) {
            if (een_correcte_inzending.ronde === ronde) {
                alle_correcte_inzendingen_deze_ronde.push(een_correcte_inzending)
            }
        }
        alle_correcte_inzendingen_deze_ronde.sort((a, b) => a.timestamp - b.timestamp)
        let overwinning_deze_ronde = alle_correcte_inzendingen_deze_ronde[0]
        await db.collection('rondes').doc(String(ronde)).update({
            CORRECT_FIRST:overwinning_deze_ronde
        })
        return resolve(true)
    })

module.exports.cycle_ronde_correct_last = (ronde, alle_correcte_inzendingen) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: CORRECT_LAST (${ronde})`)
        let alle_correcte_inzendingen_deze_ronde = []
        for (let een_correcte_inzending of alle_correcte_inzendingen) {
            if (een_correcte_inzending.ronde === ronde) {
                alle_correcte_inzendingen_deze_ronde.push(een_correcte_inzending)
            }
        }
        alle_correcte_inzendingen_deze_ronde.sort((a, b) => b.timestamp - a.timestamp)
        let laatste_correcte_inzending_deze_ronde = alle_correcte_inzendingen_deze_ronde[0]
        await db.collection('rondes').doc(String(ronde)).update({
            CORRECT_LAST:{
                gebruiker:laatste_correcte_inzending_deze_ronde.gebruiker,
                medium:laatste_correcte_inzending_deze_ronde.medium,
                timestamp:laatste_correcte_inzending_deze_ronde.timestamp
            }
        })
        return resolve(true)
    })

module.exports.cycle_ronde_speed_first = (ronde) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: SPEED_FIRST (${ronde})`)
        let relevante_ronde = await db.collection('rondes').doc(String(ronde)).get()
        if (relevante_ronde.data().CORRECT_FIRST) {
            let ronde_starttijd = `${relevante_ronde.data().start} 20:15:00`
            let ronde_starttijd_timestamp = parseInt(moment.tz(ronde_starttijd, "Europe/Amsterdam").tz("UTC").format("x"), 10)
            let eerste_correcte_inzending_timestamp = relevante_ronde.data().CORRECT_FIRST.timestamp
            let tijdsduur = eerste_correcte_inzending_timestamp - ronde_starttijd_timestamp
            await db.collection('rondes').doc(String(ronde)).update({
                SPEED_FIRST:tijdsduur
            })
        }
        return resolve(true)
    })

module.exports.cycle_ronde_speed_last = (ronde) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: SPEED_LAST (${ronde})`)
        let relevante_ronde = await db.collection('rondes').doc(String(ronde)).get()
        if (relevante_ronde.data().CORRECT_LAST) {
            let ronde_starttijd = `${relevante_ronde.data().start} 20:15:00`
            let ronde_starttijd_timestamp = parseInt(moment.tz(ronde_starttijd, "Europe/Amsterdam").tz("UTC").format("x"), 10)
            let laatste_correcte_inzending_timestamp = relevante_ronde.data().CORRECT_LAST.timestamp
            let tijdsduur = laatste_correcte_inzending_timestamp - ronde_starttijd_timestamp
            await db.collection('rondes').doc(String(ronde)).update({
                SPEED_LAST:tijdsduur
            })
        }
        return resolve(true)
    })

module.exports.cycle_ronde_medium_count = (ronde, alle_correcte_inzendingen) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: MEDIUM_COUNT (${ronde})`)
        let alle_correcte_inzendingen_deze_ronde = []
        for (let een_correcte_inzending of alle_correcte_inzendingen) {
            if (een_correcte_inzending.ronde === ronde) {
                alle_correcte_inzendingen_deze_ronde.push(een_correcte_inzending)
            }
        }
        let media_teller = {twitter:0, website:0}
        for (let een_correcte_inzending of alle_correcte_inzendingen_deze_ronde) {
            if (een_correcte_inzending.beoordeling === 3 && een_correcte_inzending.medium === "website") {
                media_teller.website++
            } else if (een_correcte_inzending.beoordeling === 3 && een_correcte_inzending.medium === "twitter") {
                media_teller.twitter++
            }
        }
        await db.collection('rondes').doc(String(ronde)).update({
            MEDIUM_COUNT:media_teller
        })
        return resolve(true)
    })

module.exports.cycle_ronde_timestamp_start = (ronde) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: TIMESTAMP_START (${ronde})`)
        let relevante_ronde = await db.collection('rondes').doc(String(ronde)).get()
        if (relevante_ronde.data().start) {
            let starttijd_timestamp = parseInt(
                converteer_tijdzones(
                    `${relevante_ronde.data().start} 20:15:00`,
                    "YYYY-MM-DD HH:mm:ss",
                    "x",
                    "Europe/Amsterdam",
                    "UTC"
                ),
                10
            )
            await db.collection('rondes').doc(String(ronde)).update({
                TIMESTAMP_START:starttijd_timestamp
            })

        }
        return resolve(true)
    })

module.exports.cycle_ronde_timestamp_end = (ronde) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: TIMESTAMP_END (${ronde})`)
        let round = await db.collection('rondes').doc(String(ronde + 1)).get()
        if (round.data() && round.data().start) {
            let timestamp = parseInt(
                converteer_tijdzones(
                    `${round.data().start} 20:15:00`,
                    "YYYY-MM-DD HH:mm:ss",
                    "x",
                    "Europe/Amsterdam",
                    "UTC"
                ),
                10
            )
            await db.collection('rondes').doc(String(ronde)).update({
                TIMESTAMP_END:timestamp
            })

        }
        return resolve(true)
    })

module.exports.cycle_ronde_season_episode = (ronde) =>
    new Promise(async resolve => {
        console.log(`CYCLE_RONDE: SEASON_EPISODE (${ronde})`)
        let round = await db.collection('rondes').doc(String(ronde)).get()
        if (round.data() && round.data().TIMESTAMP_START) {
            let quiz_start = moment(1637003700000)
            let season = moment(round.data().TIMESTAMP_START+7200000).diff(quiz_start, 'years') + 1
            let season_start = quiz_start.add(season - 1, 'years')
            let episode = moment(round.data().TIMESTAMP_START+7200000).diff(season_start, 'days') + 1
            await db.collection('rondes').doc(String(ronde)).update({
                SEASON: season,
                EPISODE: episode
            })
        }
        return resolve(true)
    })
