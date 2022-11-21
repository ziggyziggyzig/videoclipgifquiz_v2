require("dotenv").config({path:__dirname+'/./../../.env'})

const {TwitterApi} = require('twitter-api-v2')

const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

exports.twitter_v2_client = client.v1

