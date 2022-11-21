const {twitter_v2_client} = require("./client")

module.exports.tweet_versturen = (bericht, mediaId, replyId) =>
    new Promise(async (resolve, reject) => {
        try {
            let s
            if (mediaId && replyId) {
                s = await twitter_v2_client.tweet(bericht, {media_ids:mediaId, in_reply_to_status_id:replyId})
            } else if (mediaId) {
                s = await twitter_v2_client.tweet(bericht, {media_ids:mediaId})
            } else if (replyId) {
                s = await twitter_v2_client.tweet(bericht, {in_reply_to_status_id:replyId})
            } else {
                s = await twitter_v2_client.tweet(bericht)
            }
            console.log(`v2_tweet_versturen --- ${JSON.stringify(s)}`)
            return resolve(s)
        } catch (e) {
            console.error(JSON.stringify(e))
            return reject(e)
        }
    })


module.exports.draadje_versturen = (berichten) =>
    new Promise(async (resolve, reject) => {
        try {
            let s = await twitter_v2_client.tweetThread(berichten)
            console.log(`v2_tweet_versturen --- ${JSON.stringify(s)}`)
            return resolve(true)
        } catch (e) {
            console.error(JSON.stringify(e))
            return reject(e)
        }
    })

module.exports.split_en_tweet = (bericht, mediaId, replyId) =>
    new Promise(async (resolve, reject) => {
        try {
            let tweetwoorden = bericht.split(' ')
            let tweets = []
            let tweetdeel = ''
            console.log(bericht.length)
            for (let woord of tweetwoorden) {
                if (tweetdeel.length + woord.length < 270) tweetdeel += `${woord} `
                else {
                    tweetdeel += '...'
                    tweets.push(tweetdeel)
                    tweetdeel = `...${woord} `
                }
            }
            tweets.push(tweetdeel)
            let tweet_id = replyId || null
            let s
            let i = 1
            for (let tweet of tweets) {
                if (mediaId && i === tweets.length && tweet_id) {
                    s = await twitter_v2_client.tweet(tweet, {media_ids:mediaId, in_reply_to_status_id:tweet_id})
                } else if (mediaId && i === tweets.length) {
                    s = await twitter_v2_client.tweet(tweet, {media_ids:mediaId})
                } else if (tweet_id) {
                    s = await twitter_v2_client.tweet(tweet, {in_reply_to_status_id:tweet_id})
                } else {
                    s = await twitter_v2_client.tweet(tweet)
                }
                tweet_id = s.id_str
                i++
            }
            console.log(`split_en_tweet --- ${JSON.stringify(s)}`)
            return resolve(s)
        } catch (e) {
            console.error(JSON.stringify(e))
            return reject(e)
        }

    })
