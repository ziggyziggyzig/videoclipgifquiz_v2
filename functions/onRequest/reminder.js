const {zoek_speler, sla_speler_op} = require("../outside_connections/firebase/spelers")

const {dm_versturen} = require("../outside_connections/twitter/direct_messages")

module.exports.reminder = async ({speler_naam, speler_id, bericht_tekst}) => {
    let speler = await zoek_speler(speler_naam)
    let reminder_status
    let dm_tekst
    if (!speler || !speler.speler) {
        if (bericht_tekst.toLowerCase().includes('aan')) {
            dm_tekst = `Je dagelijkse reminder is nu aangezet. Je ontvangt elke dag rond acht uur een DM met een herinnering voor de volgende ronde van de #videoclipgifquiz. Stuur een DM met "#reminder uit" om de reminder weer uit te zetten.`
            sla_speler_op({speler: speler_naam, reminder: true})
        } else {
            dm_tekst = `Je dagelijkse reminder staat uit. Stuur een DM met "#reminder aan" om de reminder aan te zetten.`
            sla_speler_op({speler: speler_naam, reminder: false})
        }
    } else {
        reminder_status = !!speler.reminder;
        if (bericht_tekst.toLowerCase().includes('aan') && !reminder_status) {
            dm_tekst = `Je dagelijkse reminder is nu aangezet. Je ontvangt elke dag rond acht uur een DM met een herinnering voor de volgende ronde van de #videoclipgifquiz. Stuur een DM met "#reminder uit" om de reminder weer uit te zetten.`
            sla_speler_op({speler: speler_naam, reminder: true})
        } else if (bericht_tekst.toLowerCase().includes('uit') && reminder_status) {
            dm_tekst = `Je dagelijkse reminder is nu uitgezet. Stuur een DM met "#reminder aan" om de reminder weer aan te zetten.`
            sla_speler_op({speler: speler_naam, reminder: false})
        } else if (reminder_status) {
            dm_tekst = `Je dagelijkse reminder staat aan. Stuur een DM met "#reminder uit" om de reminder weer uit te zetten.`
        } else if (!reminder_status) {
            dm_tekst = `Je dagelijkse reminder staat uit. Stuur een DM met "#reminder aan" om de reminder aan te zetten.`
        }
    }
    dm_tekst="Door beperkingen aan de kant van Twitter kan ik niet betrouwbaar dagelijkse reminders versturen. Ik heb de reminder-functie daarom (tijdelijk?) uitgezet. Zie ook dit draadje: https://twitter.com/videoclipquiz/status/1461800879368060929"
    console.log(`DM verstuurd: ${dm_tekst}.`)
    dm_versturen(speler_id, dm_tekst)
    return true
}