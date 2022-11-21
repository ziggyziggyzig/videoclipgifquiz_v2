const {
    stats_winnaars_aantal_dbupdate,
    stats_inzendingen_aantal_dbupdate,
    stats_inzendingen_speed_dbupdate,
    stats_inzendingen_series_dbupdate,
    stats_rondes_aantal_dbupdate,
    stats_alle_inzendingen_dbupdate,
    stats_alle_winnaars_dbupdate,
    stats_alle_gebruikers_dbupdate,
    stats_clips_statuses_dbupdate, stats_winnaars_speed_dbupdate
} = require("../outside_connections/firebase/stats")
const {huidige_ronde} = require("../outside_connections/firebase/tellers")
const {admin_alle_clips} = require("../outside_connections/firebase/clips")
const {admin_alle_rondes} = require("../outside_connections/firebase/rondes")
const {zoek_correcte_inzendingen_bij_ronde} = require("../outside_connections/firebase/inzendingen")
const moment = require("moment-timezone")

module.exports.stats_winnaars_speed_aantal = () =>
    new Promise(async (resolve) => {
        let r = await huidige_ronde()
        let aantalToDB = []
        let speedToDB = []
        for (let i = 1; i <= r; i++) {
            let inzendingen = await zoek_correcte_inzendingen_bij_ronde(i)
            inzendingen.sort((a, b) => parseInt(a.timestamp, 10) < parseInt(b.timestamp, 10) ? -1 : 1)
            let winnaar = aantalToDB.find(a => a.gebruiker === inzendingen[0].gebruiker)
            let rondedag = moment(parseInt(inzendingen[0].timestamp, 10)).format("YYYY-MM-DD [20:15:00]")
            let rondestart = parseInt(moment.tz(rondedag, "Europe/Amsterdam").tz("UTC").format("x"), 10)
            let speed = parseInt(inzendingen[0].timestamp, 10) - rondestart
            if (speed < 0) {
                speed += 24 * 60 * 60 * 1000
            }
            speedToDB.push({speed: speed, ...inzendingen[0]})
            if (winnaar) {
                winnaar.count++
            } else {
                aantalToDB.push({gebruiker: inzendingen[0].gebruiker, count: 1})
            }
        }
        stats_alle_winnaars_dbupdate(aantalToDB.length)
        stats_winnaars_speed_dbupdate(speedToDB)
        stats_winnaars_aantal_dbupdate(aantalToDB)
        return resolve(true)
    })

module.exports.stats_inzendingen_aantal_speed_series = () =>
    new Promise(async (resolve) => {
        let alleinzendingen = 0
        let r = await huidige_ronde()
        let inzendingen_toDB = []
        let speed_toDB = []
        let consec_inzendingen_populate = []
        let rondes_aantal_toDB = []
        for (let i = 1; i <= r; i++) {
            let inzendingen = await zoek_correcte_inzendingen_bij_ronde(i)
            alleinzendingen += inzendingen.length
            inzendingen.forEach(s => {
                if (s.gebruiker === "Treindienstldr") {
                    return true
                }
                // Aantal inzendingen per gebruiker
                let gebruiker = inzendingen_toDB.find(a => a.gebruiker === s.gebruiker)
                if (gebruiker) {
                    gebruiker.count++
                } else {
                    inzendingen_toDB.push({gebruiker: s.gebruiker, count: 1})
                }

                if (s.timestamp) {
                    // Snelste inzendingen
                    let rondedag = moment(parseInt(s.timestamp, 10)).format("YYYY-MM-DD [20:15:00]")
                    let rondestart = parseInt(moment.tz(rondedag, "Europe/Amsterdam").tz("UTC").format("x"), 10)
                    let speed = parseInt(s.timestamp, 10) - rondestart
                    if (speed < 0) {
                        speed += 24 * 60 * 60 * 1000
                    }
                    speed_toDB.push({speed: speed, ...s})
                }

                // Langste series inzendingen
                if (consec_inzendingen_populate.find(o => o.gebruiker === s.gebruiker)) {
                    consec_inzendingen_populate.find(o => o.gebruiker === s.gebruiker).rondes.push(s.ronde)
                } else {
                    consec_inzendingen_populate.push({gebruiker: s.gebruiker, rondes: [s.ronde]})
                }


            })
            // Aantal inzendingen per ronde
            rondes_aantal_toDB.push({ronde: i, count: inzendingen.length})
        }

        let consec_inzendingen_toDB = []
        consec_inzendingen_populate.forEach(c => {
            let serie = []
            let vorigeRonde = null
            c.rondes.forEach(r => {
                if (c.gebruiker === "Treindienstldr") {
                    return true
                }
                if (!vorigeRonde) {
                    serie.push(r)
                    vorigeRonde = r
                } else if (vorigeRonde === r - 1) {
                    serie.push(r)
                    vorigeRonde = r
                } else {
                    if (serie.length > 2) {
                        consec_inzendingen_toDB.push({
                            gebruiker: c.gebruiker,
                            serie: serie,
                            lengte: serie.length
                        })
                    }
                    vorigeRonde = r
                    serie = [r]
                }
            })
            if (serie.length > 2) {
                consec_inzendingen_toDB.push({
                    gebruiker: c.gebruiker,
                    serie: serie,
                    lengte: serie.length
                })
            }
        })

        stats_alle_inzendingen_dbupdate(alleinzendingen)
        stats_inzendingen_aantal_dbupdate(inzendingen_toDB)
        stats_inzendingen_speed_dbupdate(speed_toDB)
        stats_inzendingen_series_dbupdate(consec_inzendingen_toDB)
        stats_rondes_aantal_dbupdate(rondes_aantal_toDB)
        stats_alle_gebruikers_dbupdate(inzendingen_toDB.length)
        return resolve(true)
    })

module.exports.stats_clips_statuses = () =>
    new Promise(async (resolve) => {
        let alleClips = await admin_alle_clips()
        let alleRondes = await admin_alle_rondes()
        let hr = await huidige_ronde()
        let status = {
            gebruikt: parseInt(hr, 10),
            gepland: alleRondes.length - parseInt(hr, 10),
            ongebruikt: alleClips.length - alleRondes.length
        }
        stats_clips_statuses_dbupdate(status)
        return resolve(true)
    })
