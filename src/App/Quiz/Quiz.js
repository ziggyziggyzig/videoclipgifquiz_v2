import {useParams} from "react-router-dom"
import {lazy, useCallback, useEffect, useState, Suspense, useContext} from "react"
import {collection, doc, getDoc, onSnapshot} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import "./Quiz.css"
import Loading from "../Loading/Loading"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {UsersContext} from "../../Contexts/Users"
import {ToonRondeContext} from "../../Contexts/ToonRonde"

const Opgave = lazy(() => import('./Opgave/Opgave'))
const Inzendingen = lazy(() => import('./Inzendingen/Inzendingen'))
const Over = lazy(() => import('../Over/Over'))
const Statistieken = lazy(() => import('../Erelijst/Erelijst'))


const Quiz = () => {
    const rondeId = parseInt(useParams().rondeId, 10) || null
    const [, dispatchUsers] = useContext(UsersContext)
    const [, setGevraagdeClipData] = useState(null)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)
    const [{toonRondeNummer}, dispatchToonRonde] = useContext(ToonRondeContext)
    const [loadingStep, setLoadingStep] = useState(0)

    const setRound = useCallback((id) => {
        const getData = async () => {
            let r = await getDoc(doc(db, 'rondes', String(id)))
            let rdata = r.data()
            dispatchToonRonde({type:'SET', toonRondeNummer:id, toonRondeData:rdata})
            if (rdata.clip && toonRondeNummer < huidigeRondeNummer) {
                let c = await getDoc(doc(db, 'clips', rdata.clip))
                let cdata = c.data()
                setGevraagdeClipData(cdata)
            } else {
                rdata.antwoord && delete rdata.antwoord
                rdata.CORRECT_FIRST && delete rdata.CORRECT_FIRST.tekst
                rdata.CORRECT_LAST && delete rdata.CORRECT_LAST.tekst
                let c = await getDoc(doc(db, 'clips', rdata.clip))
                let cdata = c.data()
                let toClipState = {
                    id:cdata.id,
                    ronde:cdata.ronde
                }
                setGevraagdeClipData(toClipState)
            }
        }
        getData()
    }, [dispatchToonRonde, huidigeRondeNummer, toonRondeNummer])

    useEffect(() => {
        if (huidigeRondeNummer) {
            if (rondeId && (rondeId<1 || rondeId>=huidigeRondeNummer)) {
                window.location.href = '/'
            }
            if (rondeId && rondeId <= huidigeRondeNummer) {
                setRound(rondeId)
            } else {
                setRound(huidigeRondeNummer)
            }
        }
    }, [rondeId, huidigeRondeNummer, setRound])

    useEffect(() => {
        if (loadingStep >= 1) {
            const unsubscribe = onSnapshot(collection(db, "users"), async (users) => {
                let toContext = []
                for (let user of users.docs) {
                    let {
                        TWITTER_UID,
                        GOOGLE_UID,
                        MASTODON_ACCOUNT,
                        MASTODON_URL,
                        MASTODON_DISPLAYNAME,
                        BONUS_COUNT,
                        DISPLAYNAME,
                        OWN_ACCOUNT,
                        TAART_COUNT,
                        TWITTER_HANDLE,
                        CORRECT_COUNT,
                        SERIES_LIST,
                        WIN_COUNT,
                        FAST_FIVE,
                        WIN_LIST,
                        donateur
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
                        TWITTER:!!TWITTER_UID,
                        GOOGLE:!!GOOGLE_UID,
                        MASTODON:!!MASTODON_ACCOUNT,
                        MASTODON_URL:MASTODON_URL || null,
                        MASTODON_DISPLAYNAME: MASTODON_DISPLAYNAME || null,
                        WIN_LIST:WIN_LIST || [],
                        donateur:donateur || false
                    })
                }
                dispatchUsers({type:"SET", usersData:toContext})
            })

            return () => {
                unsubscribe()
            }
        }
    }, [dispatchUsers, huidigeRondeNummer, loadingStep])

    return <div className="quiz_container">
        <Suspense fallback={<Loading/>}>
            {loadingStep >= 0 && <Opgave loadingComplete={() => setLoadingStep(1)}/>}
            {loadingStep >= 1 && <>
                <Inzendingen/>
                <Statistieken/>
                <Over/>
            </>}
        </Suspense>
    </div>

}

export default Quiz