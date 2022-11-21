const {storage} = require(`../firebase/client`)
const {twitter_v2_client} = require("./client")
const getRawBody = require("raw-body")
const {EUploadMimeType} = require("twitter-api-v2")
const {schrijf_mediaId} = require("../firebase/clips")

module.exports.gif_uploaden = (clip) =>
    new Promise(async (resolve, reject) => {
        let file = await storage.bucket().file(`clips/${clip}.gif`)
        const buffer=await getRawBody(file.createReadStream())
        const mediaId=await twitter_v2_client.uploadMedia(Buffer.from(buffer), {mimeType: EUploadMimeType.Gif})
        schrijf_mediaId(clip,mediaId)
        return resolve(mediaId)
    })
