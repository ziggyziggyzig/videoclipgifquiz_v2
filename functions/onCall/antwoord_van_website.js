const {bericht_ontvangen} = require("../onRequest/bericht_ontvangen")

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