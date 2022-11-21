require("dotenv").config({path:`../.env`})

const functions = require(`firebase-functions`)

const {van_twitter} = require("../antwoordapparaat/van_twitter")

const cors = require(`cors`)
const crypto = require(`crypto`)

const express = require('express')
const {split_en_tweet} = require("../outside_connections/twitter-api-v2/statuses")
const {run_db_trigger} = require("../onCreate/db_trigger")

const app = express()

app.use(cors({origin:true, allowedHeaders:"Access-Control-Allow-Origin"}))

app.route('/webhook')
    .get((req, res) => {
        if (req.query.crc_token) {
            console.log("CRC verificatie beantwoord")
            return res.status(200).send({
                response_token:
                    `sha256=${crypto.createHmac("sha256", process.env.TWITTER_CONSUMER_SECRET).update(req.query.crc_token).digest("base64")}`
            })
        } else {
            return res.status(400).send({message:"Geen crc_token in request."})
        }
    })

    .post(async (req, res) => {
        await van_twitter(req)
        return res.status(200).json(req.body)
    })

    .all((req, res) => res.end())

app.route('/test')
    .get(async (req, res) => {
            // let id = req.query.id
            // if (id) await run_db_trigger(String(id))
            return res.status(200).json()
        }
    )

exports = module.exports = functions
    .region("us-central1")
    .runWith({
        timeoutSeconds:360
    })
    .https.onRequest(app)

// exports = module.exports = functions
//     .region("us-central1")
//     .runWith({
//         minInstances: 1,
//         memory: '512MB',
//         timeoutSeconds: 360
//     })
//     .https.onRequest(app)
