import './Erelijst.css'
import {Fragment, useContext, useEffect, useState} from "react"

import {UsersContext} from "../../Contexts/Users"
import {Rondelink} from "../Links/Links"
import {collection, getDocs, where, orderBy, limit, query, getDoc, doc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {Duration} from "luxon"
import Loading from "../Loading/Loading"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"

const Erelijst = () => {
    const [meesteWinsten, setMeesteWinsten] = useState(null)
    const [meesteGoed, setMeesteGoed] = useState(null)
    const [snelsteAntwoord, setSnelsteAntwoord] = useState([])
    const [langzaamsteWinst, setLangzaamsteWinst] = useState(null)
    const [valreep, setValreep] = useState(null)
    const [langsteSerie, setLangsteSerie] = useState(null)
    const [meesteInRonde, setMeesteInRonde] = useState(null)
    const [minsteInRonde, setMinsteInRonde] = useState(null)
    const [artiest, setArtiest] = useState(null)
    const [artiestCorrects, setArtiestCorrects] = useState(null)
    const [jaar, setJaar] = useState(null)
    const [jaarCorrects, setJaarCorrects] = useState(null)
    const [decennium, setDecennium] = useState(null)
    const [decenniumCorrects, setDecenniumCorrects] = useState(null)
    const [globals, setGlobals] = useState(null)

    const [{usersData}] = useContext(UsersContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    useEffect(() => {
        const getData = async () => {
            let g = await getDoc(doc(db, 'GLOBAL', 'STATS'))
            setGlobals(g.data())

            let artiesten_toState = []
            let as = await getDocs(collection(db, 'GLOBAL', 'STATS', 'ARTIESTEN'))
            for (let ad of as.docs) {
                let data = ad.data()
                data.rondes.sort((a, b) => a - b)
                artiesten_toState.push(data)
            }
            artiesten_toState.sort((a, b) => a.count === b.count ? b.corrects - a.corrects : b.count - a.count)
            setArtiest(artiesten_toState)
            artiesten_toState.sort((a, b) => a.corrects === b.corrects ? b.count - a.count : b.corrects - a.corrects)
            setArtiestCorrects(artiesten_toState)

            let jaren_toState = []
            let decennia_toState = []
            let js = await getDocs(collection(db, 'GLOBAL', 'STATS', 'JAREN'))
            for (let jd of js.docs) {
                jaren_toState.push(jd.data())
                let decennium = Math.floor(jd.data().jaar / 10) * 10
                let i = decennia_toState.findIndex(o => o.decennium === decennium)
                if (i === -1) {
                    decennia_toState.push({decennium:decennium, corrects:jd.data().corrects, count:1})
                } else {
                    decennia_toState[i].corrects += jd.data().corrects
                    decennia_toState[i].count++
                }
            }
            jaren_toState.sort((a, b) => a.count === b.count ? b.corrects - a.corrects : b.count - a.count)
            setJaar(jaren_toState)
            jaren_toState.sort((a, b) => a.corrects === b.corrects ? b.count - a.count : b.corrects - a.corrects)
            setJaarCorrects(jaren_toState)
            decennia_toState.sort((a, b) => a.count === b.count ? a.decennium - b.decennium : b.count - a.count)
            setDecennium(decennia_toState)
            decennia_toState.sort((a, b) => a.corrects === b.corrects ? a.decennium - b.decennium : b.corrects - a.corrects)
            setDecenniumCorrects(decennia_toState)

            if (usersData && usersData.length > 0) {
                const tel_winsten = usersData.map(a => a.WIN_COUNT)
                const meeste_winsten = Math.max(...tel_winsten)
                setMeesteWinsten(usersData.filter(user => user.WIN_COUNT === meeste_winsten))

                const tel_goed = usersData.map(a => a.CORRECT_COUNT)
                const meeste_goed = Math.max(...tel_goed)
                setMeesteGoed(usersData.filter(user => user.CORRECT_COUNT === meeste_goed))

                let snelste_antwoord_snap = await getDocs(
                    query(
                        collection(db, 'inzendingen'),
                        where('beoordeling', '==', 3),
                        orderBy('SPEED', 'asc'),
                        limit(1)
                    )
                )

                for (let snelste_antwoord_doc of snelste_antwoord_snap.docs) {
                    let u = usersData.find(o => o.USER_ID === snelste_antwoord_doc.data().USER_ID)
                    setSnelsteAntwoord({DISPLAYNAME:u.DISPLAYNAME, ...snelste_antwoord_doc.data()})
                }

                const tel_winsten_snelheid = []
                usersData.forEach(user => {
                    if (user.WIN_LIST && user.WIN_LIST.length > 0) {
                        user.WIN_LIST.forEach(winst => {
                            if (winst.SPEED) tel_winsten_snelheid.push(winst.SPEED)
                        })
                    }
                })
                let langzaamste_winst = Math.max(...tel_winsten_snelheid)

                usersData.forEach(user => {
                    if (user.WIN_LIST) {
                        user.WIN_LIST.forEach(w => {
                            if (w.SPEED === langzaamste_winst) {
                                setLangzaamsteWinst({...user, SLOWEST_STARTER:w})
                            }
                        })
                    }
                })

                let valreep_snap = await getDocs(query(collection(db, 'rondes'), where('ronde', '<', huidigeRondeNummer), orderBy('ronde', 'asc')))

                let tel_valrepen = []
                let meeste_antwoorden = {aantal:0, rondes:[]}
                let minste_antwoorden = {aantal:999, rondes:[]}

                for (let valreep_doc of valreep_snap.docs) {
                    let data = valreep_doc.data()
                    if (data.CORRECT_COUNT > meeste_antwoorden.aantal) {
                        meeste_antwoorden = {aantal:data.CORRECT_COUNT, rondes:[data.ronde]}
                    } else if (data.CORRECT_COUNT === meeste_antwoorden.aantal) {
                        meeste_antwoorden.rondes.push(data.ronde)
                    }
                    if (data.CORRECT_COUNT < minste_antwoorden.aantal) {
                        minste_antwoorden = {aantal:data.CORRECT_COUNT, rondes:[data.ronde]}
                    } else if (data.CORRECT_COUNT === minste_antwoorden.aantal) {
                        minste_antwoorden.rondes.push(data.ronde)
                    }
                    let v = data.TIMESTAMP_END - data.CORRECT_LAST.timestamp
                    let u = usersData.find(o => o.USER_ID === data.CORRECT_LAST.USER_ID)
                    if (u && !(v === 1 && data.ronde === 122) && !(v === 1 && data.ronde === 127)) tel_valrepen.push({
                        VALREEP:v,
                        DISPLAYNAME:u.DISPLAYNAME, ...data.CORRECT_LAST
                    })
                }

                setMeesteInRonde(meeste_antwoorden)
                setMinsteInRonde(minste_antwoorden)

                tel_valrepen.sort((a, b) => a.VALREEP - b.VALREEP)

                setValreep(tel_valrepen[0])

                let users_snap = await getDocs(collection(db, 'users'))

                let langste_serie = {LENGTH:0}

                for (let user_doc of users_snap.docs) {
                    if (user_doc.data().SERIES_LIST && user_doc.data().SERIES_LIST.length > 0) {
                        for (let serie of user_doc.data().SERIES_LIST) {
                            if (serie.LENGTH > langste_serie.LENGTH) {
                                langste_serie = {DISPLAYNAME:user_doc.data().DISPLAYNAME, ...serie}
                            }
                        }
                    }
                }

                setLangsteSerie(langste_serie)


            }
        }

        getData()
    }, [usersData, huidigeRondeNummer])

    return <div className="erelijst_content font_sans_normal">
        <h3>De cijfers</h3>
        {globals && artiest && artiest.length > 0 && huidigeRondeNummer ? <>
            <p>
                <b>Aantal gespeelde rondes</b>: {huidigeRondeNummer}
            </p>
            <p>
                <b>Aantal gemaakte
                    fragmenten</b>: {huidigeRondeNummer + (Math.floor(huidigeRondeNummer / 100) * 4) + globals.CLIP_UNPLANNED + globals.CLIP_PLANNED}<br/>
                <b>Aantal fragmenten nog niet gebruikt</b>: {globals.CLIP_UNPLANNED + globals.CLIP_PLANNED}<br/>
                <b>waarvan ingepland</b>:{globals.CLIP_PLANNED}
            </p>
            <p>
                <b>Aantal spelers</b>: {usersData.length}<br/>
                <b>Aantal verschillende
                    rondewinnaars</b>: {globals.WINNERS_COUNT} ({Math.round(globals.WINNERS_COUNT / usersData.length * 100)}%)
            </p>
            <p>
                <b>Totaal aantal correcte antwoorden</b>: {globals.CORRECT_COUNT}<br/>
                <b>Gemiddeld aantal antwoorden per speler</b>: {globals.CORRECT_AVG_SPELER}<br/>
                <b>Gemiddeld aantal antwoorden per ronde</b>: {globals.CORRECT_AVG_RONDE}
            </p>
            <p>
                <b>Aantal verschillende artiesten</b>: {artiest.length}
            </p>
            <hr/>
        </> : <Loading/>
        }
        {meesteWinsten && meesteWinsten.length > 0 ? <>
            <h4>Speler{meesteWinsten.length > 1 && 's'} met de meeste winsten</h4>
            <p>
                {meesteWinsten.map(i => <Fragment
                    key={i.USER_ID}><b>{i.DISPLAYNAME}</b> &mdash; {i.WIN_COUNT} winsten<br/></Fragment>)}
            </p>
            <hr/>
        </> : <Loading/>}
        {meesteGoed && meesteGoed.length > 0 ? <>
            <h4>Speler{meesteGoed.length > 1 && 's'} met de meeste juiste antwoorden</h4>
            <p>
                {meesteGoed.map(i => <Fragment
                    key={i.USER_ID}><b>{i.DISPLAYNAME}</b> &mdash; {i.CORRECT_COUNT} antwoorden<br/></Fragment>)}
            </p>
            <hr/>
        </> : <Loading/>}
        {snelsteAntwoord && snelsteAntwoord.DISPLAYNAME && snelsteAntwoord.SPEED && snelsteAntwoord.ronde ? <>
            <h4>Snelste antwoord</h4>
            <p>
                <b>{snelsteAntwoord.DISPLAYNAME}</b> &mdash; {Math.floor(snelsteAntwoord.SPEED / 1000)}.{snelsteAntwoord.SPEED - Math.floor(snelsteAntwoord.SPEED / 1000) * 1000} seconden &mdash;{' '}
                <Rondelink text="ronde" ronde={snelsteAntwoord.ronde} inhoud={true}/>
            </p>
            <hr/>
        </> : <Loading/>}
        {langzaamsteWinst && langzaamsteWinst.DISPLAYNAME && langzaamsteWinst.SLOWEST_STARTER.SPEED && langzaamsteWinst.SLOWEST_STARTER.ronde ? <>
            <h4>Langzaamste overwinning</h4>
            <p>
                <b>{langzaamsteWinst.DISPLAYNAME}</b> &mdash; {Duration.fromMillis(langzaamsteWinst.SLOWEST_STARTER.SPEED).toFormat("m 'minuten' s.SSS 'seconden'")} &mdash;{' '}
                <Rondelink text="ronde" ronde={langzaamsteWinst.SLOWEST_STARTER.ronde} inhoud={true}/>
            </p>
            <hr/>
        </> : <Loading/>}
        {valreep && valreep.ronde && valreep.VALREEP && valreep.DISPLAYNAME ? <>
            <h4>Op de valreep (laatste antwoord voor 20.15 uur)</h4>
            <p>
                <b>{valreep.DISPLAYNAME}</b> &mdash; {Math.floor(valreep.VALREEP / 1000)}.{valreep.VALREEP - Math.floor(valreep.VALREEP / 1000) * 1000} seconden &mdash;{' '}
                <Rondelink text="ronde" ronde={valreep.ronde} inhoud={true}/>
            </p>
            <hr/>
        </> : <Loading/>}
        {langsteSerie && langsteSerie.DISPLAYNAME ? <>
            <h4>Langste serie opeenvolgende antwoorden</h4>
            <p>
                <b>{langsteSerie.DISPLAYNAME}</b> &mdash; {langsteSerie.LENGTH} antwoorden &mdash; <Rondelink
                text="rondes" ronde={langsteSerie.SERIES[0].ronde}/> t/m <Rondelink
                ronde={langsteSerie.SERIES[langsteSerie.LENGTH - 1].ronde}/><br/>
                {langsteSerie.SERIES[langsteSerie.LENGTH - 1].ronde >= huidigeRondeNummer - 1 && '(lopende serie, kan dus nog langer worden)'}
            </p>
            <hr/>
        </> : <Loading/>}
        {meesteInRonde && meesteInRonde.aantal && meesteInRonde.rondes && meesteInRonde.rondes.length > 0 ? <>
            <h4>Ronde{meesteInRonde.rondes.length > 1 && 's'} met de meeste antwoorden</h4>
            <p>
                <i>{meesteInRonde.aantal} antwoorden:</i><br/>
                {meesteInRonde.rondes.length === 1 &&
                    <>
                        <Rondelink text="ronde" ronde={meesteInRonde.rondes[0]} inhoud={true}/>
                    </>}
                {meesteInRonde.rondes.length > 1 &&
                    <>
                        {meesteInRonde.rondes.map(r =>
                            <Fragment key={r}>
                                <Rondelink text="ronde" ronde={r} inhoud={true}/><br/>
                            </Fragment>
                        )}
                    </>
                }
            </p>
            <hr/>
        </> : <Loading/>}
        {minsteInRonde && minsteInRonde.aantal && minsteInRonde.rondes && minsteInRonde.rondes.length > 0 ? <>
            <h4>Ronde{minsteInRonde.rondes.length > 1 && 's'} met de minste antwoorden</h4>
            <p>
                <i>{minsteInRonde.aantal} antwoorden:</i><br/>
                {minsteInRonde.rondes.length === 1 &&
                    <Rondelink text="ronde" ronde={minsteInRonde.rondes[0]} inhoud={true}/>}
                {minsteInRonde.rondes.length > 1 &&
                    <>
                        {minsteInRonde.rondes.map(r =>
                            <Fragment key={r}>
                                <Rondelink text="ronde" ronde={r} inhoud={true}/><br/>
                            </Fragment>
                        )}
                    </>
                }
            </p>
            <hr/>
        </> : <Loading/>}
        {artiest && artiest.length > 0 && artiestCorrects && artiestCorrects.length > 0 ? <>
            <h4>Vaakste gevraagde artiest(en)</h4>
            <p>
                <i>{artiest[0].count} rondes:</i><br/>
                {artiest.map(a =>
                        a.count === artiest[0].count && <Fragment key={a.artiest}>{a.artiest} (rondes{' '}
                            {a.rondes.map((r, i) =>
                                <Fragment key={r * i}>
                                    <Rondelink ronde={r} inhoud={false}/>
                                    {i < a.rondes.length - 1 && <>{', '}</>}
                                </Fragment>
                            )}
                            )<br/>
                        </Fragment>
                )}
            </p>
            <h4>Best beantwoorde artiest(en)</h4>
            <p>
                <i>{artiest[0].corrects} antwoorden:</i><br/>
                {artiest.map(a =>
                        a.corrects === artiest[0].corrects && <Fragment key={a.artiest}>{a.artiest} (rondes{' '}
                            {a.rondes.map((r, i) =>
                                <Fragment key={r * i}>
                                    <Rondelink ronde={r} inhoud={false}/>
                                    {i < a.rondes.length - 1 && <>{', '}</>}
                                </Fragment>
                            )}
                            )<br/>
                        </Fragment>
                )}
            </p>
            <hr/>
        </> : <Loading/>}
        {jaar && jaar.length > 0 && jaarCorrects && jaarCorrects.length > 0 ? <>
            <h4>Vaakste gevraagde jaartal(len)</h4>
            <p>
                <i>{jaar[0].count} rondes:</i><br/>
                {jaar.map(a =>
                        a.count === jaar[0].count && <Fragment key={a.jaar}>{a.jaar}<br/>
                        </Fragment>
                )}
            </p>
            <h4>Best beantwoorde jaartal(len)</h4>
            <p>
                <i>{jaarCorrects[0].corrects} antwoorden:</i><br/>
                {jaarCorrects.map(a =>
                        a.corrects === jaarCorrects[0].corrects && <Fragment key={a.jaar}>{a.jaar}<br/>
                        </Fragment>
                )}
            </p>
            <hr/>
        </> : <Loading/>}
        {decennium && decennium.length > 0 && decenniumCorrects && decenniumCorrects.length > 0 ? <>
            <h4>Vaakste gevraagde decennium(/a)</h4>
            <p>
                <i>{decennium[0].count} rondes:</i><br/>
                {decennium.map(a =>
                        a.count === decennium[0].count && <Fragment key={a.decennium}>{a.decennium}-{a.decennium + 9}<br/>
                        </Fragment>
                )}
            </p>
            <h4>Best beantwoorde decennium(/a)</h4>
            <p>
                <i>{decenniumCorrects[0].corrects} antwoorden:</i><br/>
                {decenniumCorrects.map(a =>
                    a.corrects === decenniumCorrects[0].corrects &&
                    <Fragment key={a.decennium}>{a.decennium}-{a.decennium + 9}<br/>
                    </Fragment>
                )}
            </p>
            <hr/>
        </> : <Loading/>}
        <p><i>volledige statistieken komen binnenkort weer beschikbaar</i></p>
    </div>
}

export default Erelijst