import './Login.css'
import {useEffect, useState} from "react"
import {adminFunctions, db, zoekTwitterNaam} from "../../Firebase/Firebase"
import {doc, getDoc} from "firebase/firestore"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const Login = ({newUser, loginVoltooid, uitloggen}) => {

    const [displayName, setDisplayName] = useState('')
    const [twitterHandle, setTwitterHandle] = useState(null)
    const [opslaanActief, setOpslaanActief] = useState(false)
    const [, dispatchCurrentUser] = useState(CurrentUserContext)

    useEffect(() => {
        const getHandle = async () => {
            setOpslaanActief(false)
            let data = await zoekTwitterNaam({twitter_uid:newUser.providerData[0].uid})
            data && data.data && setTwitterHandle(data.data)
        }

        if (!twitterHandle && newUser && newUser.providerData && newUser.providerData[0] && newUser.providerData[0].providerId === "twitter.com") getHandle()

    }, [newUser, twitterHandle])

    useEffect(() => {
        if (displayName.length > 0 && displayName.length < 32)
            setOpslaanActief(true)
        else
            setOpslaanActief(false)
    }, [displayName])

    const keuzeOpslaan = async () => {
        let data = {
            AUTH_UID:[newUser.uid],
            DISPLAYNAME:displayName
        }
        if (newUser.providerData && newUser.providerData.length > 0) {
            for (let providerData of newUser.providerData) {
                switch (providerData.providerId) {
                    case "twitter.com":
                        data = {
                            TWITTER_UID:parseInt(providerData.uid, 10),
                            TWITTER_DISPLAYNAME:providerData.displayName,
                            TWITTER_PHOTOURL:providerData.photoURL,
                            TWITTER_HANDLE:twitterHandle,
                            ...data
                        }
                        break
                    case "google.com":
                        data = {
                            GOOGLE_UID:String(providerData.uid),
                            GOOGLE_DISPLAYNAME:providerData.displayName,
                            GOOGLE_EMAIL:providerData.email,
                            GOOGLE_PHOTOURL:providerData.photoURL,
                            ...data
                        }
                        break
                    default:
                }
            }
        }
        if (twitterHandle) {
            let speler = await getDoc(doc(db, 'spelers', twitterHandle))
            if (speler.data()) {
                let speler_data = speler.data()
                data = {
                    ATTEMPT_FIRST:speler_data.ATTEMPT_FIRST || {},
                    BONUS_COUNT:speler_data.BONUS_COUNT || 0,
                    BONUS_LIST:speler_data.BONUS_LIST || [],
                    CORRECT_COUNT:speler_data.CORRECT_COUNT || 0,
                    CORRECT_FIRST:speler_data.CORRECT_FIRST || {},
                    CORRECT_LAST:speler_data.CORRECT_LAST || {},
                    FAST_FIVE:speler_data.FAST_FIVE || [],
                    MEDIUM_COUNT:speler_data.MEDIUM_COUNT || [],
                    SERIES_LIST:speler_data.SERIES_LIST || [],
                    SLOW_FIVE:speler_data.SLOW_FIVE || [],
                    WIN_COUNT:speler_data.WIN_COUNT || 0,
                    WIN_LIST:speler_data.WIN_LIST || [],
                    YEARS_LIST:speler_data.YEARS_LIST || [],
                    TAART_COUNT:speler_data.taart || 0,
                    ...data
                }
            }
        }
        console.log(data)
        // let docRef = await addDoc(collection(db, 'users'), data)
        let doc_id = await adminFunctions({
            context:'user_id',
            action:'add_user',
            content:data
        })
        dispatchCurrentUser({
            type:"SET",
            currentUserData:{USER_ID:doc_id, ...data}
        })
        loginVoltooid()
    }

    return newUser && newUser.providerData && <div className="login">
        <h2 className="font_sans_bold">Welkom!</h2>
        <p className="font_serif_normal">
            Je hebt nog niet eerder ingelogd bij de videoclipgifquiz.<br/>
            Daarom is het nodig dat je aangeeft met welke naam je in de uitslagenlijst wil komen als je een goed
            antwoord hebt gegeven.<br/>
            Klik op een van de volgende suggesties of vul onderaan zelf een naam in.<br/>
            Je kan dit later altijd zelf nog wijzigen.
        </p>
        {newUser.providerData[0] && newUser.providerData[0].providerId === "google.com" &&
            <p className="font_mono_bold login_klikker"
               onClick={() => setDisplayName(newUser.providerData[0].email.split('@')[0])}>
                {newUser.providerData[0].email.split('@')[0]}
            </p>}
        {newUser.providerData[0] && (newUser.providerData[0].providerId === "google.com" || newUser.providerData[0].providerId === "twitter.com") &&
            <p className="font_mono_bold login_klikker"
               onClick={() => setDisplayName(newUser.providerData[0].displayName)}>
                {newUser.providerData[0].displayName}
            </p>}
        {newUser.providerData[0] && newUser.providerData[0].providerId === "twitter.com" && twitterHandle &&
            <p className="font_mono_bold login_klikker" onClick={() => setDisplayName(`@${twitterHandle}`)}>
                @{twitterHandle}
            </p>}

        <p className="font_mono_bold">
            <input type="text" className="login_tekstveld font_mono_bold"
                   onChange={(e) => setDisplayName(e.target.value)} value={displayName}/>
        </p>
        <p>
            <input type="button" className={`${opslaanActief ? 'login_knop' : 'login_knop_disabled'}`} value="opslaan"
                   disabled={!opslaanActief}
                   onClick={() => keuzeOpslaan()}/>&nbsp;
            <input type="button" className="login_knop" value="annuleren"
                   onClick={() => uitloggen()}/>
        </p>
        <hr/>
        <h3 className="font_sans_normal">De "kleine" lettertjes:</h3>
        <p className="font_serif_normal oranje">
            Ik sla een paar gegevens van je op.<br/>
            {newUser.providerData[0] && newUser.providerData[0].providerId === "google.com" &&
                <>Van je Google-account neem ik je email-adres, je bij Google ingestelde naam en je Google-UUID (dat is
                    een unieke cijfer- en lettercode die aan je Google-account is gekoppeld) over in de database van
                    de quiz.<br/></>
            }
            {newUser.providerData[0] && newUser.providerData[0].providerId === "twitter.com" &&
                <>Van je Twitter-account neem ik je Twitterhandle (dat is je @-naam), je bij Twitter ingestelde naam en
                    je Twitter-ID (dat is een bepaalde cijfercode die aan je Twitter-account is gekoppeld) over in de
                    database van
                    de quiz.<br/></>
            }
            Ik beloof hierbij plechtig dat ik je gegevens nooit zal misbruiken of doorgeven aan andere partijen. Mocht
            je willen weten wat ik precies van je hebt opgeslagen en iets willen laten verwijderen, stuur me dan even
            een privéberichtje op <a href="https://twitter.com/ziggyziggyzig" target="_new">Twitter</a>.

        </p>
        <p className="font_serif_normal oranje">Wil je dit allemaal niet, klik dan hierboven op <i>annuleren</i>. Je
            login wordt dan ongedaan gemaakt en ik sla niets van je op.
        </p>
        <p className="font_serif_normal oranje">
            Mocht je nu inloggen met een andere provider (Google, Twitter, etc) dan je in het verleden hebt gedaan, laat
            het dan even weten, dan kan ik je verschillende logins samenvoegen tot één spelersaccount.
        </p>
        <p className="font_serif_normal oranje">
            Deze site zet een paar cookies op je apparaat, voornamelijk om je login te kunnen onthouden en om het
            verkeer op deze site te kunnen registreren en tellen.
        </p>
    </div>
}

export default Login
