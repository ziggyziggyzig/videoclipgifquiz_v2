const {huidige_ronde} = require("../outside_connections/firebase/tellers")
const {zoek_track} = require("../outside_connections/spotify/tracks")
const {zoek_ronde_op_nummer} = require("../outside_connections/firebase/rondes")
const {zoek_clip} = require("../outside_connections/firebase/clips")
const {zoek_correcte_inzendingen_bij_ronde} = require("../outside_connections/firebase/inzendingen")
const {tweet_versturen} = require("../outside_connections/twitter-api-v2/statuses")

module.exports.hint = () =>
    new Promise(async (resolve) => {
        let hr = await huidige_ronde()
        let scores = await zoek_correcte_inzendingen_bij_ronde(hr)
        if (scores.length > 0) {
            console.log(`--- hint --- ${scores.length} scores genoteerd voor ronde #${hr}, geen hint nodig`)
            return resolve(true)
        }
        console.log(`--- hint --- ${scores.length} scores genoteerd voor ronde #${hr}, we gaan een hint maken`)
        let rondedata = await zoek_ronde_op_nummer(hr)
        let clipdata = await zoek_clip(rondedata.clip)
        let spotifydata = await zoek_track(`${clipdata.titel} ${clipdata.artiest}`)
        let tweettekst = `Nog geen goede antwoorden binnengekomen, dus geven we een hint: het gezochte nummer was nummer ${spotifydata.album_track_nr} op een album dat in ${spotifydata.album_jaar} uitkwam en duurt ${spotifydata.duration_m}:${spotifydata.duration_s}. (* gebaseerd op informatie uit Spotify)`
        console.log(`--- hint --- ${tweettekst}`)
        await tweet_versturen(tweettekst)
        return resolve(true)
    })
