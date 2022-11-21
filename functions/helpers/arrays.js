module.exports.snapshot_to_array = (snapshot) =>
    new Promise(resolve => {
        let array = []
        for (let d of snapshot.docs) {
            array.push({doc_id:d.id,doc_ref:d.ref, ...d.data()})
        }
        resolve(array)
    })