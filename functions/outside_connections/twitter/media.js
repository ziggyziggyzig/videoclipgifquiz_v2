const {twitter_client}=require('./client')

const imageToBase64 = require("image-to-base64")

module.exports.gif_uploaden = (clip, storage) =>
    new Promise(async (resolve, reject) => {
        let clip = 'test1'
        try {
            let fileRef = await storage.file(`clips/${clip}.gif`)
            let [metaData] = await fileRef.getMetadata()
            const mediaFile = await fileRef.download({validation: false})
                .catch(e => {
                    console.error(JSON.stringify(e))
                    return reject(e)
                })

            let mediaData
            let chunks
            imageToBase64(metaData.mediaLink)
                .then(response => mediaData = `data:image/gif;base64,${response}`)
                // .then(response => mediaData = `${response}`)
                .then(async () => chunks = await chunkSubstr(mediaData, 1024000))
                .then(() => initializeMediaUpload())
                .then(mediaid => appendFileChunk(mediaid))
                .then(mediaid => finalizeUpload(mediaid))
                .then(mediaId => resolve(mediaId))
                .catch(e => {
                    console.error(JSON.stringify(e))
                    return reject(e)
                })

            function chunkSubstr(str, size) {
                return new Promise((resolve) => {
                    const numChunks = Math.ceil(str.length / size)
                    const chunks = new Array(numChunks)

                    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                        chunks[i] = str.substr(o, size)
                    }

                    return resolve(chunks)
                })
            }

            function initializeMediaUpload() {
                return new Promise(async function (resolve, reject) {
                    console.log("INIT")
                    // console.log(chunks[0].substr(0, 100))
                    try {
                        let response = await twitter_client.post('media/upload', {
                            command: 'INIT',
                            total_bytes: mediaData.length,
                            media_type: 'image/gif'
                        })
                        console.log(mediaData.length)
                        return resolve(response.media_id_string)
                    } catch (e) {
                        console.error(JSON.stringify(e))
                        return reject(e)
                    }
                })
            }

            function appendFileChunk(mediaId) {
                return new Promise(async function (resolve, reject) {
                    console.log("APPEND", mediaId)
                    try {
                        chunks.forEach((chunk, index) => {
                            console.log(index)
                            return twitter_client.post('media/upload', {
                                    command: 'APPEND',
                                    media_id: mediaId,
                                    media: mediaData,
                                    segment_index: index
                                }
                            )
                        })
                        return resolve(mediaId)
                    } catch (e) {
                        console.error(JSON.stringify(e))
                        return reject(e)
                    }
                })
            }

            function finalizeUpload(mediaId) {
                return new Promise(async function (resolve, reject) {
                    try {
                        console.log("FINALIZE", mediaId)
                        let response = await twitter_client.post('media/upload', {
                            command: "FINALIZE",
                            media_id: mediaId
                        })
                        console.log(response)
                        setTimeout(() => {
                            return resolve(mediaId)
                        }, 2500)
                    } catch (e) {
                        console.error(JSON.stringify(e))
                        return reject(e)

                    }
                })
            }

        } catch (e) {
            console.error(JSON.stringify(e))
        }
    })
