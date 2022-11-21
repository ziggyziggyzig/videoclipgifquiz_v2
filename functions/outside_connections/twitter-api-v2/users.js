const {twitter_v2_client} = require('./client')

const {zoek_speler} = require("../firebase/spelers")

module.exports.zoek_user_id = (naam) =>
    new Promise(async (resolve, reject) => {
        let speler = await zoek_speler(naam)
        if (speler && speler.id) {
            return resolve(speler.id)
        } else {

            twitter_v2_client.user({
                screen_name: naam
            })
                .then((response) => {
                    console.log(`v2_zoek_user_id --- ${JSON.stringify(response)}`)
                    if (response.id_str) {
                        return resolve(response.id_str)
                    } else {
                        return reject(0)
                    }
                })
                .catch(e => {
                    console.error(`v2_zoek_user_id --- ${e}`)
                    return reject(e)
                })
        }
        return true
    })

module.exports.zoek_user_naam = (id) =>
    new Promise((resolve, reject) =>
        twitter_v2_client.user({
            user_id: id
        })
            .then((response) => {
                console.log(`v2_zoek_user_naam --- ${JSON.stringify(response)}`)
                if (response.screen_name) {
                    return resolve(response.screen_name)
                } else {
                    return reject(0)
                }
            })
            .catch(e => {
                console.error(`v2_zoek_user_naam --- ${e}`)
                return reject(e)
            })
    )
