const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../../outside_connections/firebase/client")

module.exports.cycle_global_artiesten = (all_clips, all_corrects) =>
    new Promise(async resolve => {
        console.log(`CYCLE_GLOBAL: ARTIESTEN`)
        let alle_artiesten = []
        for (let clip of all_clips) {
            if (clip.status && clip.status >= 2 && clip.ronde) {
                let all_corrects_round = all_corrects.filter(o => o.ronde === clip.ronde)
                let artiest = clip.artiest.replaceAll(" feat. ", " & ")
                artiest = artiest.replaceAll(" feat ", " & ")
                artiest = artiest.replaceAll(" vs. ", " & ")
                let artiestsplit = artiest.split(" & ")
                for (let a of artiestsplit) {
                    let i = alle_artiesten.findIndex(o => o.artiest === a)
                    if (i > -1) {
                        alle_artiesten[i].count++
                        alle_artiesten[i].corrects += all_corrects_round.length
                        alle_artiesten[i].rondes.push(clip.ronde)
                    } else {
                        alle_artiesten.push({
                            artiest:a,
                            count:1,
                            corrects:all_corrects_round.length,
                            rondes:[clip.ronde]
                        })
                    }
                }

            }
        }

        let batch = new BigBatch({firestore:db})

        for (let a of alle_artiesten) {
            await batch.set(db.collection('GLOBAL').doc('STATS').collection('ARTIESTEN').doc(a.artiest.replace('/', '')),
                a, {merge:true}
            )

        }

        await batch.commit()

        return resolve(true)
    })

module.exports.cycle_global_jaren = (all_clips, all_corrects) =>
    new Promise(async resolve => {
        console.log(`CYCLE_GLOBAL: JAREN`)
        let alle_jaren = []
        for (let clip of all_clips) {
            if (clip.status && clip.status >= 2 && clip.ronde && clip.jaar && clip.jaar > 0) {
                let all_corrects_round = all_corrects.filter(o => o.ronde === clip.ronde)
                let i = alle_jaren.findIndex(o => o.jaar === clip.jaar)
                if (i > -1) {
                    alle_jaren[i].count++
                    alle_jaren[i].corrects += all_corrects_round.length
                    alle_jaren[i].rondes.push(clip.ronde)
                } else {
                    alle_jaren.push({
                        jaar:clip.jaar,
                        count:1,
                        corrects:all_corrects_round.length,
                        rondes:[clip.ronde]
                    })
                }
            }

        }

        let batch = new BigBatch({firestore:db})

        for (let a of alle_jaren) {
            await batch.set(db.collection('GLOBAL').doc('STATS').collection('JAREN').doc(String(a.jaar)),
                a, {merge:true}
            )

        }

        await batch.commit()

        return resolve(true)
    })
