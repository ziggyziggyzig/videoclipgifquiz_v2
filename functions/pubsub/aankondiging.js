const {zoek_scores_bij_ronde} = require("../outside_connections/firebase/scores")

const moment = require("moment-timezone")
const {tweet_versturen} = require("../outside_connections/twitter-api-v2/statuses")
const {huidige_rondedata} = require("../outside_connections/firebase/rondes")

module.exports.aankondiging = async () => {
    let nu = parseInt(moment().format("x"), 10)
    let rondedata = await huidige_rondedata()
    let scores = await zoek_scores_bij_ronde(rondedata.ronde)
    let aantal_scores = scores.length || 0
    let tweettekst = `Je kan nog tot kwart over acht meedoen aan ronde #${rondedata.ronde} van de #videoclipgifquiz. ${aantal_scores} speler${aantal_scores === 1 ? ' heeft' : 's hebben'} het fragment al geraden. Om 20.15 uur start ronde #${rondedata.ronde + 1}!`
    await tweet_versturen(tweettekst, null, rondedata.tweet_id)
    console.log("Einde aankondiging", (parseInt(moment().format("x"), 10) - nu) / 1000)
    return true
}
