const {tel_alle_inzendingen, alle_inzendingen} = require("../../outside_connections/firebase/inzendingen")
const {laatste_feestscore, update_feestscore} = require("../../outside_connections/firebase/tellers")
const {tweet_versturen} = require("../../outside_connections/twitter-api-v2/statuses")

module.exports.feestscores = () =>
    new Promise(async (resolve) => {
        let aantal_z = await tel_alle_inzendingen({correct: true})
        let laatste_f = await laatste_feestscore()
        if (aantal_z - laatste_f >= 500) {
            let nieuwe_f = aantal_z - (aantal_z % 500)
            console.log(`--- feestscore --- Hoera! ${nieuwe_f} is een nieuwe feestscore!`)
            update_feestscore(nieuwe_f)
            let alle_z=await alle_inzendingen({correct:true})
            let feestbeest=alle_z[nieuwe_f-1].gebruiker
            await tweet_versturen(`Zojuist heeft @${feestbeest} het ${nieuwe_f}e antwoord gegeven in de #videoclipgifquiz!`)
            return resolve(true)
        } else {
            // console.log(`--- feestscore --- geen nieuwe feestscore: ${aantal_z}-${laatste_f}=${aantal_z - laatste_f}`)
            return resolve(true)
        }
    })
