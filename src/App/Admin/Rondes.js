import {Fragment, useContext, useEffect, useState} from "react"
import {collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {DateTime} from "luxon"
import Loading from "../Loading/Loading"

const Rondes = ({playClip}) => {
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    const [editRonde, setEditRonde] = useState(null)
    const [editRondeData, setEditRondeData] = useState(null)
    const [editClipData,setEditClipData]=useState(null)

    const [rondes, setRondes] = useState([])
    const [unusedClips, setUnusedclips] = useState([])

    const changeRondeData = (field, value) => {
        let toState = {...editClipData}
        toState[field] = value
        setEditClipData(toState)
    }

    const saveRondeData = () => {

    }

    useEffect(() => {
        let unsubscribe = onSnapshot(query(collection(db, 'rondes'), orderBy('ronde', 'asc'), where('ronde', '>', huidigeRondeNummer - 2)), async (snapshot) => {
            let toState = []
            for (let d of snapshot.docs) {
                if (d.data().clip) {
                    let c = await getDoc(doc(db, 'clips', d.data().clip))
                    toState.push({clipdata:c.data(), ...d.data()})
                } else {
                    toState.push(d.data())
                }
            }
            setRondes(toState)
        })

        return () => {
            unsubscribe()
        }
    }, [huidigeRondeNummer])

    useEffect(() => {
        const loadData = async () => {
            if (editRonde) {
                console.log(editRonde)
                let r=rondes.find(o => o.ronde === editRonde)
                setEditRondeData(r)
                let toState = []
                let c = await getDocs(query(collection(db, 'clips')))
                for (let d of c.docs) {
                    if (d.id===r.clip) setEditClipData(d.data())
                    if (d.data().status===0 && !d.data().ronde) toState.push(d.data())
                }
                toState.sort((a, b) => a.jaar === b.jaar ? a.artiest.localeCompare(b.artiest) : a.jaar - b.jaar)
                setUnusedclips(toState)
            } else {
                setEditRondeData(null)
                setEditClipData(null)
                setUnusedclips([])
            }
        }
        loadData()
    }, [editRonde,editRondeData,rondes])

    return rondes && rondes.length > 0 ? <table className="font_sans_normal admin_tabel admin_rondetabel">
            <thead>
            <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>#</td>
                <td>datum</td>
                <td>artiest</td>
                <td>titel</td>
                <td>jaar</td>
            </tr>
            </thead>
            <tbody>
            {rondes.map((i, n) =>
                editRonde && editRonde === i.ronde && editClipData ?
                    <Fragment key={i.ronde}>
                        <tr className='admin_rondetabel_edit'>
                            <td>
                                <button onClick={() => setEditRonde(null)}>
                                    <i className="fa-solid fa-rotate-left"/>
                                </button>
                            </td>
                            <td>
                                <button>
                                    <i className="fa-solid fa-floppy-disk"/>
                                </button>
                            </td>
                            <td/>
                            <td/>
                            <td>
                                <input type="text" defaultValue={i.ronde} disabled size={1} style={{textAlign:'center'}}/>
                            </td>
                            <td>
                                <input type="text"
                                       defaultValue={DateTime.fromMillis(i.TIMESTAMP_START).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                                       disabled size={8} style={{textAlign:'center'}}/>

                            </td>
                            <td>
                                <input type="text" defaultValue={editClipData.artiest}/>
                            </td>
                            <td>
                                <input type="text" defaultValue={editClipData.titel}/>
                            </td>
                            <td>
                                <input type="text" defaultValue={editClipData.jaar} onChange={(e) => {
                                    changeRondeData('jaar', e.target.value)
                                }}/>
                            </td>
                        </tr>
                        <tr className='admin_rondetabel_edit'>
                            {[1,2,3,4,5,6].map(n=><td key={`row2_cell${n}`}/>)}
                            <td>
                                <input type="text" defaultValue={editClipData.x_artiest}/>
                            </td>
                            <td>
                                <input type="text" defaultValue={editClipData.x_titel}/>
                            </td>
                            <td/>
                        </tr>
                        <tr className='admin_rondetabel_edit'>
                            {[1,2,3,4].map(n=><td key={`row3_cell${n}`}/>)}
                            <td colSpan={5}>
                                <select>
                                    <option/>
                                    {unusedClips && unusedClips.length > 0 && unusedClips.map(i =>
                                        <option key={i.id}>{i.artiest} - {i.titel} ({i.jaar})</option>
                                    )}
                                </select>
                            </td>
                        </tr>
                    </Fragment>
                    :
                    <tr key={i.ronde}
                        className={i.ronde === huidigeRondeNummer ? 'admin_rondetabel_huidigeronde' : undefined}>
                        <td>
                            <button disabled={i.ronde <= huidigeRondeNummer}>
                                <i className="fa-solid fa-chevron-up"/>
                            </button>
                        </td>
                        <td>
                            <button disabled={i.ronde < huidigeRondeNummer || n === rondes.length - 1}>
                                <i className="fa-solid fa-chevron-down"/>
                            </button>
                        </td>
                        <td>
                            <button disabled={i.ronde <= huidigeRondeNummer} onClick={() => setEditRonde(i.ronde)}>
                                <i className="fa-solid fa-pen"/>
                            </button>
                        </td>
                        <td>
                            <button onClick={()=>playClip(i.clip)}>
                                <i className="fa-solid fa-film"/>
                            </button>
                        </td>
                        <td>
                            {i.ronde}
                        </td>
                        <td>
                            {DateTime.fromMillis(i.TIMESTAMP_START).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                        </td>
                        <td>
                            {i.clipdata.artiest}
                        </td>
                        <td>
                            {i.clipdata.titel}
                        </td>
                        <td>
                            {i.clipdata.jaar}
                        </td>
                    </tr>
            )
            }
            </tbody>
        </table>
        : <Loading/>
}

export default Rondes