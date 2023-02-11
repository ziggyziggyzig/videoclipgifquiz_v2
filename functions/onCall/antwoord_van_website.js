const {bericht_ontvangen} = require("../onRequest/bericht_ontvangen")
const {db} = require("../outside_connections/firebase/client")
const moment = require("moment-timezone")

module.exports.antwoord_van_website = async (req) => {
    const {id, timestamp, tekst} = req
    let website_bericht = {
        id: String(timestamp),
        "direct_message_events":
            [{
                message_create:
                    {
                        sender_id: String(id),
                        message_data:
                            {
                                text: tekst
                            },
                        target: {
                            recipient_id: String(810545356366839808)
                        }
                    },
                created_timestamp: String(timestamp)
            }]
    }
    console.log('bericht ontvangen van website:', JSON.stringify(website_bericht))
    await bericht_ontvangen(website_bericht)
    return true
}

module.exports.antwoord_van_website_v2 = async (req) => {
    const {id, tekst} = req
    let user=await db.collection('users').doc(id).get()
    let twitter_id
    let timestamp=moment.utc().format("x")
    if (user && user.data()) {
        twitter_id=user.data().TWITTER_UID || null
    }
    let website_bericht = {
        id: String(timestamp),
        "direct_message_events":
            [{
                message_create:
                    {
                        sender_id: String(twitter_id),
                        message_data:
                            {
                                text: tekst
                            },
                        target: {
                            recipient_id: String(810545356366839808)
                        }
                    },
                created_timestamp: String(timestamp)
            }]
    }
    console.log('bericht ontvangen van website:', JSON.stringify(website_bericht))
    await bericht_ontvangen(website_bericht)
    return true
}

