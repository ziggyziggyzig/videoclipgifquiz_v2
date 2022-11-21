const {zoek_user_naam} = require("../outside_connections/twitter/users")
const {verwijder_accenten} = require("../helpers/strings")

module.exports.controleer_geldigheid = (bericht) => {
    console.log('bericht elementen:', JSON.stringify(bericht))
    if (typeof bericht === 'undefined'
        || typeof bericht.message_create === 'undefined' || !bericht) {
        return ("Type is undefined, slaan we over")
    } else if (bericht.message_create.sender_id === bericht.message_create.target.recipient_id) {
        return ("Verzender gelijk aan ontvanger, slaan we over")
    } else if (bericht.message_create.sender_id === "810545356366839808") {
        return ("Verzonden door onszelf, slaan we over")
    } else {
        return false
    }
}

module.exports.bericht_elementen = (bericht) =>
    new Promise(async (resolve) => {
        let elementen = {
            bericht_twitter_naam: await zoek_user_naam(bericht.message_create.sender_id),
            bericht_twitter_id: bericht.message_create.sender_id,
            bericht_twitter_timestamp: bericht.created_timestamp,
            bericht_twitter_tekst: verwijder_accenten(bericht.message_create.message_data.text)
        }
        resolve(elementen)
    })
