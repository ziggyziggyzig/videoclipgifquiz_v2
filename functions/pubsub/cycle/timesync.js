const {nu_local_unix} = require("../../helpers/time")
const {dm_versturen} = require("../../outside_connections/twitter-api-v2/direct_messages")

module.exports.timesync = () =>
    new Promise(async resolve => {
        let server_timestamp = nu_local_unix()
        let bericht = await dm_versturen("346758091", `Syncing ${server_timestamp}`)
        let twitter_timestamp = parseInt(bericht.event.created_timestamp, 10)
        let twitter_offset = twitter_timestamp - server_timestamp
        console.log(`server: ${server_timestamp}`, `twitter: ${twitter_timestamp}`, `diff: twitter is ${twitter_offset} ms later`)
        await dm_versturen("346758091", `server: ${server_timestamp}\ntwitter: ${twitter_timestamp}\ndiff: twitter is ${twitter_offset} ms later`)
        return resolve(twitter_offset)
    })
