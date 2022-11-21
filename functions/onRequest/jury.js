const {zoek_dm} = require("../outside_connections/firebase/dms")
const {zoek_ronde_op_timestamp} = require("../outside_connections/firebase/rondes")
const {
    zoek_rondescore,
    zoek_scores_bij_ronde,
    verwijder_score
} = require("../outside_connections/firebase/scores")
const {zoek_speler, sla_speler_op} = require("../outside_connections/firebase/spelers")

const {dm_versturen} = require("../outside_connections/twitter/direct_messages")

module.exports.beoordeel_antwoord = (antwoord, x_artiest, x_titel, rondescore) =>
    new Promise((resolve) => {
        let score = 0
        if (new RegExp(x_artiest, "ig").test(antwoord)) {
            score += 1
        }
        if (new RegExp(x_titel, "ig").test(antwoord)) {
            score += 2
        }

        if (score !== rondescore) {
            score += rondescore
        }

        if (score > 3) score = 3
        console.log("Beoordeling: ", score)
        return resolve(score)
    })

module.exports.keur_alsnog_goed = (dm_id) =>
    new Promise(async (resolve) => {
        console.log(`We gaan DM ${dm_id} alsnog goedkeuren`)

        // Zoek de relevante data erbij
        let dm = await zoek_dm(dm_id)

        let bericht_twitter_naam = dm.speler_naam
        let bericht_twitter_id = dm_id
        let bericht_twitter_timestamp = dm.timestamp
        let bericht_twitter_tekst = dm.tekst

        let rondedata = await zoek_ronde_op_timestamp(bericht_twitter_timestamp)
        if (rondedata) {
            console.log(`Bericht hoort bij ronde ${rondedata.ronde}.`)
        } else {
            console.log(`Geen ronde gevonden bij dit bericht.`)
            return resolve([])
        }

        console.log('Zoek oude beoordelingen')
        let oude_beoordeling = await zoek_rondescore({speler: bericht_twitter_naam, ronde: rondedata.ronde})
        if (oude_beoordeling === 3) {
            console.log(`Dubbel antwoord`)
            return resolve()
        }

        let allescores = await zoek_scores_bij_ronde(65)

        let i = allescores.length

        while (i--) {
            if (allescores[i].speler === bericht_twitter_naam) {
                await verwijder_score(allescores[i].id)
            }
        }

// Doe alsof we aan het typen zijn
//         await dm_aanhettypen(bericht_twitter_id)

        let spelerdata = await zoek_speler(bericht_twitter_naam)

        if (!spelerdata) {
            await sla_speler_op({speler:bericht_twitter_naam})
        }

        let antwoordtekst = `Je antwoord "${bericht_twitter_tekst}" is alsnog goedgekeurd, gefeliciteerd!`

        // await sla_score_op(
        //     {
        //         speler_naam: bericht_twitter_naam,
        //         ronde: rondedata.ronde,
        //         timestamp: bericht_twitter_timestamp,
        //         beoordeling: 3,
        //         bron: 'keur_alsnog_goed'
        //     }
        // )
        //
        console.log(bericht_twitter_id,antwoordtekst)
        await dm_versturen(bericht_twitter_id, antwoordtekst)

        return resolve([])
    })
