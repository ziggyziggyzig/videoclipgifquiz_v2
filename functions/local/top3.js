const {db_fb} = require("../outside_connections/firebase/client")
const {firestore}=require('firebase-admin')

const top3=async ()=>{
    let rondes=[]
    for (let i=1;i<303;i++) {
        let dezeRonde=[]
        let snap=await db_fb.collection('inzendingen').where('ronde','==',i).orderBy('timestamp','asc').get()
            for (let d of snap.docs) {
                if (d.data().beoordeling===3) {
                    dezeRonde.push(d.data().timestamp)
                }
                if (dezeRonde.length===3) {
                    rondes.push({
                        ronde: i,
                        top3: dezeRonde[2]-dezeRonde[0]
                    })
                    break;
                }
            }
    }
    rondes.sort((b,a)=>a.top3-b.top3)
    console.log(rondes)
}

top3()
