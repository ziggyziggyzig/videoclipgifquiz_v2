const {zoek_clip} = require("../../outside_connections/firebase/clips")
const {zoek_ronde_op_nummer, sla_tweetid_op} = require("../../outside_connections/firebase/rondes")
const {rondewinnaar} = require("../../outside_connections/firebase/spelers")
const {huidige_ronde} = require("../../outside_connections/firebase/tellers")

const {draadje_versturen} = require("../../outside_connections/twitter/statuses")
const {tweet_versturen, split_en_tweet} = require("../../outside_connections/twitter-api-v2/statuses")

const {wacht} = require("./wacht")
const moment = require("moment-timezone")
const {gif_uploaden} = require("../../outside_connections/twitter-api-v2/media")
const {db} = require("../../outside_connections/firebase/client")

module.exports.tweet_nieuwe_ronde = () =>
    new Promise(async (resolve) => {
        let nu = parseInt(moment().format("x"), 10)
        let ouderondenummer = await huidige_ronde()

        let winnaar = await rondewinnaar(ouderondenummer)
        let ouderondedata = await zoek_ronde_op_nummer(ouderondenummer)
        let clip = ouderondedata.clip
        let nieuwerondedata = await zoek_ronde_op_nummer(parseInt(ouderondenummer, 10) + 1)
        let {titel, artiest, youtube} = await zoek_clip(clip)
        let {twitter_mediaId} = await zoek_clip(nieuwerondedata.clip)
        let mediaId
        if (!twitter_mediaId) {
            mediaId = await gif_uploaden(nieuwerondedata.clip)
        } else {
            mediaId = twitter_mediaId
        }
        let youtubeLink = youtube ? `https://www.youtube.com/watch?v=${youtube}` : ''
        return wacht('201500')
            .then(async () => {
                let tweetTekst0 = `Ronde #${ouderondenummer + 1} van de #videoclipgifquiz staat nu online op https://videoclipgifquiz.nl/`
                if (nieuwerondedata.bonus) tweetTekst0 += ` Deze ronde is een bonusronde!`
                if (nieuwerondedata.toelichting) tweetTekst0 += ` ${nieuwerondedata.toelichting}`
                let tweetTekst1
                if (ouderondedata.bonus && ouderondedata.antwoord) {
                    tweetTekst1 = `Het juiste antwoord van bonusronde #${ouderondenummer} was ${ouderondedata.antwoord}. @${winnaar} gaf als eerste het goede antwoord. ${youtubeLink}`
                } else {
                    tweetTekst1 = `Je zag in ronde #${ouderondenummer} een fragment uit '${titel}' van ${artiest}. @${winnaar} gaf als eerste het goede antwoord. ${youtubeLink}`
                }
                console.log(tweetTekst0)
                let tweet0 = await split_en_tweet(tweetTekst0, mediaId)
                await sla_tweetid_op({ronde:ouderondenummer + 1, tweet_id:tweet0.id_str})
                console.log(tweetTekst1)
                await split_en_tweet(tweetTekst1, null, ouderondedata.tweet_id)
                return true
            })
            .then(() => console.log("Einde tweet_nieuwe_ronde", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
    })
