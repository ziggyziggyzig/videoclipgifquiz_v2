const {zoek_dm} = require("../outside_connections/firebase/dms")

const {dm_lijst} = require("../outside_connections/twitter/direct_messages")

const {verwijder_accenten} = require("../helpers/strings")

const {van_vangnet} = require("../antwoordapparaat/van_vangnet")
const moment = require("moment-timezone")

module.exports.dm_vangnet = () =>
    new Promise((resolve,reject) => {
        let nu = parseInt(moment().format("x"), 10)
        return dm_lijst()
            .then(async (response) => {
                if (response.events && response.events.length > 0) {
                    let events = [...response.events].reverse()
                    for (const r of events) {
                        if (r.message_create.target.recipient_id === "810545356366839808" && !await zoek_dm(r.id) && !await zoek_dm(r.created_timestamp)) {
                            let missed_dm = {
                                id: r.message_create.sender_id,
                                timestamp: r.created_timestamp,
                                tekst: verwijder_accenten(r.message_create.message_data.text)
                            }
                            console.log(`DM gemist: ${JSON.stringify(missed_dm)}`)
                            await van_vangnet(missed_dm)
                        }
                    }
                }
                return true
            })
            .then(() => console.log("Einde dm_vangnet", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
            .catch(e => {
                console.error(`dm_vangnet --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    })

