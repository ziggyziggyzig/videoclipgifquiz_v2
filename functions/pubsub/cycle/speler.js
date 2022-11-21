const {db} = require("../../outside_connections/firebase/client")
const {cycle_ronde_all} = require("./ronde")
const {cycle_inzending_all_correct} = require("./inzending")
const {BigBatch} = require("@qualdesk/firestore-big-batch")

module.exports.cycle_speler_all = () =>
    new Promise(async resolve => {
        let spelers = await db.collection('spelers').get()
        let toResolve = []
        for (let speler of spelers.docs) {
            toResolve.push(speler.data())
        }
        return resolve(toResolve)
    })

module.exports.cycle_speler_attempt_first = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: ATTEMPT_FIRST (@${speler})`)
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            all_attempts.push(attempt.data())
        }
        all_attempts.sort((a, b) => a.timestamp - b.timestamp)
        await db.collection('spelers').doc(speler).update({
            ATTEMPT_FIRST:{...all_attempts[0]}
        })
        return resolve(true)
    })

module.exports.cycle_speler_correct_first = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: CORRECT_FIRST (@${speler})`)
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            if (attempt.data().beoordeling === 3) all_attempts.push(attempt.data())
        }
        all_attempts.sort((a, b) => a.timestamp - b.timestamp)
        await db.collection('spelers').doc(speler).update({
            CORRECT_FIRST:{...all_attempts[0]}
        })
        return resolve(true)
    })

module.exports.cycle_speler_correct_last = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: CORRECT_LAST (@${speler})`)
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            if (attempt.data().beoordeling === 3) all_attempts.push(attempt.data())
        }
        all_attempts.sort((a, b) => b.timestamp - a.timestamp)
        await db.collection('spelers').doc(speler).update({
            CORRECT_LAST:{...all_attempts[0]}
        })
        return resolve(true)
    })

module.exports.cycle_speler_correct_count = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: CORRECT_COUNT (@${speler})`)
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            if (attempt.data().beoordeling === 3) all_attempts.push(attempt.data())
        }
        await db.collection('spelers').doc(speler).update({
            CORRECT_COUNT:all_attempts.length
        })
        return resolve(true)
    })

module.exports.cycle_spelers_wins_all = () =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELERS: WINS_ALL`)
        let all_rounds = await cycle_ronde_all()
        let toDB = []
        for (let single_round of all_rounds) {
            if (single_round.CORRECT_FIRST) {
                let winner = single_round.CORRECT_FIRST.gebruiker
                let found = toDB.findIndex(o => o.speler === winner)
                if (found > -1) {
                    toDB[found].win_list.push({ronde:single_round.ronde, ...single_round.CORRECT_FIRST})
                } else {
                    toDB.push({speler:winner, win_list:[{ronde:single_round.ronde, ...single_round.CORRECT_FIRST}]})
                }
            }
        }
        let speler_batch = new BigBatch({firestore:db})
        for (let speler_data of toDB) {
            speler_batch.update(db.collection('spelers').doc(speler_data.speler), {
                WIN_LIST:speler_data.win_list,
                WIN_COUNT:speler_data.win_list.length
            })
        }
        await speler_batch.commit()
        return resolve(true)
    })


module.exports.cycle_speler_bonus_points_all = () =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELERS: BONUS_POINTS_ALL`)
        let all_corrects = await cycle_inzending_all_correct()
        let collate_bonus_points = []
        for (let single_correct of all_corrects) {
            if (single_correct.ronde % 100 !== 0) continue
            let i = collate_bonus_points.findIndex(o => o.speler === single_correct.gebruiker)
            if (i > -1) {
                collate_bonus_points[i].BONUS_LIST.push(single_correct)
            } else {
                collate_bonus_points.push({
                    speler:single_correct.gebruiker,
                    BONUS_LIST:[single_correct]
                })
            }
        }
        let speler_batch = new BigBatch({firestore:db})
        for (let speler of collate_bonus_points) {
            await speler_batch.update(db.collection('spelers').doc(speler.speler), {
                BONUS_LIST:speler.BONUS_LIST,
                BONUS_COUNT:speler.BONUS_LIST.length
            })
        }
        await speler_batch.commit()
        return resolve(true)
    })

