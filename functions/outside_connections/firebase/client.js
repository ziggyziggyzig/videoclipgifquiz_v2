require("dotenv").config({path: '../../.env'})

const admin = require('firebase-admin')
const {Firestore} = require("@bountyrush/firestore")

admin.initializeApp({
    credential: admin.credential.cert(
        require(`../../videoclipgifquiz-firebase-adminsdk-b3nfm-154cb344ff.json`)
    ),
    storageBucket: "videoclipgifquiz.appspot.com"
})

exports.db = new Firestore(admin)
// exports.db = admin.firestore()

exports.storage = admin.storage()
