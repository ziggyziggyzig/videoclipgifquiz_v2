const {twitter_client} = require('./client')

function delay(ms, value) {
    return new Promise(resolve => setTimeout(resolve, ms, value))
}

module.exports.tweet_versturen = (bericht) =>
    new Promise(async (resolve, reject) => {
        for (let attempt = 0; attempt < 10; attempt++) {
            if (attempt > 0) {
                // Last attempt failed, wait a moment
                await delay(attempt * 5000);
            }
            try {
                let s = await twitter_client.post('statuses/update',
                    {status: bericht})
                console.log(`tweet_versturen --- ${JSON.stringify(s)}`)
                resolve(true)
            } catch (e) {
                console.error(JSON.stringify(e))
                return reject(e)
            }
        }
        throw new Error("unknown error")
    })


module.exports.draadje_versturen = (berichten) =>
    new Promise(async (resolve, reject) => {
        let lastTweetID = ""
        let i=0
        for (const bericht of berichten) {
            i++
            twitter_client.post("statuses/update", {
                status: bericht,
                in_reply_to_status_id: lastTweetID,
                auto_populate_reply_metadata: true
            })
                .then(tweet =>
                    lastTweetID = tweet.id_str
                )
                .then(()=>{
                    if (i===berichten.length) {
                        return resolve(true)
                    }
                })
                .catch(e=>{
                    console.error(JSON.stringify(e))
                    return reject(e)
                })
        }
    })
