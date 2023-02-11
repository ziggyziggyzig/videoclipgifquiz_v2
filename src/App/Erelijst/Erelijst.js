import './Erelijst.css'
import {Fragment, useContext, useEffect, useState} from "react"

import {UsersContext} from "../../Contexts/Users"
import {Rondelink} from "../Links/Links"
import {collection, getDocs, where, orderBy, limit, query} from "firebase/firestore"
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
    // const [artiest, setArtiest] = useState(null)
    // const [jaar, setJaar] = useState(null)
    // const [decennium, setDecennium] = useState(null)

    const [{usersData}] = useContext(UsersContext)
    const [{huidigeRondeNummer}]=useContext(HuidigeRondeContext)

    useEffect(() => {
        const getData = async () => {
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
        <h3>De erelijst</h3>
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
        <p><i>volledige statistieken komen binnenkort weer beschikbaar</i></p>
    </div>
}

export default Erelijst