const {verander_status} = require("../../outside_connections/firebase/clips")
const {zoek_ronde_op_nummer} = require("../../outside_connections/firebase/rondes")
const {huidige_ronde} = require("../../outside_connections/firebase/tellers")

const {wacht} = require("./wacht")
const moment = require("moment-timezone")

module.exports.verander_clipstatus = () =>
    new Promise(async (resolve) => {
        let nu = parseInt(moment().format("x"), 10)
        let ronde = await huidige_ronde()
        let oudeRondeData = await zoek_ronde_op_nummer(ronde)
        let nieuweRondeData = await zoek_ronde_op_nummer(ronde + 1)
        return wacht('201445')
            .then(() => {
                verander_status(oudeRondeData.clip, 2)
                verander_status(nieuweRondeData.clip, 1)
                return true
            })
            .then(() => console.log("Einde verander_clipstatus", (parseInt(moment().format("x"), 10) - nu) / 1000))
            .then(() => resolve(true))
    })
