const {nu_local_unix, converteer_tijdzones} = require("../helpers/time")
const {huidige_rondedata, zoek_ronde_op_nummer} = require("../outside_connections/firebase/rondes")
const {zoek_rondescore, sla_score_op, feestscore} = require("../outside_connections/firebase/scores")
const {zoek_clip} = require("../outside_connections/firebase/clips")
const {zoek_speler, sla_speler_op} = require("../outside_connections/firebase/spelers")
const {beoordeel_antwoord} = require("../onRequest/jury")
const {kies_antwoorddeel} = require("../helpers/strings")
const {dm_opslaan} = require("../outside_connections/firebase/dms")
const {dm_versturen} = require("../outside_connections/twitter/direct_messages")
const {sla_inzending_op} = require("../outside_connections/firebase/inzendingen")

module.exports.sandbox_verwerk_bericht = (elementen) =>
    new Promise(async (resolve) => {
            let starttijd_script = nu_local_unix()

            let {
                bericht_twitter_naam,
                bericht_twitter_id,
                bericht_twitter_timestamp,
                bericht_twitter_tekst,
                bericht_medium
            } = elementen

// Laatste check op alle elementen

            if (!bericht_twitter_naam || !bericht_twitter_id || !bericht_twitter_timestamp || !bericht_twitter_tekst) {
                return resolve({
                    status: "error", tekst: "Er is een fout opgetreden, probeer het later nog eens", dm: false
                })
            }

// TODO
            console.log('--- SANDBOX MODE ---')
            console.log(
                `Geldig bericht ontvangen van @${bericht_twitter_naam} (${bericht_twitter_id}) om ${bericht_twitter_timestamp}: "${bericht_twitter_tekst}"`,
                (nu_local_unix() - starttijd_script) / 1000
            )

// Vang hier reminders af + dm opslaan

// Zoek de rondegegevens erbij

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

// Check of bericht niet voor vorige ronde is
            if (parseInt(bericht_twitter_timestamp, 10) < huidige_ronde_timestamp) {
                rondedata = await zoek_ronde_op_nummer(parseInt(rondedata.ronde, 10) - 1)
            }

            if (rondedata) {
                console.log(`Bericht hoort bij ronde ${rondedata.ronde}.`, (nu_local_unix() - starttijd_script) / 1000)
            } else {
                console.log(`Geen ronde gevonden bij dit bericht.`, (nu_local_unix() - starttijd_script) / 1000)
                console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
// TODO
                // dm_opslaan({
                //     timestamp: bericht_twitter_timestamp,
                //     speler_naam: bericht_twitter_naam,
                //     speler_id: bericht_twitter_id,
                //     tekst: bericht_twitter_tekst,
                //     medium: bericht_medium
                // })
// TODO
                // await sla_inzending_op({
                //     gebruiker: bericht_twitter_naam,
                //     timestamp: bericht_twitter_timestamp,
                //     tekst: bericht_twitter_tekst,
                //     script: 'verwerk_bericht',
                //     medium: bericht_medium,
                //     beoordeling: 0
                // })
                return resolve({
                    status: "error", tekst: "Er is een fout opgetreden, probeer het later nog eens", dm: false
                })
            }

// TODO
//             rondedata = await zoek_ronde_op_nummer(100)
//             console.log('---rondedata---', JSON.stringify(rondedata), (nu_local_unix() - starttijd_script) / 1000)

// Zoek vorige scores tijdens deze ronde

            console.log('Zoek oude beoordelingen', (nu_local_unix() - starttijd_script) / 1000)
            let oude_beoordeling = await zoek_rondescore({speler: bericht_twitter_naam, ronde: rondedata.ronde})
            if (oude_beoordeling === 3) {
                console.log(`Dubbel antwoord`, (nu_local_unix() - starttijd_script) / 1000)
                console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
// TODO
                // dm_opslaan({
                //     timestamp: bericht_twitter_timestamp,
                //     speler_naam: bericht_twitter_naam,
                //     speler_id: bericht_twitter_id,
                //     tekst: bericht_twitter_tekst,
                //     medium: bericht_medium
                // })
// TODO
                // await sla_inzending_op({
                //     gebruiker: bericht_twitter_naam,
                //     timestamp: bericht_twitter_timestamp,
                //     tekst: bericht_twitter_tekst,
                //     script: 'verwerk_bericht',
                //     medium: bericht_medium,
                //     ronde: rondedata.ronde,
                //     beoordeling: 0
                // })
                return resolve({
                    status: "error", tekst: "Je hebt deze ronde al een juist antwoord gegeven", dm: false
                })
            }

// Zoek de clipgegevens erbij

            console.log('Zoek clipdata', (nu_local_unix() - starttijd_script) / 1000)
            let clipdata = await zoek_clip(rondedata.clip)
            console.log('---clipdata---', JSON.stringify(clipdata), (nu_local_unix() - starttijd_script) / 1000)

// Zoek de spelersgegevens erbij

            console.log('Zoek spelerdata', (nu_local_unix() - starttijd_script) / 1000)
            let spelerdata = await zoek_speler(bericht_twitter_naam)
            console.log('---spelerdata---', JSON.stringify(spelerdata), (nu_local_unix() - starttijd_script) / 1000)

// Beoordeel het antwoord

            console.log('Beoordeel antwoord', (nu_local_unix() - starttijd_script) / 1000)
            let beoordeling
            if (spelerdata) {
                beoordeling = await beoordeel_antwoord(bericht_twitter_tekst, clipdata.x_artiest, clipdata.x_titel, oude_beoordeling)
            } else {
// TODO
                // await dm_versturen(elementen.bericht_twitter_id, "Hoi, leuk dat je meedoet aan de #videoclipgifquiz. Veel plezier en succes!")
                beoordeling = await beoordeel_antwoord(bericht_twitter_tekst, clipdata.x_artiest, clipdata.x_titel, 0)
            }

// Stel het antwoordbericht samen

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
                        `Correct, `,
                        `Helemaal goed, `
                    ]
                    if (rondedata.antwoord) {
                        antwoorddelen01 = [
                            `het juiste antwoord was inderdaad ${rondedata.antwoord}`,
                            `de oplossing was inderdaad ${rondedata.antwoord}`
                        ]
                    } else {
                        antwoorddelen01 = [
                            `het was '${clipdata.titel}' van ${clipdata.artiest}. `,
                            `de oplossing was inderdaad ${clipdata.artiest} met '${clipdata.titel}'. `,
                            `je zag inderdaad '${clipdata.titel}' van ${clipdata.artiest}. `
                        ]
                    }

                    antwoordtekst = `${kies_antwoorddeel(antwoorddelen00)}${kies_antwoorddeel(antwoorddelen01)}`
                    await feestscore({speler_naam: bericht_twitter_naam})
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

                    // Antwoord is fout

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


            console.log(antwoordtekst, (nu_local_unix() - starttijd_script) / 1000)
// TODO
            // await sla_score_op({
            //     speler_naam: bericht_twitter_naam,
            //     ronde: rondedata.ronde,
            //     timestamp: bericht_twitter_timestamp,
            //     bron: 'bericht_ontvangen',
            //     beoordeling: beoordeling
            // },)

// TODO
            // await sla_inzending_op({
            //     gebruiker: bericht_twitter_naam,
            //     timestamp: bericht_twitter_timestamp,
            //     tekst: bericht_twitter_tekst,
            //     script: 'verwerk_bericht',
            //     medium: bericht_medium,
            //     ronde: rondedata.ronde,
            //     beoordeling: beoordeling
            // })

// Sla de speler op, voor zover dat nodig is

// TODO
            // sla_speler_op({
            //     speler: bericht_twitter_naam,
            //     rondescore: beoordeling
            // })

// Sla het bericht op
            console.log('DM opslaan', (nu_local_unix() - starttijd_script) / 1000)
// TODO
            // dm_opslaan({
            //     timestamp: bericht_twitter_timestamp,
            //     speler_naam: bericht_twitter_naam,
            //     speler_id: bericht_twitter_id,
            //     tekst: bericht_twitter_tekst,
            //     medium: bericht_medium
            // })

            console.log('Klaar met behandelen bericht', (nu_local_unix() - starttijd_script) / 1000)

            console.log(`---resolve verwerk_bericht---`, JSON.stringify({status: "ok", tekst: antwoordtekst, dm: true}))
// TODO
            console.log('--- END SANDBOX MODE ---')
            return resolve({status: "ok", tekst: antwoordtekst, dm: true})
        }
    )