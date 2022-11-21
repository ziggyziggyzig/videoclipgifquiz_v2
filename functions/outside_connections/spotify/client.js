require("dotenv").config({path: __dirname + '/./../../.env'})

const Spotify = require('node-spotify-api')

exports.spotify_client = new Spotify({
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET
})
