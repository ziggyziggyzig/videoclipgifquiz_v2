const {twitter_v2_client} = require('./client')

module.exports.dm_aanhettypen = (recipient_id) =>
    new Promise((resolve, reject) =>
        twitter_v2_client.indicateDmTyping(recipient_id)
            .then(e => {
                console.log(`v2_dm_aanhettypen --- ${JSON.stringify(e)}`)
                return resolve(e)
            })
            .catch(e => {
                console.error(`v2_dm_versturen --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )

module.exports.dm_gelezen = (bericht_id, sender_id) =>
    new Promise((resolve, reject) =>
        twitter_v2_client.markDmAsRead(bericht_id, sender_id)
            .then(e => {
                console.log(`v2_dm_gelezen --- ${JSON.stringify(e)}`)
                return resolve(e)
            })
            .catch(e => {
                console.error(`v2_dm_gelezen --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )

module.exports.dm_versturen = (id, bericht) =>
    new Promise((resolve, reject) =>
        twitter_v2_client.sendDm({
            recipient_id: id,
            text: bericht
        })
            .then(e => {
                console.log(`v2_dm_versturen --- ${JSON.stringify(e)}`)
                return resolve(e)
            })
            .catch(e => {
                console.error(`v2_dm_versturen --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )

module.exports.dm_lijst = () =>
    new Promise((resolve, reject) =>
        twitter_v2_client.listDmEvents({count: 50})
            .then((response) => {
                console.log(`v2_dm_lijst --- ${JSON.stringify(response)}`)
                return resolve(response)
            })
            .catch(e => {
                console.error(`v2_dm_lijst --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )
