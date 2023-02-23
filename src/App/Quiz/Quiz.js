import {useParams} from "react-router-dom"
import {lazy, useCallback, useEffect, useState, Suspense, useContext} from "react"
import { doc, getDoc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import "./Quiz.css"
import Loading from "../Loading/Loading"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {ToonRondeContext} from "../../Contexts/ToonRonde"

const Opgave = lazy(() => import('./Opgave/Opgave'))
const Inzendingen = lazy(() => import('./Inzendingen/Inzendingen'))
const Over = lazy(() => import('../Over/Over'))
const Statistieken = lazy(() => import('../Erelijst/Erelijst'))


const Quiz = ({loadAll,setLoadAll}) => {
    const rondeId = parseInt(useParams().rondeId, 10) || null
    const [, setGevraagdeClipData] = useState(null)
    const [{toonRondeNummer}, dispatchToonRonde] = useContext(ToonRondeContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

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
            if (rondeId && (rondeId < 1 || rondeId >= huidigeRondeNummer)) {
                window.location.href = '/'
            }
            if (rondeId && rondeId <= huidigeRondeNummer) {
                setRound(rondeId)
            } else {
                setRound(huidigeRondeNummer)
            }
        }
    }, [rondeId, huidigeRondeNummer, setRound])

    return <div className="quiz_container">
        <Suspense fallback={<Loading/>}>
            <Opgave loadingComplete={() => setLoadAll()}/>
            {loadAll && <>
                <Inzendingen/>
                <Statistieken/>
                <Over/>
            </>}
        </Suspense>
    </div>

}

export default Quiz