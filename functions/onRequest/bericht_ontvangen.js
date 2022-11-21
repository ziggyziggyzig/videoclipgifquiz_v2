const {beoordeel_antwoord} = require("./jury")

const {reminder} = require("./reminder")

const {zoek_clip} = require("../outside_connections/firebase/clips")
const {dm_opslaan} = require("../outside_connections/firebase/dms")
const {
    huidige_rondedata,
    zoek_ronde_op_nummer
} = require("../outside_connections/firebase/rondes")
const {sla_score_op, zoek_rondescore} = require("../outside_connections/firebase/scores")
const {zoek_speler, sla_speler_op} = require("../outside_connections/firebase/spelers")
const {huidige_ronde} = require("../outside_connections/firebase/tellers")

const {dm_versturen} = require("../outside_connections/twitter/direct_messages")

const {nu_local_unix, converteer_tijdzones} = require("../helpers/time")
const {controleer_geldigheid, bericht_elementen} = require("../helpers/quiz")
const {kies_antwoorddeel} = require("../helpers/strings")

module.exports.bericht_ontvangen = (body) =>
    new Promise(async (resolve, reject) => {
        try {
            let hr = await huidige_ronde()
            hr.toString()

            let starttijd_script = nu_local_unix()


            let bericht = body.direct_message_events[0] || null

            let geldigheid = controleer_geldigheid(bericht)
            if (geldigheid) {
                console.log(geldigheid)
                return resolve(true)
            } else {
                let {
                    bericht_twitter_naam,
                    bericht_twitter_id,
                    bericht_twitter_timestamp,
                    bericht_twitter_tekst
                } = await bericht_elementen(bericht)

                console.log(`Geldig bericht ontvangen van @${bericht_twitter_naam} (${bericht_twitter_id}) om ${bericht_twitter_timestamp}: "${bericht_twitter_tekst}"`, (nu_local_unix() - starttijd_script) / 1000)

                if (bericht_twitter_tekst.toLowerCase().includes('#reminder')) {
                    console.log(`Bericht bevat '#reminder'.`, (nu_local_unix() - starttijd_script) / 1000)
// Sla de DM op
                    console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
                    dm_opslaan(bericht.id, bericht_twitter_naam, bericht_twitter_id, bericht_twitter_timestamp, bericht_twitter_tekst)
                    return resolve(reminder({
                        speler_naam: bericht_twitter_naam,
                        speler_id: bericht_twitter_id,
                        bericht_tekst: bericht_twitter_tekst
                    }))
                }

// Zoek de relevante data erbij
                let rondedata = await huidige_rondedata()
                let huidige_ronde_timestamp = parseInt(
                    converteer_tijdzones(
                        `${rondedata.start} 20:15:00`,
                        "YYYY-MM-DD HH:mm:ss",
                        "x",
                        "Europe/Amsterdam",
                        "UTC"
                    ),
                    10
                )

// DM is nog voor de vorige ronde
                if (parseInt(bericht_twitter_timestamp, 10) < huidige_ronde_timestamp) {
                    rondedata = await zoek_ronde_op_nummer(parseInt(rondedata.ronde, 10) - 1)
                }

                if (rondedata) {
                    console.log(`Bericht hoort bij ronde ${rondedata.ronde}.`, (nu_local_unix() - starttijd_script) / 1000)
                } else {
                    console.log(`Geen ronde gevonden bij dit bericht.`, (nu_local_unix() - starttijd_script) / 1000)
// Sla de DM op
                    console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
                    dm_opslaan(bericht.id, bericht_twitter_naam, bericht_twitter_id, bericht_twitter_timestamp, bericht_twitter_tekst)
                    return resolve(true)
                }

                console.log('Zoek oude beoordelingen', (nu_local_unix() - starttijd_script) / 1000)
                let oude_beoordeling = await zoek_rondescore({speler: bericht_twitter_naam, ronde: rondedata.ronde})
                if (oude_beoordeling === 3) {
                    console.log(`Dubbel antwoord`, (nu_local_unix() - starttijd_script) / 1000)
                    console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
                    dm_opslaan(bericht.id, bericht_twitter_naam, bericht_twitter_id, bericht_twitter_timestamp, bericht_twitter_tekst)
                    return resolve()
                }

                console.log('Zoek clipdata', (nu_local_unix() - starttijd_script) / 1000)
                let clipdata = await zoek_clip(rondedata.clip)

                console.log('Zoek spelerdata', (nu_local_unix() - starttijd_script) / 1000)
                let spelerdata = await zoek_speler(bericht_twitter_naam)

                console.log('Beoordeel antwoord', (nu_local_unix() - starttijd_script) / 1000)
                let beoordeling
                if (spelerdata) {
                    beoordeling = await beoordeel_antwoord(bericht_twitter_tekst, clipdata.x_artiest, clipdata.x_titel, oude_beoordeling)
                } else {
                    beoordeling = await beoordeel_antwoord(bericht_twitter_tekst, clipdata.x_artiest, clipdata.x_titel, 0)
                }

                let antwoorddelen00
                let antwoorddelen01
                let antwoorddelen02 = [
                    'Probeer het nog eens.',
                    'Probeer het gerust nog een keer.',
                    'Waag gerust nog een poging.'
                ]
                let antwoordtekst

                switch (beoordeling) {
                    case 3:
// Antwoord is juist
                        antwoorddelen00 = [
                            `Juist, `,
                            `Inderdaad, `,
                            `Correct, `,
                            `Helemaal goed, `
                        ]
                        antwoorddelen01 = [
                            `het was '${clipdata.titel}' van ${clipdata.artiest}. `,
                            `de oplossing was inderdaad ${clipdata.artiest} met '${clipdata.titel}'. `,
                            `je zag inderdaad '${clipdata.titel}' van '${clipdata.artiest}'. `
                        ]

                        antwoordtekst = `${kies_antwoorddeel(antwoorddelen00)}${kies_antwoorddeel(antwoorddelen01)}`
                        break;
                    case 2:
// Alleen titel is juist
                        antwoorddelen00 = [
                            `Het was inderdaad '${clipdata.titel}', `,
                            `Bijna goed! De titel was '${clipdata.titel}', `,
                            `Je zag inderdaad '${clipdata.titel}', `
                        ]
                        antwoorddelen01 = [
                            `maar je hebt de artiest niet goed. `,
                            `maar we zoeken nog de juiste artiest. `,
                            `nu de artiest nog! `
                        ]
                        antwoordtekst = `${kies_antwoorddeel(antwoorddelen00)}${kies_antwoorddeel(antwoorddelen01)}${kies_antwoorddeel(antwoorddelen02)}`
                        break;
                    case 1:
// Alleen artiest is juist
                        antwoorddelen00 = [
                            `Het was inderdaad ${clipdata.artiest}, `,
                            `Bijna goed! De artiest was ${clipdata.artiest}, `,
                            `Je zag inderdaad een clip van ${clipdata.artiest}, `
                        ]
                        antwoorddelen01 = [
                            `maar je hebt de titel niet goed. `,
                            `maar we zoeken nog de juiste titel. `,
                            `nu de titel nog! `
                        ]
                        antwoordtekst = `${kies_antwoorddeel(antwoorddelen00)}${kies_antwoorddeel(antwoorddelen01)}${kies_antwoorddeel(antwoorddelen02)}`
                        break;
                    default:
                        antwoorddelen00 = [
                            `Helaas, `,
                            `Nee, `,
                            `Jammer, `
                        ]
                        antwoorddelen01 = [
                            `"${bericht_twitter_tekst}" was niet het goede antwoord. `,
                            `"${bericht_twitter_tekst}" is niet het antwoord dat we zochten. `,
                            `"${bericht_twitter_tekst}" kunnen we niet goedkeuren. `
                        ]
                        antwoordtekst = `${kies_antwoorddeel(antwoorddelen00)}${kies_antwoorddeel(antwoorddelen01)}${kies_antwoorddeel(antwoorddelen02)}`
                }

                setTimeout(() => {

                    console.log(antwoordtekst, (nu_local_unix() - starttijd_script) / 1000)
                    sla_score_op({
                        bericht_id: bericht.id,
                        speler: bericht_twitter_naam,
                        ronde: rondedata.ronde,
                        timestamp: bericht_twitter_timestamp,
                        beoordeling: beoordeling,
                        bron: 'bericht_ontvangen'
                    },)
                    dm_versturen(bericht_twitter_id, antwoordtekst)
                    sla_speler_op({
                        speler: bericht_twitter_naam,
                        rondescore: beoordeling
                    })

// Sla de DM op
                    console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
                    dm_opslaan(bericht.id, bericht_twitter_naam, bericht_twitter_id, bericht_twitter_timestamp, bericht_twitter_tekst)
                }, 500)

            }

            console.log('Klaar met behandelen bericht', (nu_local_unix() - starttijd_script) / 1000)
            return resolve(true)
        } catch
            (e) {
            console.error(JSON.stringify(e))
            return reject(e)
        }
    })
