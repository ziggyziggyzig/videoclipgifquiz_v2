const {db} = require("../outside_connections/firebase/client")
const {BigBatch} = require("@qualdesk/firestore-big-batch")
const Firestore = require("@bountyrush/firestore/build/src")

module.exports.run_db_trigger = async (inzending_id) =>
    new Promise(async resolve => {

        let inzending = await db.collection('inzendingen').doc(inzending_id).get()
        let inzending_data = inzending.data()


        if (inzending_data.beoordeling === 3) {

            let batch = new BigBatch({firestore:db})

            console.log(`--- Updating data for ${inzending_data.gebruiker}, round ${inzending_data.ronde} ---`)

            let spelerRef = db.collection('spelers').doc(inzending_data.gebruiker)
            let speler = await spelerRef.get()
            let speler_data = speler.data()

            let rondeRef = db.collection('rondes').doc(String(inzending_data.ronde))
            let ronde = await rondeRef.get()
            let ronde_data = ronde.data()

            // let clipRef = db.collection('clips').doc(ronde_data.clip)
            // let clip = await clipRef.get()
            // let clip_data = clip.data()

            if (ronde_data.EPISODE === 1 && ronde_data.SEASON > 1) await batch.update(spelerRef, {taart:Firestore.FieldValue.increment(1)})

            await batch.set(db.collection('GLOBAL').doc('STATS'), {
                CORRECT_COUNT:Firestore.FieldValue.increment(1),
                NEEDS_UPDATE:true
            }, {merge:true})

// speler_correct_last
            await batch.update(spelerRef, {CORRECT_LAST:inzending_data})

// speler_correct_count
            await batch.update(spelerRef, {CORRECT_COUNT:Firestore.FieldValue.increment(1)})

// speler_bonus_count
            if (inzending_data.ronde % 100 === 0) await batch.update(spelerRef, {BONUS_COUNT:Firestore.FieldValue.increment(1)})

            let round_timestamp = ronde_data.TIMESTAMP_START

// speler_fast_five
            let old_fast_five = speler_data.FAST_FIVE || []
            let speed = inzending_data.timestamp - round_timestamp
            old_fast_five.push({speed:speed, ...inzending_data})
            old_fast_five.sort((a, b) => a.speed - b.speed)
            let new_fast_five = []
            for (let i = 0; i < 5; i++) {
                if (old_fast_five[i]) new_fast_five.push(old_fast_five[i])
            }
            await batch.update(spelerRef, {'FAST_FIVE':new_fast_five})

// speler_slow_five
            let old_slow_five = speler_data.SLOW_FIVE || []
            let slow_speed = inzending_data.timestamp - round_timestamp
            old_slow_five.push({speed:slow_speed, ...inzending_data})
            old_slow_five.sort((a, b) => b.speed - a.speed)
            let new_slow_five = []
            for (let i = 0; i < 5; i++) {
                if (old_slow_five[i]) new_slow_five.push(old_slow_five[i])
            }
            await batch.update(spelerRef, {'SLOW_FIVE':new_slow_five})

// speler_series_list
            let series = speler.data.SERIES_LIST || []
            if (series.length > 0) {
                let last_series = series[series.length - 1]
                if (last_series[last_series.length - 1].ronde === parseInt(inzending_data.ronde, 10) - 1) {
                    series[series.length - 1].push(inzending_data)
                    series[series.length - 1].LENGTH++
                    await batch.update(spelerRef, {SERIES_LIST:series})
                }
            }

// speler_medium_count
            let speler_medium_count = speler_data.MEDIUM_COUNT || []
            let speler_mediumIndex = speler_medium_count.findIndex(o => o.medium === inzending_data.medium)
            if (speler_mediumIndex > -1) {
                speler_medium_count[speler_mediumIndex].count++
            } else {
                speler_medium_count.push({medium:inzending_data.medium, count:1})
            }
            await batch.update(spelerRef, {MEDIUM_COUNT:speler_medium_count})

// ronde_correct_count
            await batch.update(rondeRef, {CORRECT_COUNT:Firestore.FieldValue.increment(1)})

// ronde_correct_first
            if (!ronde_data.CORRECT_FIRST) await batch.update(rondeRef, {CORRECT_FIRST:inzending_data})

// ronde_correct_last
            await batch.update(rondeRef, {CORRECT_LAST:inzending_data})

// ronde_speed_first
            if (!ronde_data.SPEED_FIRST) await batch.update(rondeRef, {SPEED_FIRST:speed})

// ronde_speed_last
            await batch.update(rondeRef, {SPEED_LAST:speed})

            await batch.commit()

            let batch2 = new BigBatch({firestore:db})

// ronde_medium_count
            let ronde_medium_count = ronde_data.MEDIUM_COUNT || []
            let ronde_mediumIndex = ronde_medium_count.isArray() ? ronde_medium_count.findIndex(o => o.medium === inzending_data.medium) : -1
            if (ronde_mediumIndex > -1) {
                ronde_medium_count[ronde_mediumIndex].count++
            } else {
                ronde_medium_count.push({medium:inzending_data.medium, count:1})
            }
            await batch2.update(rondeRef, {MEDIUM_COUNT:ronde_medium_count})

            await batch2.commit()
        }

        return resolve(true)
    })
