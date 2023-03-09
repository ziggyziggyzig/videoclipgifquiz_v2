import {Fragment, useContext, useEffect, useState} from "react"
import {collection, getDocs, onSnapshot, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {DateTime} from "luxon"
import Loading from "../Loading/Loading"

const Rondes = ({playClip}) => {
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    const [editRonde, setEditRonde] = useState(null)
    const [editRondeData, setEditRondeData] = useState(null)
    const [editClipData, setEditClipData] = useState(null)

    const [rondes, setRondes] = useState([])
    const [clips, setClips] = useState([])
    const [unusedClips, setUnusedclips] = useState([])

    const changeRondeData = (field, value) => {
        console.log(field, value)
        let toState = {...editRondeData}
        toState[field] = value
        setEditRondeData(toState)
    }

    const changeClipData = (field, value, test_string = null) => {
        let toState = {...editClipData}
        toState[field] = value
        if (field === 'x_artiest') {
            toState.REGEX_ARTIST_CORRECT = test_regex(value, test_string) ? 1 : 0
        }
        if (field === 'x_titel') {
            toState.REGEX_TITLE_CORRECT = test_regex(value, test_string) ? 1 : 0
        }
        setEditClipData(toState)
    }

    const saveClipData = () => {

    }

    const test_regex = (pattern, string) => new RegExp(pattern, "ig").test(string)

    useEffect(() => {
        let unsubscribe = onSnapshot(query(collection(db, 'rondes'), orderBy('ronde', 'asc'), where('ronde', '>', huidigeRondeNummer - 2)), async (snapshot) => {
            let alleClips = []
            let clip_snapshot = await getDocs(collection(db, 'clips'))
            for (let c of clip_snapshot.docs) {
                alleClips.push(c.data())
            }
            setClips(alleClips)
            let toState = []
            for (let d of snapshot.docs) {
                toState.push(d.data())
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
                let r = rondes.find(o => o.ronde === editRonde)
                setEditRondeData(r)
                setEditClipData(clips.find(o => o.id === r.clip))
                let toUnusedClipsState = []
                for (let c of clips) {
                    if (c.status === 0 && !c.ronde) toUnusedClipsState.push(c)
                }
                toUnusedClipsState.sort((a, b) => a.jaar === b.jaar ? a.artiest.localeCompare(b.artiest) : a.jaar - b.jaar)
                setUnusedclips(toUnusedClipsState)
            } else {
                setEditRondeData(null)
                setEditClipData(null)
                setUnusedclips([])
            }
        }
        loadData()
    }, [editRonde, rondes])

    return rondes && rondes.length > 1 ? <table className="font_sans_normal admin_tabel admin_rondetabel">
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
                        <tr className="admin_rondetabel_edit">
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
                        <tr className="admin_rondetabel_edit">
                            {[1, 2, 3, 4, 5, 6].map(n => <td key={`row2_cell${n}`}/>)}
                            <td style={{border:editClipData.REGEX_ARTIST_CORRECT ? undefined : 'red 2px dashed'}}>
                                <input type="text" defaultValue={editClipData.x_artiest} onChange={(e) => {
                                    changeClipData('x_artiest', e.target.value, editClipData.artiest)
                                }}/>
                            </td>
                            <td style={{border:editClipData.REGEX_TITLE_CORRECT ? undefined : 'red 2px dashed'}}>
                                <input type="text" defaultValue={editClipData.x_titel} onChange={(e) => {
                                    changeClipData('x_titel', e.target.value, editClipData.x_titel)
                                }}/>
                            </td>
                            <td/>
                        </tr>
                        {editRonde > huidigeRondeNummer &&
                            <tr className="admin_rondetabel_edit">
                                {[1, 2, 3, 4].map(n => <td key={`row3_cell${n}`}/>)}
                                <td colSpan={5}>
                                    <select onChange={(e) => changeRondeData('clip', e.target.value)}>
                                        <option/>
                                        {unusedClips && unusedClips.length > 0 && unusedClips.map(i =>
                                            <option value={i.id} key={i.id}>{i.artiest} - {i.titel} ({i.jaar})</option>
                                        )}
                                    </select>
                                </td>
                            </tr>
                        }
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
                            <button disabled={i.ronde < huidigeRondeNummer} onClick={() => setEditRonde(i.ronde)}>
                                <i className="fa-solid fa-pen"/>
                            </button>
                        </td>
                        <td>
                            <button onClick={() => playClip(i.clip)}>
                                <i className="fa-solid fa-film"/>
                            </button>
                        </td>
                        <td>
                            {i.ronde}
                        </td>
                        <td>
                            {DateTime.fromMillis(i.TIMESTAMP_START).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                        </td>
                        <td style={{border:clips.find(o => o.id === i.clip).REGEX_ARTIST_CORRECT ? undefined : 'red 2px dashed'}}>
                            {clips.find(o => o.id === i.clip).artiest}
                        </td>
                        <td style={{border:clips.find(o => o.id === i.clip).REGEX_TITLE_CORRECT ? undefined : 'red 2px dashed'}}>
                            {clips.find(o => o.id === i.clip).titel}
                        </td>
                        <td>
                            {clips.find(o => o.id === i.clip).jaar}
                        </td>
                    </tr>
            )
            }
            </tbody>
        </table>
        : <Loading/>
}

export default Rondes