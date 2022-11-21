const {huidige_ronde, update_huidige_ronde} = require("../../outside_connections/firebase/tellers")

const {wacht} = require("./wacht")
const moment = require("moment-timezone")

module.exports.verhoog_rondenummer = () =>
    new Promise(async (resolve) => {
        let nu = parseInt(moment().format("x"), 10)
        let ronde = await huidige_ronde()
        return wacht('201500')
            .then(() => update_huidige_ronde(ronde + 1))
            .then(() => console.log("Einde verhoog_rondenummer", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
    })
