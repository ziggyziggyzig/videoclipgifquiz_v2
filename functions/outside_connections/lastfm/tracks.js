require("dotenv").config({path: __dirname + '/./../../.env'})

const superagent = require('superagent')

module.exports.zoek_lastfm = ({titel, artiest}) =>
    new Promise((resolve) =>
        superagent.get(`https://ws.audioscrobbler.com/2.0/`)
            .query({
                method: 'track.getInfo',
                api_key: process.env.LASTFM_API_KEY,
                artist: artiest,
                track: titel,
                format: 'json'
            })
            .end((err, res) => {
                if (err) {
                    console.error(err)
                    return resolve(false)
                }
                let body = res.body
                if (body && body.track) {
                    return resolve(body.track)
                }
            }))
