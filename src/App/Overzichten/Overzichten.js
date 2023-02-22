import './Overzichten.css'
import {useContext, useEffect, useState} from "react"
import {Links, Rechts, Lijn} from "./GridItems"
import Users from "./Users"
import Rondes from "./Rondes"
import {collection, onSnapshot} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {UsersContext} from "../../Contexts/Users"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"

const Overzichten = () => {
    const [showRondes, setShowRondes] = useState(false)
    const [showUsers, setShowUsers] = useState(false)
    const [{usersData}, dispatchUsers] = useContext(UsersContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), async (users) => {
            let toContext = []
            for (let user of users.docs) {
                let {
                    TWITTER_UID_STR,
                    GOOGLE_UID,
                    MASTODON_ACCOUNT,
                    BONUS_COUNT,
                    DISPLAYNAME,
                    OWN_ACCOUNT,
                    TAART_COUNT,
                    TWITTER_HANDLE,
                    CORRECT_COUNT,
                    SERIES_LIST,
                    WIN_COUNT,
                    FAST_FIVE,
                    WIN_LIST
                } = user.data()
                if (huidigeRondeNummer && WIN_LIST && WIN_LIST.length > 0) {
                    let i = WIN_LIST.findIndex(o => o.ronde === huidigeRondeNummer)
                    if (i > -1) delete WIN_LIST[i].tekst
                }
                toContext.push({
                    BONUS_COUNT:BONUS_COUNT || 0,
                    DISPLAYNAME:DISPLAYNAME,
                    OWN_ACCOUNT:OWN_ACCOUNT,
                    TAART_COUNT:TAART_COUNT,
                    TWITTER_HANDLE:TWITTER_HANDLE,
                    USER_ID:user.id,
                    CORRECT_COUNT:CORRECT_COUNT || 0,
                    SERIES_LIST:SERIES_LIST || [],
                    WIN_COUNT:WIN_COUNT || 0,
                    FAST_FIVE:FAST_FIVE || [],
                    TWITTER:!!TWITTER_UID_STR,
                    GOOGLE:!!GOOGLE_UID,
                    MASTODON:!!MASTODON_ACCOUNT,
                    WIN_LIST:WIN_LIST || []

                })
            }
            dispatchUsers({type:"SET", usersData:toContext})
        })

        return () => {
            unsubscribe()
        }
    }, [dispatchUsers, huidigeRondeNummer])

    return <div className="overzichten">
        <h2 className="font_sans_bold">Overzichten</h2>
        <p className="font_serif_normal">Hier vind je verschillende totaaloverzichten over de quiz. Klik bovenaan een
            kolom op het kopje om te sorteren.</p>
        <div className="overzichten_gridcontainer">

            <Links>Rondes</Links>
            <Rechts><span className="oranje"
                          onClick={() => setShowRondes(!showRondes)}>klik om te tonen/verbergen</span><br/>
                <i style={{fontSize:'0.8em'}}>(mobiele gebruikers: kantel scherm voor meer gegevens)</i></Rechts>
        {showRondes && <Rondes usersData={usersData}/>}
        <Lijn/>
        <Links>Spelers</Links>
        <Rechts><span className="oranje"
                      onClick={() => setShowUsers(!showUsers)}>klik om te tonen/verbergen</span><br/>
            <i style={{fontSize:'0.8em'}}>(mobiele gebruikers: kantel scherm voor meer gegevens)</i></Rechts>
        {showUsers && <Users usersData={usersData}/>}
    </div>
</div>
}

export default Overzichten