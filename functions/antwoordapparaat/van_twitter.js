const {zoek_user_naam} = require("../outside_connections/twitter/users")
const {verwijder_accenten} = require("../helpers/strings")
const {verwerk_bericht} = require("./verwerk_bericht")
const {dm_versturen} = require("../outside_connections/twitter/direct_messages")
const {sandbox_verwerk_bericht} = require("../sandbox/sandbox_verwerk_bericht")
let own_accounts = ['Treindienstldr', 'regenrace', 'videoclipquiz', 'ziggyziggyzig']

module.exports.van_twitter = (req) =>
    new Promise(async (resolve) => {
        let {body} = req
        if (!body
            || body.for_user_id !== "810545356366839808"
            || body.tweet_create_events
            || body.favorite_events
            || body.follow_events
            || body.unfollow_events
            || body.block_events
            || body.unblock_events
            || body.mute_events
            || body.user_event
            || body.direct_message_indicate_typing_events
            || body.direct_message_mark_read_events
            || body.tweet_delete_events
            || !body.direct_message_events
            || !body.direct_message_events.length > 0) {
            return resolve()
            // bericht ongeldig
        }
        let bericht = body.direct_message_events[0] || null
        if (!bericht
            || typeof bericht === 'undefined'
            || typeof bericht.message_create === 'undefined'
            || bericht.message_create.sender_id === bericht.message_create.target.recipient_id
            || bericht.message_create.sender_id === "810545356366839808") {
            return resolve()
        }

        let elementen = {
            bericht_twitter_naam: await zoek_user_naam(bericht.message_create.sender_id),
            bericht_twitter_id: bericht.message_create.sender_id,
            bericht_twitter_timestamp: bericht.created_timestamp,
            bericht_twitter_tekst: verwijder_accenten(bericht.message_create.message_data.text),
            bericht_medium: 'twitter'
        }
        let retour

        if (own_accounts.includes(elementen.bericht_twitter_naam)) {
            retour = await sandbox_verwerk_bericht(elementen)
        } else {
            retour = await verwerk_bericht(elementen)
        }
        console.log('---van_twitter retour---', JSON.stringify(retour))

        if (retour.dm) await dm_versturen(elementen.bericht_twitter_id, retour.tekst)
        if (retour.dm && (elementen.bericht_twitter_tekst.toLowerCase().includes('coldplay') || elementen.bericht_twitter_tekst.toLowerCase().includes('c*ldpl*y'))) await dm_versturen(elementen.bericht_twitter_id, 'https://twitter.com/videoclipquiz/status/1460277507572252688')

        return resolve(true)
    })
