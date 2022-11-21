const moment = require('moment-timezone')

const {db} = require("../../outside_connections/firebase/client")

const {BigBatch} = require("@qualdesk/firestore-big-batch")

const Firestore = require("@bountyrush/firestore/build/src")

const {
    cycle_ronde_all,
    cycle_ronde_correct_count,
    cycle_ronde_correct_first,
    cycle_ronde_correct_last,
    cycle_ronde_speed_first,
    cycle_ronde_speed_last,
    cycle_ronde_medium_count,
    cycle_ronde_season_episode
} = require("./ronde")

const {
    cycle_current_round,
    cycle_feestinzending,
    cycle_check_feestscore
} = require("./tellers")

const {
    cycle_clip_all
} = require("./clip")


const {
    cycle_speler_all,
    cycle_speler_attempt_first,
    cycle_speler_correct_first,
    cycle_speler_correct_last,
    cycle_speler_correct_count,
    cycle_speler_bonus_points_all,
    cycle_spelers_wins_all,
    cycle_speler_fast_slow_five,
    cycle_speler_serie_list,
    cycle_speler_years_list,
    cycle_speler_medium_count,
    cycle_speler_taart_all
} = require("./speler")

const {
    converteer_tijdzones
} = require("../../helpers/time")

const {
    cycle_global_artiesten,
    cycle_global_jaren
} = require("./global")

const {
    cycle_inzending_speeds
} = require("./inzending")

