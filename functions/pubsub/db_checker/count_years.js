const {db} = require('../../outside_connections/firebase/client')
const {huidige_ronde} = require("../../outside_connections/firebase/tellers")
const {BigBatch} = require("@qualdesk/firestore-big-batch")

module.exports.count_years=()=>
    new Promise(async (resolve) => {
        let batch=new BigBatch({firestore:db})
        let hr=await huidige_ronde()
        let clips = await db.collection('clips').get()
        let jaren=[]
        for (let c of clips.docs) {
            if (c.data().ronde && c.data().ronde<hr && c.data().jaar && c.data().jaar!==0) {
                let i=jaren.findIndex(o=>o.jaar===c.data().jaar)
                if (i>-1) {
                    jaren[i].count++
                    jaren[i].rondes.push(c.data().ronde)
                }
                else {
                    jaren.push({jaar:c.data().jaar,count:1,rondes:[c.data().ronde]})
                }
            }
        }
        for (let j of jaren) {
            batch.set(db.collection('stats').doc('clips').collection('jaren').doc(`${j.jaar}`),
                j, {merge: true}
            )
        }
        await batch.commit()
        console.log(JSON.stringify(jaren))
        return resolve(true)
    })
