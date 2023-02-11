import {initializeApp} from "firebase/app"
import {initializeAppCheck, ReCaptchaV3Provider} from "firebase/app-check"
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
import {getAuth, GoogleAuthProvider, TwitterAuthProvider} from "firebase/auth"
import {getFunctions, httpsCallable} from "firebase/functions"
import {getAnalytics} from "firebase/analytics"

const app = initializeApp(require(`./FirebaseConfig.json`))

if (window.location.hostname === "localhost" || window.location.hostname.includes("192.168")) window.FIREBASE_APPCHECK_DEBUG_TOKEN = true

const appCheck = initializeAppCheck(app, {
    provider:new ReCaptchaV3Provider('6LfqGKIgAAAAAEJa5LUZ-ute1QEIyjS__jnAiRnM')
})
const db = getFirestore(app)
const storage = getStorage(app)
const analytics = getAnalytics(app)

const auth = getAuth(app)
auth.useDeviceLanguage()

const googleProvider = new GoogleAuthProvider()
const twitterProvider = new TwitterAuthProvider()

const functions = getFunctions(app)
const adminFunctions = httpsCallable(functions, 'admin')
// const antwoordVanWebsite = httpsCallable(functions, 'antwoord_van_website')
const antwoordVanWebsite_v2 = httpsCallable(functions, 'antwoord_van_website_v2')
const zoekTwitterNaam = httpsCallable(functions, 'zoek_twitter_naam')

export {
    appCheck,
    db,
    storage,
    analytics,
    auth,
    googleProvider,
    twitterProvider,
    adminFunctions,
    antwoordVanWebsite_v2,
    zoekTwitterNaam
}
