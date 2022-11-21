const {twitter_client}=require('./client')

module.exports.dm_aanhettypen = (recipient_id) =>
    twitter_client.post('direct_messages/indicate_typing',
        {
            recipient_id: recipient_id
        })
        .then(e => {
            console.log(`dm_aanhettypen --- ${JSON.stringify(e)}`)
        })

module.exports.dm_gelezen = (bericht_id, sender_id) =>
    twitter_client.post('direct_messages/mark_read',
        {
            last_read_event_id: bericht_id,
            recipient_id: sender_id
        })
        .then(e => {
            console.log(`dm_gelezen --- ${JSON.stringify(e)}`)
        })

module.exports.dm_versturen = (id, bericht) =>
    new Promise((resolve, reject) =>
        twitter_client.post(
            'direct_messages/events/new',
            {
                event: {
                    type: 'message_create',
                    message_create: {
                        target: {
                            recipient_id: String(id)
                        },
                        message_data: {
                            text: bericht
                        }
                    }
                }
            })
            .then(e => {
                console.log(`dm_versturen --- ${JSON.stringify(e)}`)
            })
            .then(() => resolve(true))
            .catch(e => {
                console.error(`dm_versturen --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )

module.exports.dm_lijst = () =>
    new Promise((resolve, reject) =>
        twitter_client.get('direct_messages/events/list', {
            count: '50'
        })
            .then(async (response) => {
                console.log(`dm_lijst --- ${JSON.stringify(response)}`)
                return resolve(response)
            })
            .catch(e => {
                console.error(`dm_lijst --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )