import {useContext, useEffect, useState} from "react"
import {db, storage} from "../../../Firebase/Firebase"
import {getDownloadURL, ref} from "firebase/storage"
import {query, collection, where, onSnapshot, getDoc, doc} from "firebase/firestore"
import Kop from "./Kop"
import Gif from "./Gif"
import Voet from "./Voet"
import Hints from "./Hints"
import "./Opgave.css"
import Loading from "../../Loading/Loading"
import {HuidigeRondeContext} from "../../../Contexts/HuidigeRonde"
import {ToonRondeContext} from "../../../Contexts/ToonRonde"

const Opgave = ({loadingComplete}) => {
    const [clipUrl, setClipUrl] = useState(null)
    const [hints, setHints] = useState([])
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)
    const [{toonRondeNummer, toonRondeData}] = useContext(ToonRondeContext)
    const [clipData, setClipData] = useState(null)

    useEffect(() => {
        if (clipUrl && huidigeRondeNummer && toonRondeNummer && toonRondeData) loadingComplete()
    })

    useEffect(() => {
        const fetchData = async () => {
            if (toonRondeNummer < huidigeRondeNummer) {
                let clip = await getDoc(doc(db, 'clips', toonRondeData.clip))
                setClipData(clip.data())
            }
            setClipUrl(await getDownloadURL(ref(storage, `clips/${toonRondeData.clip}.gif`)))
            return true
        }
        toonRondeNummer && toonRondeData && fetchData()
    }, [toonRondeNummer, toonRondeData,huidigeRondeNummer])

    useEffect(() => {
        let r = 0
        if (toonRondeNummer) r = parseInt(toonRondeNummer, 10)
        const q = query(collection(db, "hints"), where("ronde", "==", r))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let toState = []
            for (let hint of querySnapshot.docs) {
                toState.push({order:hint.data().order, hint:hint.data().hint, show:false})
            }
            toState.sort((a, b) => a.order - b.order)
            return setHints(toState)
        })

        return () => {
            unsubscribe()
        }
    }, [toonRondeNummer])

    if (toonRondeNummer && toonRondeData) {
        return (
            <div className="opgave"
                 style={toonRondeData.bonus ? {border:'var(--red) double 5px'} : {}}>
                <Kop oudeRonde={toonRondeNummer !== huidigeRondeNummer}/>
                {clipUrl ? <Gif url={clipUrl}/> : <Loading/>}
                {toonRondeNummer && huidigeRondeNummer && <Voet clipData={clipData}
                                                                oudeRonde={toonRondeNummer !== huidigeRondeNummer}/>}
                {hints.length > 0 && <Hints hints={hints}/>}
            </div>
        )
    } else {
        return null
    }
}

export default Opgave