module.exports.cycle_speler_fast_slow_five = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: FAST_SLOW_FIVE (@${speler})`)
        let all_rounds = await cycle_ronde_all()
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            if (attempt.data().beoordeling === 3) {
                let round_number = attempt.data().ronde
                let found_round = all_rounds.find(o => o.ronde === round_number)
                if (found_round) {
                    let round_timestamp = found_round.TIMESTAMP_START
                    let speed = attempt.data().timestamp - round_timestamp
                    all_attempts.push({speed:speed, ...attempt.data()})
                }
            }
        }
        all_attempts.sort((a, b) => a.speed - b.speed)
        let fast_five = []
        for (let i = 0; i < 5; i++) {
            if (all_attempts[i]) fast_five.push(all_attempts[i])
        }
        all_attempts.sort((a, b) => b.speed - a.speed)
        let slow_five = []
        for (let i = 0; i < 5; i++) {
            if (all_attempts[i]) slow_five.push(all_attempts[i])
        }
        await db.collection('spelers').doc(speler).update({
            'FAST_FIVE':fast_five,
            'SLOW_FIVE':slow_five
        })
        return resolve(true)
    })

module.exports.cycle_speler_serie_list = (speler) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: SERIE_LIST (@${speler})`)
        let attempts = await db.collection('inzendingen').where('gebruiker', '==', speler).get()
        let all_attempts = []
        for (let attempt of attempts.docs) {
            if (attempt.data().beoordeling === 3) {
                all_attempts.push(attempt.data())
            }
        }
        all_attempts.sort((a, b) => a.ronde - b.ronde)
        let series = []
        let current_serie = []
        let i = 1
        for (let attempt of all_attempts) {
            if (i === 1) {
                current_serie.push(attempt)
            } else if (i === all_attempts.length) {
                current_serie.push(attempt)
                if (current_serie.length > 1) series.push({SERIES:current_serie, LENGTH:current_serie.length})
            } else if (current_serie.length > 0 && current_serie[current_serie.length - 1].ronde === attempt.ronde - 1) {
                current_serie.push(attempt)
            } else {
                if (current_serie.length > 1) series.push({SERIES:current_serie, LENGTH:current_serie.length})
                current_serie = []
                current_serie.push(attempt)
            }
            i++
        }
        await db.collection('spelers').doc(speler).update({SERIES_LIST:series})

        return resolve(true)
    })

module.exports.cycle_speler_years_list = (speler, all_rounds, all_clips, all_corrects, current_round) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: YEARS_LIST (@${speler})`)
        let speler_corrects = []
        for (let single_correct of all_corrects) {
            if (single_correct.gebruiker === speler && single_correct.ronde < parseInt(current_round, 10)) speler_corrects.push(single_correct.ronde)
        }
        let years_list = []
        for (let single_speler_correct of speler_corrects) {
            let found_round = all_rounds.find(o => o.ronde === single_speler_correct)
            let found_clip = all_clips.find(o => o.id === found_round.clip)
            let i = years_list.findIndex(o => o.year === found_clip.jaar)
            if (i > -1) {
                years_list[i].count++
            } else {
                years_list.push({year:found_clip.jaar, count:1})
            }
        }
        years_list.sort((a, b) => b.count - a.count)
        await db.collection('spelers').doc(speler).update({YEARS_LIST:years_list})
        return resolve(true)
    })

module.exports.cycle_speler_medium_count = (speler, all_corrects) =>
    new Promise(async resolve => {
        console.log(`CYCLE_SPELER: MEDIUM_COUNT (@${speler})`)
        let speler_mediums = []
        for (let single_correct of all_corrects) {
            if (single_correct.gebruiker === speler) {
                let ditMedium = single_correct.medium
                if (single_correct.medium === 'inzendingen_vangnet' || single_correct.medium === 'dm_vangnet') ditMedium = 'twitter'
                let mediumIndex = speler_mediums.findIndex(o => o.medium === ditMedium)
                if (mediumIndex > -1) {
                    speler_mediums[mediumIndex].count++
                } else {
                    speler_mediums.push({medium:ditMedium, count:1})
                }
            }
        }
        await db.collection('spelers').doc(speler).update({MEDIUM_COUNT:speler_mediums})
        return resolve(true)
    })

module.exports.cycle_speler_taart_all = (all_corrects, all_rounds) =>
    new Promise(async resolve => {
        let taartrondes = []
        for (let r of all_rounds) {
            if (r.EPISODE === 1 && r.SEASON > 1) {
                taartrondes.push(r.ronde)
            }
        }
        let taartpunten = []
        for (let c of all_corrects) {
            if (taartrondes.includes(c.ronde)) {
                let i = taartpunten.findIndex(o => o.speler === c.gebruiker)
                if (i > -1) {
                    taartpunten[i].count++
                } else {
                    taartpunten.push({speler:c.gebruiker, count:1})
                }
            }
        }
        let batch = new BigBatch({firestore:db})
        for (let t of taartpunten) {
            await batch.update(db.collection('spelers').doc(t.speler), {taart:t.count})
        }
        await batch.commit()
        return resolve(true)
    })
