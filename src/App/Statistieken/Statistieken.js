import {Fragment, useContext, useEffect, useState} from "react"

import './Statistieken.css'
import {UsersContext} from "../../Contexts/Users"
import {Rondelink, Spelerlink} from "../Links/Links"
import Loading from "../Loading/Loading"
import {padLeadingZeros} from "../../functions/strings"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {collection, doc, getDoc, getDocs, limit, orderBy, query, where} from "firebase/firestore"
import {db, siteActions} from "../../Firebase/Firebase"
import {Duration} from "luxon"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const Statistieken = ({setLoadAll}) => {
    const [{usersData}] = useContext(UsersContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)
    const [{currentUserData}] = useContext(CurrentUserContext)

    const [globals, setGlobals] = useState(null)

    const [alleRondes, setAlleRondes] = useState([])

    const [spelersEerste, setSpelersEerste] = useState([])
    const [spelersMeesteAntwoorden, setSpelersMeesteAntwoorden] = useState([])
    const [spelersMeesteWinsten, setSpelersMeesteWinsten] = useState([])

    const [rondesMeesteAntwoorden, setRondesMeesteAntwoorden] = useState([])
    const [rondesMinsteAntwoorden, setRondesMinsteAntwoorden] = useState([])
    const [rondesLangzaamsteWinsten, setRondesLangzaamsteWinsten] = useState([])

    const [inzendingenSnelste, setInzendingenSnelste] = useState([])
    const [valreep, setValreep] = useState([])
    const [langsteSeries, setLangsteSeries] = useState([])
    const [bronnen, setBronnen] = useState([])
    const [mediums, setMediums] = useState([])

    const [artiestenMeesteRondes, setArtiestenMeesteRondes] = useState([])
    const [artiestenMeesteAntwoorden, setArtiestenMeesteAntwoorden] = useState([])
    const [jarenMeesteRondes, setJarenMeesteRondes] = useState([])
    const [jarenMeesteAntwoorden, setJarenMeesteAntwoorden] = useState([])
    const [jarenOudste, setJarenOudste] = useState([])
    const [decenniaMeesteRondes, setDecenniaMeesteRondes] = useState([])
    const [decenniaMeesteAntwoorden, setDecenniaMeesteAntwoorden] = useState([])

    const [hannekevsrichard, setHannekevsrichard] = useState([])

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

            let rondesToState = []
            let rs = await getDocs(
                query(
                    collection(db, 'rondes'),
                    where('ronde', '<', huidigeRondeNummer)
                )
            )
            for (let d of rs.docs) {
                let clipIndex = d.data().clip ? clipsToState.findIndex(o => o.id === d.data().clip) : null
                if (clipsToState[clipIndex].jaar !== 0 && clipIndex) {
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

                if (r.BRON_COUNT) {
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
                }

                if (r.MEDIUM_COUNT) {
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
            }

            setBronnen(bronToState.sort((a, b) => b.count - a.count))
            setMediums(mediumToState.sort((a, b) => b.count - a.count))

            valreepToState.sort((a, b) => a.valreep - b.valreep)
            setValreep(valreepToState.slice(0, 10))

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

    useEffect(() => {
        const loadArtiestenEnJaren = async () => {
            let artiestenToState = []
            let as = await getDocs(
                collection(db, 'GLOBAL', 'STATS', 'ARTIESTEN')
            )
            for (let d of as.docs) {
                artiestenToState.push(d.data())
            }
            setArtiestenMeesteRondes([...artiestenToState].sort((a, b) => a.count === b.count ? b.corrects - a.corrects : b.count - a.count).slice(0, 20))
            setArtiestenMeesteAntwoorden([...artiestenToState].sort((a, b) => a.corrects === b.corrects ? b.count - a.count : b.corrects - a.corrects).slice(0, 20))

            let jarenToState = []
            let decenniaToState = []
            let aj = await getDocs(
                collection(db, 'GLOBAL', 'STATS', 'JAREN')
            )
            for (let d of aj.docs) {
                jarenToState.push(d.data())
                let decennium = Math.floor(d.data().jaar / 10) * 10
                let di = decenniaToState.findIndex(o => o.decennium === decennium)
                if (di > -1) {
                    decenniaToState.count += d.data().count
                    decenniaToState.corrects += d.data().corrects
                } else {
                    decenniaToState.push({decennium:decennium, corrects:d.data().corrects, count:d.data().count})
                }
            }
            setJarenMeesteRondes([...jarenToState].sort((a, b) => a.count === b.count ? b.corrects - a.corrects : b.count - a.count).slice(0, 20))
            setJarenMeesteAntwoorden([...jarenToState].sort((a, b) => a.corrects === b.corrects ? b.count - a.count : b.corrects - a.corrects).slice(0, 20))
            setJarenOudste([...alleRondes].sort((a, b) => a.jaar === b.jaar ? a.ronde - b.ronde : a.jaar - b.jaar).slice(0, 20))
            setDecenniaMeesteRondes([...decenniaToState].sort((a, b) => a.count === b.count ? b.corrects - a.corrects : b.count - a.count))
            setDecenniaMeesteAntwoorden([...decenniaToState].sort((a, b) => a.corrects === b.corrects ? b.count - a.count : b.corrects - a.corrects))
        }
        loadArtiestenEnJaren()
    }, [alleRondes])

    useEffect(() => {
        const getData = async () => {
            let {data} = await siteActions({
                context:'stats',
                action:'hanneke_vs_richard',
                content:{},
                user:currentUserData.USER_ID
            })
            let vs = []
            for (let d of data) {
                let i = vs.findIndex(o => o.USER_ID === d.USER_ID)
                if (i === -1) {
                    vs.push({USER_ID:d.USER_ID, count:1})
                } else {
                    vs[i].count++
                }
            }
            vs.sort((a, b) => b.count - a.count)
            setHannekevsrichard(vs)
        }

        if (currentUserData && currentUserData.USER_ID && (
            currentUserData.USER_ID === 'Qt1Ra4sGHrTHvgsJg9e7' ||
            currentUserData.USER_ID === 'w5fMGkOkwDFh3s45JtvA' ||
            currentUserData.USER_ID === 'X3aLMnQhXuxrl6Xhi1fX'
        )
        ) {
            getData()
        }
    }, [currentUserData])

    return <div className="statistieken">
        <h2 className="font_sans_normal">Statistieken</h2>
        <div className="stats_gridcontainer">
            {currentUserData && currentUserData.USER_ID && (
                currentUserData.USER_ID === 'Qt1Ra4sGHrTHvgsJg9e7' ||
                currentUserData.USER_ID === 'w5fMGkOkwDFh3s45JtvA' ||
                currentUserData.USER_ID === 'X3aLMnQhXuxrl6Xhi1fX'
            ) && <>
                <Links>onderling duel</Links>
                <Rechts>{
                    hannekevsrichard && hannekevsrichard.length > 0 ? hannekevsrichard.map(n =>
                            <Fragment key={`HvsR_${n.USER_ID}`}>
                                {n.USER_ID === 'X3aLMnQhXuxrl6Xhi1fX' ?
                                    <>{padLeadingZeros(n.count, 4)}x: Richard<br/></> :
                                    <>{padLeadingZeros(n.count, 4)}x: Hanneke<br/></>}
                            </Fragment>
                        )
                        : <Loading/>
                }
                </Rechts>
            </>
            }

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
                    {globals.WINNERS_COUNT} ({Math.round(globals.WINNERS_COUNT / usersData.length * 100)}% van alle
                    spelers)
                </>}
            </Rechts>
            <Links>
                eerste spelers
            </Links>
            <Rechts>
                {spelersEerste && spelersEerste.length > 0 ?
                    spelersEerste.map((s, i) =>
                        i < 10 && <Fragment key={`spelersEerste_${s.USER_ID}`}>
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
                        i < 10 && <Fragment key={`spelersMeesteAntwoorden_${s.USER_ID}`}>
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
                        i < 10 && <Fragment key={`spelersMeesteWinsten_${s.USER_ID}`}>
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
                        <Fragment key={`rondesMeesteAntwoorden_${s.ronde}`}>
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
                        <Fragment key={`rondesMinsteAntwoorden_${s.ronde}`}>
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
                        <Fragment key={`rondesLangzaamsteWinsten_${s.ronde}`}>
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
                        <Fragment key={`inzendingenSnelste_${s.timestamp}`}>
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
                        i < 10 && <Fragment key={`valreep_${s.timestamp}`}>
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
                            <Fragment key={`langsteSeries_${s.SERIES[0].ronde}${s.USER_ID}`}>
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
                {bronnen && bronnen.length > 0 && globals.CORRECT_COUNT ?
                    bronnen.map((s) =>
                        <Fragment key={`bronnen_${s.bron}`}>
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
                {mediums && mediums.length > 0 && globals.CORRECT_COUNT ?
                    mediums.map((s) =>
                        <Fragment key={`mediums_${s.medium}`}>
                            {padLeadingZeros(s.count, 6)}x{' '}
                            ({globals && globals.CORRECT_COUNT && padLeadingZeros(Math.round(s.count / globals.CORRECT_COUNT * 1000) / 10, 4)}%):{' '}
                            {s.medium.replace('_', ' ')}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed>
                <h3>Artiesten</h3>
            </Breed>
            <Links>
                vaakst gevraagde artiesten
            </Links>
            <Rechts>
                {artiestenMeesteRondes && artiestenMeesteRondes.length > 0 ?
                    artiestenMeesteRondes.map((s, i) =>
                        (i < 10 || s.count === artiestenMeesteRondes[9].count) &&
                        <Fragment key={`artiestenMeesteRondes_${s.artiest}`}>
                            {padLeadingZeros(s.count, 4)}x &mdash; {s.artiest}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                artiesten met de meeste juiste antwoorden
            </Links>
            <Rechts>
                {artiestenMeesteAntwoorden && artiestenMeesteAntwoorden.length > 0 ?
                    artiestenMeesteAntwoorden.map((s, i) =>
                        (i < 10 || s.corrects === artiestenMeesteAntwoorden[9].corrects) &&
                        <Fragment key={`artiestenMeesteAntwoorden_${s.artiest}`}>
                            {padLeadingZeros(s.corrects, 4)}x &mdash; {s.artiest}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed>
                <h3>Jaartallen</h3>
            </Breed>
            <Links>
                vaakst gevraagde jaartallen
            </Links>
            <Rechts>
                {jarenMeesteRondes && jarenMeesteRondes.length > 0 ?
                    jarenMeesteRondes.map((s, i) =>
                        (i < 10 || s.count === jarenMeesteRondes[9].count) &&
                        <Fragment key={`jarenMeesteRondes_${s.jaar}`}>
                            {padLeadingZeros(s.count, 4)}x &mdash; {s.jaar}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                jaartallen met de meeste juiste antwoorden
            </Links>
            <Rechts>
                {jarenMeesteAntwoorden && jarenMeesteAntwoorden.length > 0 ?
                    jarenMeesteAntwoorden.map((s, i) =>
                        (i < 10 || s.corrects === jarenMeesteAntwoorden[9].corrects) &&
                        <Fragment key={`jarenMeesteAntwoorden_${s.jaar}`}>
                            {padLeadingZeros(s.corrects, 4)}x &mdash; {s.jaar}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                oudste gevraagde nummers
            </Links>
            <Rechts>
                {jarenOudste && jarenOudste.length > 0 ?
                    jarenOudste.map((s, i) =>
                        (i < 10 || s.jaar === jarenOudste[9].jaar) &&
                        <Fragment key={`jarenOudste_${s.jaar}_${i}`}>
                            {s.jaar}: <Rondelink ronde={s.ronde} inhoud={true} text="ronde"/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed>
                <h3>Decennia</h3>
            </Breed>
            <Links>
                vaakst gevraagde decennia
            </Links>
            <Rechts>
                {decenniaMeesteRondes && decenniaMeesteRondes.length > 0 ?
                    decenniaMeesteRondes.map((s, i) =>
                        <Fragment key={`decenniaMeesteRondes_${s.decennium}${s.decennium + 9}`}>
                            {padLeadingZeros(s.count, 4)}x &mdash; {s.decennium}-{s.decennium + 9}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                decennia met de meeste juiste antwoorden
            </Links>
            <Rechts>
                {decenniaMeesteAntwoorden && decenniaMeesteAntwoorden.length > 0 ?
                    decenniaMeesteAntwoorden.map((s, i) =>
                        <Fragment key={`decenniaMeesteAntwoorden_${s.decennium}${s.decennium + 9}`}>
                            {padLeadingZeros(s.corrects, 4)}x &mdash; {s.decennium}-{s.decennium + 9}
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
        </div>
    </div>
}

const Links = ({list, children}) => <div
    className={`stats_griditem_links font_sans_bold ${list || undefined}`}>{children}</div>
const Rechts = ({list, children}) => <div
    className={`stats_griditem_rechts font_mono_normal ${list || undefined}`}>{children}</div>

// const Lijn = ({list}) => <div className={`stats_griditem_divider ${list || undefined}`}/>

export const Breed = ({id, className, style, children}) => <>
    <div
        id={id}
        style={style}
        className={`stats_griditem_breed font_sans_normal ${className}`}>
        {children}
    </div>
</>

export default Statistieken