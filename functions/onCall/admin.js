const {verander_status} = require("../outside_connections/firebase/clips")
const {voeg_ronde_toe} = require("../outside_connections/firebase/rondes")

const {dm_versturen} = require("../outside_connections/twitter/direct_messages")
const {zoek_stat_score, schrijf_stat_score, verwijder_score} = require("../outside_connections/firebase/scores")
const {zoek_user_id} = require("../outside_connections/twitter-api-v2/users")
const {split_en_tweet} = require("../outside_connections/twitter-api-v2/statuses")

const {run_cycle} = require("../pubsub/cycle/run_cycle")

module.exports.admin = async (req) => {
    console.log(`--- ADMIN CALL: ${JSON.stringify(req)} ---`)
    const {context, action, user, content} = req
    if (user === "UtQuqZsAsdXfKVXm5E7PUTRd7ly1" || user === "Uw7fhFgjqkXqZfZWxYIQbUgvIzG2" || user === "iJYoPUxk5ZUmfHxTRuY48VxjgaO2") {
        switch (context) {
            case 'cycle':
                switch (action) {
                    case 'run':
                        let {mode}=content
                        await run_cycle(mode)
                        return true
                    default:
                        console.log('no action')
                }
                break
            case 'twitter':
                switch (action) {
                    case 'send_dm':
                        let {dm_tekst, dm_gebruiker} = content
                        if (dm_tekst && dm_gebruiker) {
                            let dm_gebruiker_id = await zoek_user_id(dm_gebruiker)
                            await dm_versturen(dm_gebruiker_id, dm_tekst)
                            return true
                        } else {
                            return false
                        }
                    case 'send_status':
                        let {tekst, tweet_id} = content
                        await split_en_tweet(tekst, null, tweet_id)
                        return true
                    default:
                        console.log('no action')
                }
                break
            case 'scores':
                switch (action) {
                    case 'delete':
                        let {dm_id} = content
                        await verwijder_score(dm_id)
                        return true
                    default:
                        console.log('no action')
                }
                break
            case 'rondes':
                switch (action) {
                    case 'add':
                        for (const c of content) {
                            let {ronde, start, id} = c
                            verander_status(id, 1)
                            await voeg_ronde_toe({
                                ronde:ronde,
                                start:start,
                                clip:id
                            })
                            let stat_score = await zoek_stat_score()
                            let nieuwe_stat_score = parseInt(stat_score, 10) + 1
                            await schrijf_stat_score(String(nieuwe_stat_score))
                        }
                        return true
                    default:
                        console.log('no action')
                }
                break
            default:
                return console.log('no context')
        }
    } else {
        return false
    }
}
