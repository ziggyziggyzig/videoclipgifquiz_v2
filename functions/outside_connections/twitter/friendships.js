const {twitter_client} = require('./client')

module.exports.volgstatus = (id) =>
    new Promise((resolve, reject) =>
        twitter_client.get('friendships/lookup', {
            user_id: id
        })
            .then((response) => {
                console.log(`volgstatus --- ${JSON.stringify(response)}`)
                if (response[0].connections && response[0].connections.includes('following')) {
                    return resolve('following')
                } else {
                    return resolve('not following')
                }
            })
            .catch(e => {
                console.error(`volgstatus --- ${JSON.stringify(e)}`)
                return reject(e)
            })
    )

module.exports.start_volgen = (id) =>
    twitter_client.post('friendships/create', {
        user_id: id
    })
        .then(e =>
            console.log(`start_volgen --- ${JSON.stringify(e)}`)
        )
