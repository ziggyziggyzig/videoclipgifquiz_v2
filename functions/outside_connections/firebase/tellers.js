const {db}=require('./client')

module.exports.huidige_ronde = () =>
    new Promise((resolve) =>
        db.collection('tellers').doc('huidige_ronde').get()
            .then(doc =>
                resolve(doc.data().id)
            ))

module.exports.update_huidige_ronde = (ronde) =>
    db.collection('tellers').doc('huidige_ronde').update({id: ronde})

module.exports.laatste_feestscore=()=>
    new Promise((resolve) =>
        db.collection('tellers').doc('feestscore').get()
            .then(doc =>
                resolve(doc.data().count)
            ))

module.exports.update_feestscore = (c) =>
    db.collection('tellers').doc('feestscore').update({count: c})
