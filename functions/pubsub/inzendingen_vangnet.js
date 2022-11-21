const {dm_lijst} = require("../outside_connections/twitter/direct_messages")

const {verwijder_accenten} = require("../helpers/strings")

const {van_vangnet} = require("../antwoordapparaat/van_vangnet")
const {zoek_inzending} = require("../outside_connections/firebase/inzendingen")
const moment = require("moment-timezone")

module.exports.inzendingen_vangnet = () =>
    new Promise((resolve,reject) => {
        let nu = parseInt(moment().format("x"), 10)
        return dm_lijst()
            .then(async (response) => {
                if (response.events && response.events.length > 0) {
                    let events = [...response.events].reverse()
                    for (const r of events) {
                        if (r.message_create.target.recipient_id === "810545356366839808" && !await zoek_inzending(r.id) && !await zoek_inzending(r.created_timestamp)) {
                            let missed_inzending = {
                                id: r.message_create.sender_id,
                                timestamp: r.created_timestamp,
                                tekst: verwijder_accenten(r.message_create.message_data.text)
                            }
                            console.log(`Inzending gemist: ${JSON.stringify(missed_inzending)}`)
                            await van_vangnet(missed_inzending)
                        }
                    }
                }
                return true
            })
            .then(() => console.log("Einde inzendingen_vangnet", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
            .catch(e => {
                console.error(`inzendingen_vangnet --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    })

