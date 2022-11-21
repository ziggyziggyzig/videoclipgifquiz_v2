const {db} = require("../../outside_connections/firebase/client")

module.exports.cycle_current_round = () =>
    new Promise(async resolve => {
        let tellers = await db.collection('tellers').doc('huidige_ronde').get()
        let huidige_ronde=tellers.data().id
        let rondesnap = await db.collection('rondes').doc(String(huidige_ronde)).get()
        let episode=rondesnap.data().EPISODE
        return resolve({current_round:huidige_ronde,current_episode:episode})
    })

module.exports.cycle_feestinzending = () =>
    new Promise(async resolve => {
        let feestinzendingen = await db.collection('tellers').doc('FEESTSCORE_CYCLE').get()
        return resolve(feestinzendingen.data())
    })

module.exports.cycle_check_feestscore = (laatste_feestcount, alle_inzendingen) =>
    new Promise(async resolve => {
        console.log(`CYCLE_TELLERS: FEESTSCORE`)
        let alle_inzendingen_data = []
        for (let inzending of alle_inzendingen) {
            alle_inzendingen_data.push(inzending)
        }
        alle_inzendingen_data.sort((a, b) => a.timestamp - b.timestamp)

        let inzendingen_count=alle_inzendingen_data.length

        if (inzendingen_count - laatste_feestcount >= 20) {
            let nieuwe_feestcount = inzendingen_count - (inzendingen_count % 20)
            console.log(`--- CYCLE_CHECK_FEESTSCORE --- Hoera! ${nieuwe_feestcount} is een nieuwe feestscore!`)
            let nieuwe_feestinzending = alle_inzendingen_data[nieuwe_feestcount - 1]
            await db.collection('tellers').doc('FEESTSCORE_CYCLE').update({count: nieuwe_feestcount})
        }
        return resolve(true)
    })
