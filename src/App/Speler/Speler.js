import {useParams} from "react-router-dom"
import {useContext, useEffect, useState, Fragment} from "react"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

import './Speler.css'
import {doc, getDoc, updateDoc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {DateTime, Duration} from "luxon"
import {Rondelink} from "../Links/Links"
import Loading from "../Loading/Loading"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"

const Speler = ({setLoadAll}) => {
    let spelerId = useParams().spelerId

    const [{currentUserData}, dispatchCurrentUser] = useContext(CurrentUserContext)
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)

    const [ownProfile, setOwnProfile] = useState(false)
    const [spelerData, setSpelerData] = useState(null)
    const [newDisplayName, setNewDisplayName] = useState(null)
    const [displayNameSaved, setDisplayNameSaved] = useState(false)
    const [decadeList, setDecadeList] = useState([])

    useEffect(() => {
        setLoadAll()
    }, [setLoadAll])

    const changeDisplayName = (e) => setNewDisplayName(e.target.value.substring(0, 32).normalize("NFD")
        .replace(/[\u0300-\u036f\u0020\u0027\u002d\u002e\u002f]/g, ""))

    const saveDisplayName = async () =>
        updateDoc(doc(db, 'users', currentUserData.USER_ID), {DISPLAYNAME:newDisplayName})
            .then(async () => {
                dispatchCurrentUser({
                    type:"SET",
                    currentUserData:{...currentUserData, DISPLAYNAME:newDisplayName}
                })
                setDisplayNameSaved(true)
                setTimeout(() => setDisplayNameSaved(false), 5000)
            })

    useEffect(() => {
        const getData = async () => {
            setOwnProfile(false)
            if (currentUserData && spelerId) spelerId === currentUserData.USER_ID && setOwnProfile(true)
            let spelerDoc = await getDoc(doc(db, 'users', spelerId))
            if (spelerDoc) {
                setSpelerData(spelerDoc.data())
                setNewDisplayName(spelerDoc.data().DISPLAYNAME)
            }
        }
        if (spelerId) {
            getData()
        }
    }, [spelerId, currentUserData])

    const toggle = (elementId, c) => {
        let ele = document.getElementsByClassName(elementId)
        for (let e of ele) {
            if (e.style.display === c) {
                e.style.display = "none"
            } else {
                e.style.display = c
            }
        }
    }

    useEffect(() => {
        if (spelerData && spelerData.YEARS_LIST && spelerData.YEARS_LIST.length > 0) {
            let decade_list = []
            for (let y of spelerData.YEARS_LIST) {
                if (y < 1900) continue
                let decade = Math.floor(y.year / 10) * 10
                let i = decade_list.findIndex(o => o.decade === decade)
                if (i > -1) {
                    decade_list[i].count += y.count
                } else {
                    decade_list.push({decade:decade, count:y.count})
                }
            }
            decade_list.sort((a, b) => a.count === b.count ? a.decade - b.decade : b.count - a.count)
            setDecadeList(decade_list)
        }
    }, [spelerData])

    return spelerId && spelerData ? <div className="speler">
            <h2 className="font_sans_normal">Profiel van <i
                className="font_sans_bold">{spelerData.DISPLAYNAME ? spelerData.DISPLAYNAME : <>&lt;onbekende
                schermnaam&gt;</>}</i></h2>

            <div className="speler_gridcontainer">

                <Links>
                    gekozen schermnaam
                </Links>
                <Rechts>
                    {ownProfile ?
                        <>
                            <input type="text" value={newDisplayName} onChange={(e) => changeDisplayName(e)}
                                   className="speler_tekstveld"/>
                            <input className="speler_knop" type="button" value="opslaan" onClick={() => saveDisplayName()}/>
                            {displayNameSaved && <><i className="fa-solid fa-check"/>&nbsp;naam opgeslagen</>}
                        </> :
                        <>{spelerData.DISPLAYNAME || <i>geen schermnaam gekozen</i>}</>}
                </Rechts>

                <Lijn/>

                {spelerData.TWITTER_UID_STR &&
                    <>
                        <Links>
                            twitterhandle
                        </Links>
                        <Rechts>
                            <a href={`https://twitter.com/${spelerData.TWITTER_HANDLE}`} target="_new">
                                @{spelerData.TWITTER_HANDLE}
                            </a>
                        </Rechts>

                        <Links>
                            twitter-schermnaam
                        </Links>
                        <Rechts>
                            {spelerData.TWITTER_DISPLAYNAME}
                        </Rechts>

                        <Lijn/>
                    </>
                }

                {spelerData.GOOGLE_UID &&
                    <>
                        {ownProfile &&
                            <>
                                <Links>
                                    emailadres
                                </Links>
                                <Rechts>
                                    {spelerData.GOOGLE_EMAIL}
                                </Rechts>
                            </>
                        }

                        <Links>
                            google-schermnaam
                        </Links>
                        <Rechts>
                            {spelerData.GOOGLE_DISPLAYNAME}
                        </Rechts>

                        <Lijn/>
                    </>
                }

                {spelerData.MASTODON_ACCOUNT &&
                    <>
                        <Links>
                            mastodon-account
                        </Links>
                        <Rechts>
                            {spelerData.MASTODON_URL ?
                                <a href={spelerData.MASTODON_URL} target="_new">{spelerData.MASTODON_ACCOUNT}</a>
                                :
                                spelerData.MASTODON_ACCOUNT
                            }
                        </Rechts>
                        {spelerData.MASTODON_DISPLAYNAME && spelerData.MASTODON_DISPLAYNAME !== '' &&
                            <>
                                <Links>
                                    mastodon-schermnaam
                                </Links>
                                <Rechts>
                                    {spelerData.MASTODON_DISPLAYNAME}
                                </Rechts>
                            </>
                        }
                        <Lijn/>
                    </>
                }

                {spelerData.CORRECT_FIRST && spelerData.CORRECT_FIRST.timestamp &&
                    <>
                        <Links>
                            eerste antwoord
                        </Links>
                        <Rechts>
                            {DateTime.fromMillis(parseInt(spelerData.CORRECT_FIRST.timestamp, 10)).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}<br/>
                            <Rondelink ronde={spelerData.CORRECT_FIRST.ronde} text="ronde"/>
                        </Rechts>
                    </>
                }

                {spelerData.CORRECT_LAST && spelerData.CORRECT_LAST.timestamp &&
                    <>
                        <Links>
                            recentste antwoord
                        </Links>
                        <Rechts>
                            {DateTime.fromMillis(parseInt(spelerData.CORRECT_LAST.timestamp, 10)).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}<br/>
                            <Rondelink ronde={spelerData.CORRECT_LAST.ronde} text="ronde"/>
                        </Rechts>
                    </>
                }

                <Links>
                    totaal aantal antwoorden
                </Links>
                <Rechts>
                    {spelerData.CORRECT_COUNT || 0} {spelerData.CORRECT_COUNT && spelerData.CORRECT_COUNT > 0 && <>({Math.round(spelerData.CORRECT_COUNT / huidigeRondeNummer * 1000) / 10}%
                    van alle rondes)</>}
                </Rechts>

                <Lijn/>

                <Links>
                    overwinningen
                </Links>

                <Rechts>
                    {spelerData.WIN_COUNT ? <>{spelerData.WIN_COUNT} ({Math.round(spelerData.WIN_COUNT / spelerData.CORRECT_COUNT * 1000) / 10}%
                        van alle antwoorden) <span className="lijstklikker"
                                                   onClick={() => toggle('win_count_list', 'block')}>(klik voor een overzicht)</span></> : 0}
                </Rechts>

                {spelerData.WIN_LIST && spelerData.WIN_LIST.length > 0 && spelerData.WIN_LIST.map(w =>
                        w.timestamp && <Fragment key={w.timestamp}>
                            <Links list="win_count_list">
                                {DateTime.fromMillis(parseInt(w.timestamp, 10)).toLocaleString(DateTime.DATE_FULL)}
                            </Links>
                            <Rechts list="win_count_list">
                                <Rondelink ronde={w.ronde} text="ronde"
                                           inhoud={w.ronde < huidigeRondeNummer}/>
                            </Rechts>
                        </Fragment>
                )}
                <Lijn list="win_count_list"/>

                <Links>
                    bonusrondes beantwoord
                </Links>

                <Rechts>
                    {spelerData.BONUS_COUNT ? <>{spelerData.BONUS_COUNT} ({Math.round(spelerData.BONUS_COUNT / Math.floor(huidigeRondeNummer / 100)) * 100}%
                        van alle bonusrondes) <span className="lijstklikker"
                                                    onClick={() => toggle('bonus_count_list', 'table-row')}>(klik voor een overzicht)</span></> : 0}
                </Rechts>
                {spelerData.BONUS_LIST && spelerData.BONUS_LIST.length > 0 && spelerData.BONUS_LIST.map(w =>
                        w.timestamp && <Fragment key={w.timestamp}>
                            <Links list="bonus_count_list">
                                {DateTime.fromMillis(parseInt(w.timestamp, 10)).toLocaleString(DateTime.DATE_FULL)}
                            </Links>
                            <Rechts list="bonus_count_list">
                                <Rondelink ronde={w.ronde} text="ronde"
                                           inhoud={w.ronde < huidigeRondeNummer}/>
                            </Rechts>
                        </Fragment>
                )}
                <Lijn list="bonus_count_list"/>

                <Links>
                    feestrondes beantwoord
                </Links>

                <Rechts>
                    {/*{spelerData.TAART_COUNT ? <>{spelerData.TAART_COUNT} ({Math.round(spelerData.TAART_COUNT/Math.floor(huidigeRondeData.SEASON-1))*100}% van alle feestrondes)</>: 0}*/}
                    {spelerData.TAART_COUNT || 0}
                </Rechts>

                <Lijn/>

                {spelerData.FAST_FIVE && spelerData.FAST_FIVE.length > 0 &&
                    <>
                        <Links>
                            snelste antwoorden
                        </Links>
                        <Rechts>
                            {spelerData.FAST_FIVE && spelerData.FAST_FIVE.length > 0 &&
                                <span className="lijstklikker"
                                      onClick={() => toggle('fast_five_list', 'table-row')}>(klik voor een overzicht)</span>}
                        </Rechts>
                        {spelerData.FAST_FIVE && spelerData.FAST_FIVE.length > 0 && spelerData.FAST_FIVE.map(w =>
                                w.timestamp && w.speed && <Fragment key={w.timestamp}>
                                    <Links list="fast_five_list">
                                        {DateTime.fromMillis(parseInt(w.timestamp, 10)).toLocaleString(DateTime.DATE_FULL)}
                                    </Links>
                                    <Rechts list="fast_five_list">
                                        {Duration.fromMillis(parseInt(w.speed, 10)).toFormat("s.SSS's'")}&nbsp;
                                        <Rondelink ronde={w.ronde} text="ronde"
                                                   inhoud={w.ronde < huidigeRondeNummer}/>
                                    </Rechts>
                                </Fragment>
                        )}
                        <Lijn list="fast_five_list"/>
                    </>
                }
                {spelerData.SLOW_FIVE && spelerData.SLOW_FIVE.length > 0 &&
                    <>
                        <Links>
                            langzaamste antwoorden
                        </Links>
                        <Rechts>
                            {spelerData.SLOW_FIVE && spelerData.SLOW_FIVE.length > 0 &&
                                <span className="lijstklikker"
                                      onClick={() => toggle('slow_five_list', 'table-row')}>(klik voor een overzicht)</span>}
                        </Rechts>
                        {spelerData.SLOW_FIVE && spelerData.SLOW_FIVE.length > 0 && spelerData.SLOW_FIVE.map(w =>
                                w.timestamp && w.speed && <Fragment key={w.timestamp}>
                                    <Links list="slow_five_list">
                                        {DateTime.fromMillis(parseInt(w.timestamp, 10)).toLocaleString(DateTime.DATE_FULL)}
                                    </Links>
                                    <Rechts list="slow_five_list">
                                        {Duration.fromMillis(parseInt(w.speed, 10)).toFormat("h'h' m'm' s.SSS's'")}&nbsp;
                                        <Rondelink ronde={w.ronde} text="ronde"
                                                   inhoud={w.ronde < huidigeRondeNummer}/>
                                    </Rechts>
                                </Fragment>
                        )}
                    </>
                }

                {((spelerData.FAST_FIVE && spelerData.FAST_FIVE.length > 0) || (spelerData.SLOW_FIVE && spelerData.SLOW_FIVE.length > 0)) &&
                    <Lijn/>
                }
                {spelerData.BRON_COUNT && spelerData.BRON_COUNT.length > 0 &&
                    <>
                        <Links>
                            antwoord-methodes
                        </Links>

                        <Rechts>
                            {spelerData.BRON_COUNT && spelerData.BRON_COUNT.length > 0 && spelerData.BRON_COUNT.map(w =>
                                <Fragment key={w.bron}>
                                    {w.bron.replace('_', ' ')}: {w.count}x
                                    ({Math.round(w.count / spelerData.BRON_COUNT.reduce((partialSum, a) => partialSum + a.count, 0) * 100)}%
                                    van alle antwoorden)<br/>
                                </Fragment>
                            )}
                        </Rechts>
                    </>
                }
                {spelerData.MEDIUM_COUNT && spelerData.MEDIUM_COUNT.length > 0 &&
                    <>
                        <Links>
                            antwoord-kanalen
                        </Links>

                        <Rechts>
                            {spelerData.MEDIUM_COUNT && spelerData.MEDIUM_COUNT.length > 0 && spelerData.MEDIUM_COUNT.map(w =>
                                <Fragment key={w.medium}>
                                    <i className={`fa-brands fa-${w.medium}`}/> {w.medium.replace('_', ' ')}: {w.count}x
                                    ({Math.round(w.count / spelerData.MEDIUM_COUNT.reduce((partialSum, a) => partialSum + a.count, 0) * 100)}%
                                    van alle antwoorden)<br/>
                                </Fragment>
                            )}
                        </Rechts>
                    </>
                }
                <Links>
                    series opeenvolgende antwoorden
                </Links>
                <Rechts>
                    {spelerData.SERIES_LIST && spelerData.SERIES_LIST.length > 0 ? <>{spelerData.SERIES_LIST.length} series <span
                        className="lijstklikker"
                        onClick={() => toggle('series_list_list', 'table-row')}>(klik voor een overzicht)</span></> : <i>geen
                        series van twee of meer antwoorden gescoord</i>}
                </Rechts>
                {spelerData.SERIES_LIST && spelerData.SERIES_LIST.length > 0 &&
                    <>
                        {spelerData.SERIES_LIST && spelerData.SERIES_LIST.length > 0 && spelerData.SERIES_LIST.map(w =>
                            <Fragment key={w.SERIES[0].ronde}>
                                <Links list="series_list_list">
                                    {w.LENGTH}x:
                                </Links>
                                <Rechts list="series_list_list">
                                    <Rondelink ronde={w.SERIES[0].ronde} text="rondes"/> t/m <Rondelink
                                    ronde={w.SERIES[w.SERIES.length - 1].ronde}/>
                                    {w.SERIES[w.SERIES.length - 1].ronde >= huidigeRondeNummer - 1 && ' *'}
                                </Rechts>
                            </Fragment>
                        )}
                        <Links list="series_list_list"/>
                        <Rechts list="series_list_list">
                            * lopende serie
                        </Rechts>
                    </>
                }
                {spelerData.MEDIUM_COUNT && spelerData.MEDIUM_COUNT.length > 0 && spelerData.SERIES_LIST && spelerData.SERIES_LIST.length > 0 &&
                    <Lijn/>}
                {spelerData.YEARS_LIST && spelerData.YEARS_LIST.length > 0 &&
                    <Links>
                        meeste antwoorden per jaartal
                    </Links>
                }
                {spelerData.YEARS_LIST && spelerData.YEARS_LIST.length > 0 &&
                    <Rechts>
                        <span className="lijstklikker" onClick={() => toggle('years_list_list', 'table-row')}>
                            (klik voor een overzicht)
                        </span>
                    </Rechts>
                }
                {spelerData.YEARS_LIST && spelerData.YEARS_LIST.length > 0 &&
                    <>
                        {spelerData.YEARS_LIST && spelerData.YEARS_LIST.length > 0 && spelerData.YEARS_LIST.map(w =>
                                w.year !== 0 && <Fragment key={w.year}>
                                    <Links list="years_list_list">
                                        {w.year}:
                                    </Links>
                                    <Rechts list="years_list_list">
                                        {w.count}x
                                    </Rechts>
                                </Fragment>
                        )}
                    </>
                }
                {decadeList && decadeList.length > 0 &&
                    <Links>
                        meeste antwoorden per decennium
                    </Links>
                }
                {decadeList && decadeList.length > 0 &&
                    <Rechts>
                        <span className="lijstklikker" onClick={() => toggle('decade_list_list', 'table-row')}>
                            (klik voor een overzicht)
                        </span>
                    </Rechts>
                }
                {decadeList && decadeList.length > 0 &&
                    <>
                        {decadeList && decadeList.length > 0 && decadeList.map(w =>
                                w.decade !== 0 && <Fragment key={w.decade}>
                                    <Links list="decade_list_list">
                                        {w.decade}-{w.decade + 9}:
                                    </Links>
                                    <Rechts list="decade_list_list">
                                        {w.count}x
                                    </Rechts>
                                </Fragment>
                        )}
                    </>
                }
            </div>
        </div>
        :
        <Loading/>
}

const Links = ({list, children}) => <div
    className={`speler_griditem_links font_sans_bold ${list || undefined}`}>{children}</div>
const Rechts = ({list, children}) => <div
    className={`speler_griditem_rechts font_sans_normal ${list || undefined}`}>{children}</div>

const Lijn = ({list}) => <div className={`speler_griditem_divider ${list || undefined}`}/>

export default Speler