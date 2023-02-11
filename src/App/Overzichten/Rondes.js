import {Fragment, useContext, useEffect, useState} from "react"
import {Rondelink, Spelerlink} from "../Links/Links"
import {DateTime} from "luxon"
import {CurrentUserContext} from "../../Contexts/CurrentUser"
import {collection, getDocs, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {Breed} from "./GridItems"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import Loading from "../Loading/Loading"

const Rondes = ({usersData}) => {
    const [alleRondes, setAlleRondes] = useState([])
    const [alleClips, setAlleClips] = useState([])
    const [alleRondesSortedAndFiltered, setAlleRondesSortedAndFiltered] = useState([])
    const [sorteerveld, setSorteerveld] = useState('RONDE')
    const [sorteervolgorde, setSorteervolgorde] = useState(true)
    const [{huidigeRondeNummer}]=useContext(HuidigeRondeContext)

    // const [filterveld, setFilterveld] = useState('ANTWOORD')
    // const [filterwaarde, setFilterwaarde] = useState('rad')

    const [{currentUserData}] = useContext(CurrentUserContext)

    useEffect(() => {
        let s = JSON.parse(JSON.stringify(alleRondes))
        s.sort((a, b) => {
            const varA = (typeof a[sorteerveld] === 'string')
                ? a[sorteerveld].toUpperCase().replace('"', '') : a[sorteerveld]
            const varB = (typeof b[sorteerveld] === 'string')
                ? b[sorteerveld].toUpperCase().replace('"', '') : b[sorteerveld]

            let comparison = 0
            if (varA > varB) {
                comparison = 1
            } else if (varA < varB) {
                comparison = -1
            }
            return (
                (sorteervolgorde) ? (comparison * -1) : comparison
            )
        })
        setAlleRondesSortedAndFiltered(s)
    }, [sorteerveld, sorteervolgorde, alleRondes])

    // useEffect(() => {
    //     if (filterveld && filterwaarde) {
    //         let f = JSON.parse(JSON.stringify(alleRondes))
    //         f.filter(o => o[filterveld].toLowerCase().search(filterwaarde.toLowerCase())>-1)
    //         console.log(f.length)
    //         setAlleRondesSortedAndFiltered(f)
    //     }
    // }, [filterveld, filterwaarde, alleRondes])

    useEffect(() => {
        const loadData = async () => {
            let r = []
            let sr = await getDocs(query(collection(db, 'rondes'), where('ronde', '<=', huidigeRondeNummer), orderBy('ronde', 'asc')))
            for (let rd of sr.docs) {
                let data = rd.data()
                let clip = await alleClips.find(o => o.id === data.clip)
                let winnaar = usersData.find(o => o.USER_ID === data.CORRECT_FIRST.USER_ID) ||
                    usersData.find(o => o.TWITTER_HANDLE === data.CORRECT_FIRST.gebruiker)
                let ronde_data = {
                    RONDE:data.ronde,
                    CORRECT_COUNT:data.CORRECT_COUNT,
                    CORRECT_FIRST_DISPLAYNAME:winnaar.DISPLAYNAME || `@${winnaar.TWITTER_HANDLE}`,
                    CORRECT_FIRST_USER_ID:winnaar.USER_ID,
                    EPISODE:data.EPISODE,
                    SEASON:data.SEASON,
                    MEDIUM_COUNT:data.MEDIUM_COUNT,
                    TIMESTAMP_START:data.TIMESTAMP_START,
                    CLIP:data.clip,
                    ANTWOORD:data.ronde < huidigeRondeNummer ? data.bonus ? clip.TITEL : clip.ANTWOORD : '',
                    JAAR:clip && clip.JAAR ? clip.JAAR : null,
                    BONUS:data.bonus,
                    TAART:data.EPISODE === 1 && data.SEASON > 1
                }
                r.push(ronde_data)
            }
            setAlleRondes(r)
            setAlleRondesSortedAndFiltered(r)
        }

        if ((!alleRondes || alleRondes.length < 1) && (alleClips.length > 0)) loadData()
    }, [alleRondes, alleClips, currentUserData, usersData, huidigeRondeNummer])

    useEffect(() => {
        const loadData = async () => {
            let c = []
            let sc = await getDocs(query(collection(db, 'clips'), where('status', '==', 2)))
            for (let cd of sc.docs) {
                let data = cd.data()
                c.push({
                    id:data.id,
                    JAAR:data.jaar,
                    YOUTUBE:data.youtube,
                    ANTWOORD:`${data.artiest} - ${data.titel}`,
                    TITEL:data.titel
                })
            }
            setAlleClips(c)
        }

        if (!alleClips || alleClips.length < 1) loadData()
    }, [alleClips])

    const setSorting = (veld) => {
        if (sorteerveld === veld) {
            setSorteervolgorde(!sorteervolgorde)
        } else {
            setSorteerveld(veld)
        }
    }

    return alleRondesSortedAndFiltered && alleRondesSortedAndFiltered.length > 0 ? <>
            <Breed>
                {/*<select className="overzichten_select">*/}
                {/*    <option selected={true}>--- filter op ---</option>*/}
                {/*    <option>antwoord</option>*/}
                {/*    <option>winnaar</option>*/}
                {/*</select>*/}
                {/*<input type="text" value="filter" className="overzichten_tekstveld"/>*/}

                <div className="subgrid_container_6">

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('RONDE')
                         }}>
                        ronde {sorteerveld === 'RONDE' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}
                    </div>

                    <div className="subgrid_griditem_heading"/>

                    <div style={{textAlign:'right'}}
                         className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('TIMESTAMP_START')
                         }}>
                        datum {sorteerveld === 'TIMESTAMP_START' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}
                    </div>

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('ANTWOORD')
                         }}>
                        antwoord {sorteerveld === 'ANTWOORD' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-z-a"/> :
                        <i className="fa-solid fa-arrow-down-a-z"/>}</>}
                    </div>

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('CORRECT_COUNT')
                         }}>
                        inzendingen {sorteerveld === 'CORRECT_COUNT' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}
                    </div>

                    <div className="subgrid_griditem_heading subgrid_griditem_optional font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('CORRECT_FIRST_DISPLAYNAME')
                         }}>
                        winnaar {sorteerveld === 'CORRECT_FIRST_DISPLAYNAME' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-z-a"/> :
                        <i className="fa-solid fa-arrow-down-a-z"/>}</>}
                    </div>

                    {alleRondesSortedAndFiltered.map((r, i) =>
                        <Fragment key={i}>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                <Rondelink ronde={r.RONDE}/>
                            </div>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'}`}>
                                {r.EPISODE === 1 && r.SEASON > 1 && <i
                                    className="fa-solid fa-cake-candles geel"
                                    title="Verjaardagsronde"/>}
                                {r.BONUS && <i className="far fa-star geel" style={{marginRight:'0em'}}
                                               title="Bonusronde"/>}
                            </div>

                            <div style={{textAlign:'right'}}
                                 className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {DateTime.fromMillis(r.TIMESTAMP_START).toLocaleString(DateTime.DATE_SHORT)}
                            </div>

                            <div
                                className={`subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {r.ANTWOORD !== '' ? r.ANTWOORD : <i>huidige ronde</i>}
                            </div>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {r.CORRECT_COUNT}
                            </div>

                            <div
                                className={`oranje subgrid_griditem subgrid_griditem_optional ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                <Spelerlink user_id={r.CORRECT_FIRST_USER_ID} naam={r.CORRECT_FIRST_DISPLAYNAME}
                                            prijzen={false}
                                            eigenLink={currentUserData && currentUserData.USER_ID && r.CORRECT_FIRST_USER_ID === currentUserData.USER_ID}/>
                            </div>

                        </Fragment>
                    )}
                </div>
            </Breed>
        </>
        :
        <Loading/>

}

export default Rondes