module.exports.run_cycle = (mode = null) =>
    new Promise(async resolve => {

        let own_accounts = ['Treindienstldr', 'regenrace', 'videoclipquiz', 'ziggyziggyzig']

        let time_now = moment.utc().tz("Europe/Amsterdam")

        let hours_now = mode && mode === parseInt(mode, 10) ? mode : parseInt(time_now.format("H"), 10)

        let run03 = hours_now === 3
        let run04 = hours_now === 4
        let run19 = hours_now === 19
        let run20 = hours_now === 20
        let run21 = hours_now === 21

        let {current_round, current_episode} = await cycle_current_round()

        let all_rounds = await cycle_ronde_all()

        let all_corrects_snap = await db.collection('inzendingen').where('beoordeling', '==', 3).get()
        let all_corrects = []

        for (let c of all_corrects_snap.docs) {
            all_corrects.push(c.data())
        }

        console.log(`RUN_CYCLE at ${time_now} --- current round: ${current_round} --- run03: ${run03} / run04: ${run04} / run19: ${run19} / run20: ${run20} / run21: ${run21}`)

        for (let single_round of all_rounds) {
            let round_number = single_round.ronde

            if (!single_round.SEASON || !single_round.EPISODE) await cycle_ronde_season_episode(round_number)

            if (
                (round_number <= current_round && !single_round.SPEED_FIRST) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round) ||
                (run20 && current_round - round_number === 1)
            )
                await cycle_ronde_speed_first(round_number)

            if (
                (round_number <= current_round && !single_round.SPEED_LAST) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round) ||
                (run20 && current_round - round_number === 1)
            )
                await cycle_ronde_speed_last(round_number)

            if (
                (round_number <= current_round && !single_round.CORRECT_COUNT) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round)
            )
                await cycle_ronde_correct_count(round_number, all_corrects)

            if (
                (round_number <= current_round && !single_round.CORRECT_FIRST) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round)
            )
                await cycle_ronde_correct_first(round_number, all_corrects)

            if (
                (round_number <= current_round && !single_round.CORRECT_LAST) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round)
            )
                await cycle_ronde_correct_last(round_number, all_corrects)

            if (
                (round_number <= current_round && !single_round.MEDIUM_COUNT) ||
                (run03 && round_number > current_round - 2 && round_number <= current_round)
            )
                await cycle_ronde_medium_count(round_number, all_corrects)

            if (!single_round.TIMESTAMP_START) {
                await db.collection('rondes').doc(String(round_number)).update({
                    TIMESTAMP_START:parseInt(
                        converteer_tijdzones(
                            `${single_round.start} 20:15:00`,
                            "YYYY-MM-DD HH:mm:ss",
                            "x",
                            "Europe/Amsterdam",
                            "UTC"
                        ),
                        10
                    )
                })
            }

            if (!single_round.TIMESTAMP_END) {
                let upcoming_round = all_rounds.find(o => o.ronde === round_number + 1)
                if (upcoming_round) {
                    await db.collection('rondes').doc(String(round_number)).update({
                        TIMESTAMP_END:parseInt(
                            converteer_tijdzones(
                                `${upcoming_round.start} 20:15:00`,
                                "YYYY-MM-DD HH:mm:ss",
                                "x",
                                "Europe/Amsterdam",
                                "UTC"
                            ),
                            10
                        )
                    })
                }
            }
        }

        let all_clips = await cycle_clip_all()

        let clip_batch = new BigBatch({firestore:db})

        let updated_clips = false

        for (let single_clip of all_clips) {

            let found_round = all_rounds.find(r => r.clip === single_clip.id)

            if (found_round && single_clip.ronde !== found_round.ronde) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {ronde:found_round.ronde})
                updated_clips = true
            } else if (!found_round && single_clip.ronde) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {ronde:Firestore.FieldValue.delete()})
                updated_clips = true
            }

            if (found_round && found_round.ronde < current_round && single_clip.status !== 2) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {status:2})
                updated_clips = true
            } else if (found_round && found_round.ronde >= current_round && single_clip.status !== 1) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {status:1})
                updated_clips = true
            } else if (!found_round && single_clip.status !== 0) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {status:0})
                updated_clips = true
            }

            if (!new RegExp(single_clip.x_artiest, "ig").test(single_clip.artiest) && single_clip.REGEX_ARTIST_CORRECT !== 0) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {REGEX_ARTIST_CORRECT:0})
                updated_clips = true
            } else if (new RegExp(single_clip.x_artiest, "ig").test(single_clip.artiest) && single_clip.REGEX_ARTIST_CORRECT !== 1) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {REGEX_ARTIST_CORRECT:1})
                updated_clips = true
            }

            if (!new RegExp(single_clip.x_titel, "ig").test(single_clip.titel) && single_clip.REGEX_TITLE_CORRECT !== 0) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {REGEX_TITLE_CORRECT:0})
                updated_clips = true
            } else if (new RegExp(single_clip.x_titel, "ig").test(single_clip.titel) && single_clip.REGEX_TITLE_CORRECT !== 1) {
                await clip_batch.update(db.collection('clips').doc(single_clip.id), {REGEX_TITLE_CORRECT:1})
                updated_clips = true
            }

        }

        await clip_batch.commit()

        let all_spelers = await cycle_speler_all()

        let winners_count = 0

        for (let single_speler of all_spelers) {

            if (single_speler.BLOCKED) continue

            if (single_speler.WIN_COUNT && single_speler.WIN_COUNT > 0) winners_count++

            if (!single_speler.ATTEMPT_FIRST) await cycle_speler_attempt_first(single_speler.speler)

            if (!single_speler.CORRECT_FIRST) await cycle_speler_correct_first(single_speler.speler)

            if (single_speler.rondescore) await db.collection('spelers').doc(single_speler.speler).update({
                rondescore:Firestore.FieldValue.delete()
            })

            if (single_speler.rondescoretest) await db.collection('spelers').doc(single_speler.speler).update({
                rondescoretest:Firestore.FieldValue.delete()
            })

            if (single_speler.scores) await db.collection('spelers').doc(single_speler.speler).update({
                scores:Firestore.FieldValue.delete()
            })

            if (!single_speler.CORRECT_LAST || run03) await cycle_speler_correct_last(single_speler.speler)

            if (!single_speler.CORRECT_COUNT || run03) await cycle_speler_correct_count(single_speler.speler)

            if (!single_speler.FAST_FIVE || !single_speler.SLOW_FIVE || run03) await cycle_speler_fast_slow_five(single_speler.speler)

            if (!single_speler.SERIES_LIST || run04) await cycle_speler_serie_list(single_speler.speler)

            if (!single_speler.YEARS_LIST || run20) await cycle_speler_years_list(single_speler.speler, all_rounds, all_clips, all_corrects, current_round)

            if (!single_speler.MEDIUM_COUNT || run03) await cycle_speler_medium_count(single_speler.speler, all_corrects)
        }

        if (run21 || run03) {

            await cycle_spelers_wins_all()

        }

        if (run20 || run03) {

            if (current_round % 100 === 1) await cycle_speler_bonus_points_all()

            if (current_episode <= 2) await cycle_speler_taart_all(all_corrects, all_rounds)
        }

        let batch = new BigBatch({firestore:db})
        let all_attempts = await db.collection('inzendingen').get()
        for (let single_attempt of all_attempts.docs) {
            if (own_accounts.includes(single_attempt.data().gebruiker)) {
                await batch.delete(db.collection('inzendingen').doc(single_attempt.id))
            }
            if (single_attempt.data().timestamp && (!single_attempt.data().ronde || single_attempt.data().ronde === 0)) {
                let found_round = all_rounds.find(o => o.TIMESTAMP_START < single_attempt.data().timestamp && o.TIMESTAMP_END > single_attempt.data().timestamp)
                if (found_round && found_round.ronde) await batch.update(db.collection('inzendingen').doc(single_attempt.id), {ronde:found_round.ronde})
            }
        }
        for (let single_speler of all_spelers) {
            if (own_accounts.includes(single_speler.speler)) {
                await batch.delete(db.collection('spelers').doc(single_speler.speler))
            }
        }

        await batch.commit()

        let feestinzending = await cycle_feestinzending()

        await cycle_check_feestscore(feestinzending.count, all_corrects)

        if (run20) {

            await cycle_global_artiesten(all_clips, all_corrects)

            await cycle_global_jaren(all_clips, all_corrects)

        }

        if (run03) {
            await cycle_inzending_speeds(all_corrects, all_rounds)
        }

        let stats = await db.collection('GLOBAL').doc('STATS').get()

        if (run03 || run19 || updated_clips || stats.data().NEEDS_UPDATE) {

            if (updated_clips) all_clips = await cycle_clip_all()

            await db.collection('GLOBAL').doc('STATS').set({
                SPELER_COUNT:all_spelers.length,
                CORRECT_COUNT:all_corrects.length,
                WINNERS_COUNT:winners_count,
                CORRECT_AVG_SPELER:Math.round(all_corrects.length / all_spelers.length),
                CORRECT_AVG_RONDE:Math.round(all_corrects.length / current_round),
                CLIP_COUNT:all_clips.length,
                CLIP_PLANNED:all_clips.filter(o => o.status === 1).length - 1,
                CLIP_UNPLANNED:all_clips.filter(o => !o.status || o.status === 0).length,
                NEEDS_UPDATE:false
            }, {merge:true})

        }

        return resolve(true)
    })
