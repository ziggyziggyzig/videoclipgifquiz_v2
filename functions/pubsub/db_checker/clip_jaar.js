const {db} = require("../../outside_connections/firebase/client")
const {zoek_track} = require("../../outside_connections/spotify/tracks")
const {BigBatch} = require("@qualdesk/firestore-big-batch")

module.exports.clip_jaar = () =>
    new Promise(async (resolve) => {
        let clipsSnap = await db.collection('clips').get()
        let batch = new BigBatch({firestore:db})
        let c = 0
        for (let clip of clipsSnap.docs) {
            if (clip.data().jaar) continue
            if (c >= 5) break
            let q = `${clip.data().titel} ${clip.data().artiest}`
            let spotify_track = await zoek_track(q)
            if (spotify_track.album_jaar) {
                console.log(q, spotify_track.album_jaar)
                batch.update(clip.ref, {jaar:parseInt(spotify_track.album_jaar,10)})
            }
            else {
                console.log(q, spotify_track.album_jaar)
                batch.update(clip.ref, {jaar:0})
            }
            c++
        }
        await batch.commit()
        return resolve(true)
    })
