const {zoek_user_naam} = require("../outside_connections/twitter/users")
const {verwijder_accenten} = require("../helpers/strings")
const {verwerk_bericht} = require("./verwerk_bericht")
const {dm_versturen} = require("../outside_connections/twitter/direct_messages")
const {sandbox_verwerk_bericht} = require("../sandbox/sandbox_verwerk_bericht")
let own_accounts = ['Treindienstldr', 'regenrace', 'videoclipquiz', 'ziggyziggyzig']

module.exports.van_vangnet = (req) =>
    new Promise(async (resolve) => {
        const {id, timestamp, tekst} = req
        if (!id || !timestamp || !tekst) {
            return resolve({
                status: "error",
                tekst: "Er is een fout opgetreden, probeer het later nog eens",
                dm: false
            })
        } else {
            let elementen = {
                bericht_twitter_naam: await zoek_user_naam(id),
                bericht_twitter_id: id,
                bericht_twitter_timestamp: timestamp,
                bericht_twitter_tekst: verwijder_accenten(tekst),
                bericht_medium: 'inzendingen_vangnet'
            }
            console.log(elementen)
            let retour
            if (own_accounts.includes(elementen.bericht_twitter_naam)) {
                retour = await sandbox_verwerk_bericht(elementen)
            } else {
                retour = await verwerk_bericht(elementen)
            }
            if (retour.dm && !own_accounts.includes(elementen.bericht_twitter_naam)) {
                await dm_versturen(elementen.bericht_twitter_id, retour.tekst)
                if (retour.dm && (elementen.bericht_twitter_tekst.toLowerCase().includes('coldplay') || elementen.bericht_twitter_tekst.toLowerCase().includes('c*ldpl*y'))) await dm_versturen(elementen.bericht_twitter_id, 'https://twitter.com/videoclipquiz/status/1460277507572252688')
            }
            return resolve(retour)

        }
    })
