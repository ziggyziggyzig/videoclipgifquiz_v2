const {spotify_client} = require("./client")

module.exports.zoek_track = (q,by_date=false) =>
    new Promise((resolve, reject) =>
        spotify_client.search({
            type:'track',
            query:q,
            market:'NL'
        })
            .then(async (res) => {
                let hit
                if (res && res.tracks && res.tracks.items && res.tracks.items.length > 0) {
                    let hits = res.tracks.items
                    by_date ?
                        await hits.sort((a, b) => a.album.release_date > b.album.release_date ? 1 : -1)
                        :
                        await hits.sort((a, b) => a.popularity < b.popularity ? 1 : -1)
                    hit = hits[0]
                } else {
                    return resolve([])
                }
                let duration_m = Math.floor(hit.duration_ms / 60000)
                let toResolve = {
                    album_titel:hit.album.name,
                    album_jaar:hit.album.release_date.substring(0, 4),
                    album_track_nr:hit.track_number,
                    duration_m:duration_m,
                    duration_s:Math.floor(hit.duration_ms / 1000) - (duration_m * 60)
                }
                return resolve(toResolve)
            })
            .catch(e=>{
                console.log(e)
                return reject(e)
            })
    )
