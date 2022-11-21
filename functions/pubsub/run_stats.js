const {
    stats_inzendingen_aantal_speed_series,
    stats_winnaars_speed_aantal,
    stats_clips_statuses
} = require("./statistieken")
const {stats_updatetime} = require("../outside_connections/firebase/stats")
const {nu_local_unix} = require("../helpers/time")
const {zoek_stat_inzending, schrijf_stat_inzending, zoek_nieuwste_correcte_inzending} = require("../outside_connections/firebase/inzendingen")

module.exports.run_stats = async () => {
    let nieuwste_inzending = await zoek_nieuwste_correcte_inzending()
    let stat_inzending = await zoek_stat_inzending()
    if (nieuwste_inzending && stat_inzending && nieuwste_inzending !== stat_inzending) {
        let starttijd_script = nu_local_unix()
        await stats_inzendingen_aantal_speed_series()
        await stats_winnaars_speed_aantal()
        await stats_updatetime()
        await stats_clips_statuses()
        await schrijf_stat_inzending(nieuwste_inzending)
        console.log('---nieuwe inzending, nieuwe statistieken---', (nu_local_unix() - starttijd_script) / 1000)
        return true
    }
}
