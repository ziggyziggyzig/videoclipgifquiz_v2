const {db} = require('./client')

module.exports.vul_beoordelingen=()=> {
    let batch = db.batch()
    let cycle = new Promise((resolve) => {
        let index = 0

        db.collection('scores').get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        let id=doc.id
                        batch.set(
                            db.collection('scores').doc(id),
                            {
                                beoordeling: 3
                            }, {merge: true}
                        )
                        return index++
                    })
                    if (index === snapshot.size) {
                        return resolve()
                    }
                }
            })
    })
    return cycle
        .then(() => batch.commit())
}
