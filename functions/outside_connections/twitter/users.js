const {twitter_client}=require('./client')

const {zoek_speler} = require("../firebase/spelers")

module.exports.zoek_user_id = (naam) =>
    new Promise(async (resolve, reject) => {
        let speler = await zoek_speler(naam)
        if (speler && speler.id) {
            return resolve(speler.id)
        }
        else {

            twitter_client.post('users/lookup', {
                screen_name: naam
            })
                .then((response) => {
                    console.log(`zoek_user_id --- ${JSON.stringify(response)}`)
                    if (response[0].id) {
                        return resolve(response[0].id)
                    } else {
                        return reject(0)
                    }
                })
                .catch(e => {
                    console.error(`zoek_user_id --- ${e}`)
                    return reject(e)
                })
        }
        return true
    })

module.exports.zoek_user_naam = (id) =>
    new Promise((resolve, reject) =>
        twitter_client.post('users/lookup', {
            user_id: id
        })
            .then((response) => {
                console.log(`zoek_user_naam --- ${JSON.stringify(response)}`)
                if (response[0].screen_name) {
                    return resolve(response[0].screen_name)
                } else {
                    return reject(0)
                }
            })
            .catch(e => {
                console.error(`zoek_user_naam --- ${e}`)
                return reject(e)
            })
    )
