const moment = require("moment-timezone")

module.exports.wacht = (tijdstip) =>
    new Promise((resolve) => {
        let wachten = setInterval(() => {
            if (parseInt(moment().tz('Europe/Amsterdam').format('HHmmss'), 10) >= parseInt(tijdstip, 10)) {
                clearInterval(wachten)
                return resolve(true)
            }
            return true
        }, 1000)
    })
