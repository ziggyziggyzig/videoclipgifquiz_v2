import {Fragment, useContext, useEffect, useState} from "react"

import './Statistieken.css'
import {UsersContext} from "../../Contexts/Users"
import {Rondelink, Spelerlink} from "../Links/Links"
import Loading from "../Loading/Loading"
import {padLeadingZeros} from "../../functions/strings"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {collection, doc, getDoc, getDocs, limit, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {Duration} from "luxon"

const Statistieken = ({setLoadAll}) => {
    const [{usersData}] = useContext(UsersContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    const [alleRondes, setAlleRondes] = useState([])
    const [alleClips, setAlleClips] = useState([])

    const [spelersEerste, setSpelersEerste] = useState([])
    const [spelersMeesteAntwoorden, setSpelersMeesteAntwoorden] = useState([])
    const [spelersMeesteWinsten, setSpelersMeesteWinsten] = useState([])

    const [rondesMeesteAntwoorden, setRondesMeesteAntwoorden] = useState([])
    const [rondesMinsteAntwoorden, setRondesMinsteAntwoorden] = useState([])
    const [rondesLangzaamsteWinsten, setRondesLangzaamsteWinsten] = useState([])

    const [inzendingenSnelste, setInzendingenSnelste] = useState([])
    const [valreep, setValreep] = useState([])
    const [langsteSeries, setLangsteSeries] = useState([])
    const [mediums, setMediums] = useState([])
    const [bronnen, setBronnen] = useState([])

    const [globals, setGlobals] = useState(null)

    useEffect(() => {
        setLoadAll()
    }, [setLoadAll])

    useEffect(() => {
        const loadGlobals = async () => {
            let g = await getDoc(doc(db, 'GLOBAL', 'STATS'))
            setGlobals(g.data())
        }
        loadGlobals()
    }, [])

    useEffect(() => {
        const parseSpelers = async () => {
            let spelersDataToState = []
            let seriesToState = []
            for (let u of usersData) {
                if (u.DISPLAYNAME && u.CORRECT_FIRST && u.CORRECT_FIRST.ronde && u.CORRECT_FIRST.timestamp) {
                    spelersDataToState.push({
                        USER_ID:u.USER_ID,
                        DISPLAYNAME:u.DISPLAYNAME,
                        ronde:u.CORRECT_FIRST.ronde,
                        timestamp:parseInt(u.CORRECT_FIRST.timestamp, 10) || 0,
                        CORRECT_COUNT:u.CORRECT_COUNT || 0,
                        WIN_COUNT:u.WIN_COUNT || 0
                    })
                }
                if (u.SERIES_LIST && u.SERIES_LIST.length > 0) {
                    for (let s of u.SERIES_LIST) {
                        seriesToState.push({USER_ID:u.USER_ID, ...s})
                    }
                }
            }
            setSpelersEerste([...spelersDataToState].sort((a, b) => a.timestamp - b.timestamp).slice(0, 10))
            setSpelersMeesteAntwoorden([...spelersDataToState].sort((a, b) => b.CORRECT_COUNT - a.CORRECT_COUNT).slice(0, 20))
            setSpelersMeesteWinsten([...spelersDataToState].sort((a, b) => b.WIN_COUNT - a.WIN_COUNT).slice(0, 20))

            seriesToState.sort((a, b) => a.LENGTH === b.LENGTH ? a.SERIES[0].ronde - b.SERIES[0].ronde : b.LENGTH - a.LENGTH)
            setLangsteSeries(seriesToState.slice(0, 20))
        }
        if (usersData && usersData.length > 0) parseSpelers()
    }, [usersData])

    useEffect(() => {
        const loadAllClips = async () => {
            let clipsToState = []
            let cs = await getDocs(
                query(
                    collection(db, 'clips'),
                    where('status', '==', 2)
                )
            )
            for (let d of cs.docs) {
                clipsToState.push({ID:d.id, ...d.data()})
            }
            setAlleClips(clipsToState)

            let rondesToState = []
            let rs = await getDocs(
                query(
                    collection(db, 'rondes'),
                    where('ronde', '<', huidigeRondeNummer)
                )
            )
            for (let d of rs.docs) {
                let clipIndex = d.data().clip ? clipsToState.findIndex(o => o.id === d.data().clip) : null
                if (clipIndex) {
                    rondesToState.push({
                        artiest:clipsToState[clipIndex].artiest,
                        titel:clipsToState[clipIndex].titel,
                        jaar:clipsToState[clipIndex].jaar,
                        ...d.data()
                    })
                }
            }
            setAlleRondes(rondesToState)
        }
        huidigeRondeNummer && loadAllClips()
    }, [huidigeRondeNummer])

    useEffect(() => {
        const parseRondes = () => {
            setRondesMeesteAntwoorden([...alleRondes].sort((a, b) => b.CORRECT_COUNT - a.CORRECT_COUNT).slice(0, 20))
            setRondesMinsteAntwoorden([...alleRondes].sort((a, b) => a.CORRECT_COUNT - b.CORRECT_COUNT).slice(0, 20))
            setRondesLangzaamsteWinsten([...alleRondes].sort((a, b) => b.SPEED_FIRST - a.SPEED_FIRST).slice(0, 10))

            let valreepToState = []
            let mediumToState = []
            let bronToState = []

            for (let r of alleRondes) {
                let v = r.TIMESTAMP_END - r.CORRECT_LAST.timestamp
                if (!(v === 1 && r.ronde === 122) && !(v === 1 && r.ronde === 127)) valreepToState.push({valreep:v, ...r.CORRECT_LAST})

                Object.entries(r.BRON_COUNT).map(i => {
                    let [b, c] = i
                    let bi = bronToState.findIndex(o => o.bron === b)
                    if (bi > -1) {
                        bronToState[bi].count += c
                    } else {
                        bronToState.push({bron:b, count:c})
                    }
                    return true
                })

                Object.entries(r.MEDIUM_COUNT).map(i => {
                    let [m, c] = i
                    let mi = mediumToState.findIndex(o => o.medium === m)
                    if (mi > -1) {
                        mediumToState[mi].count += c
                    } else {
                        mediumToState.push({medium:m, count:c})
                    }
                    return true
                })
            }

            valreepToState.sort((a, b) => a.valreep - b.valreep)
            setValreep(valreepToState.slice(0, 10))

            setBronnen(bronToState.sort((a, b) => b.count - a.count))
            setMediums(mediumToState.sort((a, b) => b.count - a.count))
        }

        alleRondes && alleRondes.length > 0 && parseRondes()
    }, [alleRondes])

    useEffect(() => {
        const inzendingen_snelste = async () => {
            let s = await getDocs(
                query(
                    collection(db, 'inzendingen'),
                    where('beoordeling', '==', 3),
                    orderBy('SPEED', 'asc'),
                    limit(10)
                )
            )
            let toState = []
            for (let d of s.docs) {
                toState.push(d.data())
            }
            toState.sort((a, b) => a.SPEED - b.SPEED)
            setInzendingenSnelste(toState.slice(0, 10))
        }
        inzendingen_snelste()
    }, [])

    return <div className="statistieken">
        <h2 className="font_sans_normal">Statistieken</h2>
        <div className="stats_gridcontainer">
            <Breed>
                <h3>Algemeen</h3>
            </Breed>
            <Links>
                aantal gespeelde rondes
            </Links>
            <Rechts>
                {huidigeRondeNummer}
            </Rechts>
            <Links>
                aantal gemaakte clipfragmenten:
            </Links>
            <Rechts>
                {huidigeRondeNummer && globals && globals.CLIP_PLANNED && globals.CLIP_UNPLANNED && <>
                    {huidigeRondeNummer + (Math.floor(huidigeRondeNummer / 100) * 4) + globals.CLIP_UNPLANNED + globals.CLIP_PLANNED}<br/>
                    <i>waarvan nog niet gebruikt</i>: {globals.CLIP_UNPLANNED + globals.CLIP_PLANNED}<br/>
                    <i>waarvan ingepland</i>:{globals.CLIP_PLANNED}
                </>
                }
            </Rechts>
            <Breed>
                <h3>Spelers</h3>
            </Breed>
            <Links>
                aantal spelers
            </Links>
            <Rechts>
                {usersData && usersData.length > 0 && usersData.length}
            </Rechts>
            <Links>
                aantal verschillende rondewinnaars
            </Links>
            <Rechts>
                {globals && globals.WINNERS_COUNT && <>
                    {globals.WINNERS_COUNT} ({Math.round(globals.WINNERS_COUNT / usersData.length * 100)}%)
                </>}
            </Rechts>
            <Links>
                eerste spelers
            </Links>
            <Rechts>
                {spelersEerste && spelersEerste.length > 0 ?
                    spelersEerste.map((s, i) =>
                        i < 10 && <Fragment key={s.USER_ID}>
                            {new Date(s.timestamp).toLocaleString('nl-NL', {
                                weekday:'short',
                                month:'short',
                                year:'numeric',
                                day:'numeric',
                                hour:'numeric',
                                minute:'numeric'
                            })} &mdash;{' '}
                            <Spelerlink user_id={s.USER_ID} prijzen={false} naam={s.DISPLAYNAME}/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                spelers met de meeste antwoorden
            </Links>
            <Rechts>
                {spelersMeesteAntwoorden && spelersMeesteAntwoorden.length > 0 ?
                    spelersMeesteAntwoorden.map((s, i) =>
                        i < 10 && <Fragment key={s.USER_ID}>
                            {padLeadingZeros(s.CORRECT_COUNT, 4)}x &mdash; <Spelerlink user_id={s.USER_ID} prijzen={false}
                                                                                       naam={s.DISPLAYNAME}/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                spelers met de meeste winsten
            </Links>
            <Rechts>
                {spelersMeesteWinsten && spelersMeesteWinsten.length > 0 ?
                    spelersMeesteWinsten.map((s, i) =>
                        i < 10 && <Fragment key={s.USER_ID}>
                            {padLeadingZeros(s.WIN_COUNT, 4)}x &mdash; <Spelerlink user_id={s.USER_ID} prijzen={false}
                                                                                   naam={s.DISPLAYNAME}/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed id="spelers">
                <h3>Rondes</h3>
            </Breed>
            <Links>
                rondes met de meeste antwoorden
            </Links>
            <Rechts>
                {rondesMeesteAntwoorden && rondesMeesteAntwoorden.length > 0 ?
                    rondesMeesteAntwoorden.map((s, i) =>
                        (i < 10 || s.CORRECT_COUNT === rondesMeesteAntwoorden[9].CORRECT_COUNT) &&
                        <Fragment key={s.ronde}>
                            {padLeadingZeros(s.CORRECT_COUNT, 4)}x &mdash; <Rondelink ronde={s.ronde} inhoud={true}
                                                                                      text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                rondes met de minste antwoorden
            </Links>
            <Rechts>
                {rondesMinsteAntwoorden && rondesMinsteAntwoorden.length > 0 ?
                    rondesMinsteAntwoorden.map((s, i) =>
                        (i < 10 || s.CORRECT_COUNT === rondesMinsteAntwoorden[9].CORRECT_COUNT) &&
                        <Fragment key={s.ronde}>
                            {padLeadingZeros(s.CORRECT_COUNT, 4)}x &mdash; <Rondelink ronde={s.ronde} inhoud={true}
                                                                                      text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                rondes met de langzaamste overwinningen
            </Links>
            <Rechts>
                {rondesLangzaamsteWinsten && rondesLangzaamsteWinsten.length > 0 ?
                    rondesLangzaamsteWinsten.map((s, i) =>
                        i < 10 &&
                        <Fragment key={s.ronde}>
                            {Duration.fromMillis(s.SPEED_FIRST).toFormat(`h'u' mm'm' ss'.'SSS's'`)}{' '}
                            &mdash; <Rondelink ronde={s.ronde} inhoud={true}
                                               text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed id="spelers">
                <h3>Antwoorden</h3>
            </Breed>
            <Links>
                totaal aantal correcte antwoorden
            </Links>
            <Rechts>
                {globals && globals.CORRECT_COUNT && globals.CORRECT_AVG_RONDE && globals.CORRECT_AVG_SPELER && <>
                    {globals.CORRECT_COUNT}<br/>
                    <i>(gemiddeld {globals.CORRECT_AVG_SPELER} per speler, <br/>
                        gemiddeld {globals.CORRECT_AVG_RONDE} per ronde)</i>
                </>}
            </Rechts>
            <Links>
                snelste antwoorden
            </Links>
            <Rechts>
                {inzendingenSnelste && inzendingenSnelste.length > 0 ?
                    inzendingenSnelste.map((s) =>
                        <Fragment key={s.timestamp}>
                            {Duration.fromMillis(s.SPEED).toFormat(`s'.'SSS's'`)} &mdash;{' '}
                            <Spelerlink user_id={s.USER_ID} prijzen={false}/> &mdash;{' '}
                            <Rondelink ronde={s.ronde} inhoud={true} text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                laatste antwoorden voor sluiten van een ronde
            </Links>
            <Rechts>
                {valreep && valreep.length > 0 ?
                    valreep.map((s, i) =>
                        i < 10 && <Fragment key={s.timestamp}>
                            {Duration.fromMillis(s.valreep).toFormat(`s'.'SSS's'`)} &mdash;{' '}
                            <Spelerlink user_id={s.USER_ID} prijzen={false}/> &mdash;{' '}
                            <Rondelink ronde={s.ronde} inhoud={true} text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                langste series opeenvolgende antwoorden
            </Links>
            <Rechts>
                {langsteSeries && langsteSeries.length > 0 ?
                    <>
                        {langsteSeries.map((s, i) =>
                            (i < 10 || s.LENGTH === langsteSeries[9].LENGTH) &&
                            <Fragment key={`${s.SERIES[0].ronde}${s.USER_ID}`}>
                                {padLeadingZeros(s.LENGTH, 4)}x &mdash;{' '}
                                <Spelerlink user_id={s.USER_ID} prijzen={false}/> &mdash;{' '}
                                <Rondelink ronde={s.SERIES[0].ronde} text="rondes"/> t/m {' '}
                                <Rondelink ronde={s.SERIES[s.SERIES.length - 1].ronde}/>{' '}
                                {s.SERIES[s.SERIES.length - 1].ronde >= huidigeRondeNummer - 1 && <>*</>}
                                <br/>
                            </Fragment>)
                        }
                        &nbsp;<i>* lopende serie</i>
                    </>
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                gebruikte antwoordmethodes
            </Links>
            <Rechts>
                {bronnen && bronnen.length > 0 ?
                    bronnen.map((s) =>
                        <Fragment key={s.bron}>
                            {padLeadingZeros(s.count, 6)}x{' '}
                            ({globals && globals.CORRECT_COUNT && padLeadingZeros(Math.round(s.count / globals.CORRECT_COUNT * 1000) / 10, 4)}%):{' '}
                            {s.bron.replace('_', ' ')}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                gebruikte kanalen
            </Links>
            <Rechts>
                {mediums && mediums.length > 0 ?
                    mediums.map((s) =>
                        <Fragment key={s.medium}>
                            {padLeadingZeros(s.count, 6)}x{' '}
                            ({globals && globals.CORRECT_COUNT && padLeadingZeros(Math.round(s.count / globals.CORRECT_COUNT * 1000) / 10, 4)}%):{' '}
                            {s.medium.replace('_', ' ')}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            {/*<Breed>*/}
            {/*    <h3>Artiesten</h3>*/}
            {/*</Breed>*/}
            {/*<Links>*/}
            {/*    vaakst gevraagde artiesten*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Links>*/}
            {/*    artiesten met de meeste juiste antwoorden*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Breed>*/}
            {/*    <h3>Jaartallen</h3>*/}
            {/*</Breed>*/}
            {/*<Links>*/}
            {/*    vaakst gevraagde jaartallen*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Links>*/}
            {/*    jaartallen met de meeste juiste antwoorden*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Links>*/}
            {/*    oudste gevraagde nummers*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Breed>*/}
            {/*    <h3>Decennia</h3>*/}
            {/*</Breed>*/}
            {/*<Links>*/}
            {/*    vaakst gevraagde decennia*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            {/*<Links>*/}
            {/*    decennia met de meeste juiste antwoorden*/}
            {/*</Links>*/}
            {/*<Rechts>*/}

            {/*</Rechts>*/}
            <Lijn/>
            <Breed>
                <i>(binnenkort nog meer statistieken)</i>
            </Breed>
        </div>
    </div>
}

const Links = ({list, children}) => <div
    className={`stats_griditem_links font_sans_bold ${list || undefined}`}>{children}</div>
const Rechts = ({list, children}) => <div
    className={`stats_griditem_rechts font_mono_normal ${list || undefined}`}>{children}</div>

const Lijn = ({list}) => <div className={`stats_griditem_divider ${list || undefined}`}/>

export const Breed = ({id, className, style, children}) => <>
    <div
        id={id}
        style={style}
        className={`stats_griditem_breed font_sans_normal ${className}`}>
        {children}
    </div>
</>

export default Statistieken