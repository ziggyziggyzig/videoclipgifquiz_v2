const moment = require("moment-timezone")

module.exports.nu_local_unix=()=>
    parseInt(moment().format("x"),10)

module.exports.nu_local_format=(format)=>
    moment().format(format)

module.exports.nu_utc_format=(format)=>
    moment.utc().format(format)

module.exports.converteer_tijdzones=(datum,van_format,naar_format,van_tz,naar_tz)=>
    moment.tz(datum,van_format,van_tz).tz(naar_tz).format(naar_format)
