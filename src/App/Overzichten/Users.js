import {Fragment, useContext, useEffect, useState} from "react"
import {Rondelink, Spelerlink} from "../Links/Links"
import {CurrentUserContext} from "../../Contexts/CurrentUser"
import {Breed} from "./GridItems"
import {Duration} from "luxon"
import Loading from "../Loading/Loading"

const Users = ({usersData}) => {
    const [alleUsers, setAlleUsers] = useState([])
    const [alleUsersFiltered, setAlleUsersFiltered] = useState([])

    const [{currentUserData}] = useContext(CurrentUserContext)

    const [sorteerveld, setSorteerveld] = useState('CORRECT_COUNT')
    const [sorteervolgorde, setSorteervolgorde] = useState(true)

    useEffect(() => {
        let s = JSON.parse(JSON.stringify(alleUsers))
        s.sort((a, b) => {
            const varA = (typeof a[sorteerveld] === 'string')
                ? a[sorteerveld].toUpperCase().replace('_', '') : a[sorteerveld]
            const varB = (typeof b[sorteerveld] === 'string')
                ? b[sorteerveld].toUpperCase().replace('_', '') : b[sorteerveld]

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
        // if (!sorteervolgorde) s.reverse()
        setAlleUsersFiltered(s)
    }, [sorteerveld, sorteervolgorde, alleUsers])

    useEffect(() => {
        const loadData = async () => {
            let us = []
            for (let u of usersData) {
                if (u.OWN_ACCOUNT) continue
                let SERIES_LONGEST
                if (u.SERIES_LIST) {
                    let alle_series = u.SERIES_LIST
                    alle_series.sort((a, b) => b.LENGTH === a.LENGTH ? a.SERIES[0].ronde - b.SERIES[0].ronde : b.LENGTH - a.LENGTH)
                    SERIES_LONGEST = alle_series[0]
                }
                us.push({
                    USER_ID:u.USER_ID,
                    DISPLAYNAME:u.DISPLAYNAME || `@${u.TWITTER_HANDLE}`,
                    CORRECT_COUNT:u.CORRECT_COUNT,
                    WIN_COUNT:u.WIN_COUNT,
                    BONUS_COUNT:u.BONUS_COUNT || 0,
                    TAART_COUNT:u.TAART_COUNT || 0,
                    FAST_ONE:u.FAST_FIVE && u.FAST_FIVE.length > 0 ? u.FAST_FIVE[0] : null,
                    FAST_ONE_SPEED:u.FAST_FIVE && u.FAST_FIVE.length > 0 ? u.FAST_FIVE[0].speed : null,
                    SERIES_LONGEST:SERIES_LONGEST || null,
                    SERIES_LONGEST_SIZE:SERIES_LONGEST && SERIES_LONGEST.LENGTH ? SERIES_LONGEST.LENGTH : 0,
                    TWITTER:u.TWITTER,
                    GOOGLE:u.GOOGLE,
                    MASTODON:u.MASTODON
                })
            }
            us.sort((a, b) => b.CORRECT_COUNT === a.CORRECT_COUNT ? (b.WIN_COUNT === a.WIN_COUNT ? a.DISPLAYNAME.localeCompare(b.DISPLAYNAME) : b.WIN_COUNT - a.WIN_COUNT) : b.CORRECT_COUNT - a.CORRECT_COUNT)
            setAlleUsers(us)
        }

        if (usersData && usersData.length > 0) loadData()
    }, [usersData])

    const setSorting = (veld) => {
        if (sorteerveld === veld) {
            setSorteervolgorde(!sorteervolgorde)
        } else {
            setSorteerveld(veld)
            if (veld==='FAST_ONE_SPEED' || veld==='DISPLAYNAME') setSorteervolgorde(false)
            else setSorteervolgorde(true)
        }
    }

    return alleUsersFiltered && alleUsersFiltered.length > 0 ? <>
            <Breed>
                <div className="subgrid_container_8">

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('DISPLAYNAME')
                         }}>
                        schermnaam {sorteerveld === 'DISPLAYNAME' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-z-a"/> :
                        <i className="fa-solid fa-arrow-down-a-z"/>}</>}</div>

                    <div className="subgrid_griditem_heading"/>

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('CORRECT_COUNT')
                         }}>
                        antwoorden {sorteerveld === 'CORRECT_COUNT' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}
                    </div>

                    <div className="subgrid_griditem_heading font_mono_bold subgrid_griditem_heading_sortable"
                         onClick={() => {
                             setSorting('WIN_COUNT')
                         }}>
                        overwinningen {sorteerveld === 'WIN_COUNT' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}</div>

                    <div
                        className="subgrid_griditem_heading subgrid_griditem_optional font_mono_bold subgrid_griditem_heading_sortable"
                        onClick={() => {
                            setSorting('BONUS_COUNT')
                        }}>
                        bonusrondes {sorteerveld === 'BONUS_COUNT' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}</div>

                    <div
                        className="subgrid_griditem_heading subgrid_griditem_optional font_mono_bold subgrid_griditem_heading_sortable"
                        onClick={() => {
                            setSorting('TAART_COUNT')
                        }}>
                        feestrondes {sorteerveld === 'TAART_COUNT' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}</div>

                    <div
                        className="subgrid_griditem_heading subgrid_griditem_optional font_mono_bold subgrid_griditem_heading_sortable"
                        onClick={() => {
                            setSorting('FAST_ONE_SPEED')
                        }}>
                        snelste antwoord {sorteerveld === 'FAST_ONE_SPEED' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}</div>

                    <div
                        className="subgrid_griditem_heading subgrid_griditem_optional font_mono_bold subgrid_griditem_heading_sortable"
                        onClick={() => {
                            setSorting('SERIES_LONGEST_SIZE')
                        }}>
                        langste serie {sorteerveld === 'SERIES_LONGEST_SIZE' && <>{sorteervolgorde ?
                        <i className="fa-solid fa-arrow-up-9-1"/> :
                        <i className="fa-solid fa-arrow-down-1-9"/>}</>}</div>

                    {alleUsersFiltered.map((u, i) =>
                        <Fragment key={i}>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                <Spelerlink user_id={u.USER_ID} naam={u.DISPLAYNAME}
                                            eigenLink={currentUserData && currentUserData.USER_ID === u.USER_ID}
                                            prijzen={false}/>
                            </div>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'}`}>
                                {u.TWITTER && <i className="fab fa-twitter"/>} {u.GOOGLE && <i className="fab fa-google"/>} {u.MASTODON && <i className="fab fa-mastodon"/>}
                            </div>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'}`}>
                                {u.CORRECT_COUNT}
                            </div>

                            <div
                                className={`oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {u.WIN_COUNT}
                            </div>

                            <div
                                className={`subgrid_griditem_optional subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {[...Array(u.BONUS_COUNT)].map((e, i) => <i className="far fa-star prijs" key={i}
                                                                            style={{letterSpacing:'-0.4em'}}
                                                                            title="Verjaardagsronde beantwoord"/>
                                )}

                            </div>

                            <div
                                className={`subgrid_griditem_optional oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {[...Array(u.TAART_COUNT)].map((e, i) => <i className="fa-solid fa-cake-candles" key={i}
                                                                            style={{letterSpacing:'-0.4em'}}
                                                                            title="Verjaardagsronde beantwoord"/>
                                )}
                            </div>

                            <div
                                className={`subgrid_griditem_optional oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {u.FAST_ONE ?
                                    u.FAST_ONE.speed < 60000 ?
                                        <>{Duration.fromMillis(u.FAST_ONE.speed).toFormat("s.SSS's'")} (<Rondelink
                                            ronde={u.FAST_ONE.ronde} text="ronde"/>)</>
                                        :
                                        u.FAST_ONE.speed < 3600000 ?
                                            <>{Duration.fromMillis(u.FAST_ONE.speed).toFormat("m'm' s.SSS's'")} (<Rondelink
                                                ronde={u.FAST_ONE.ronde} text="ronde"/>)</>
                                            :
                                            <>{Duration.fromMillis(u.FAST_ONE.speed).toFormat("h'h' m'm' s.SSS's'")} (<Rondelink
                                                ronde={u.FAST_ONE.ronde} text="ronde"/>)</>

                                    :
                                    'niet beschikbaar'}
                            </div>

                            <div
                                className={`subgrid_griditem_optional oranje subgrid_griditem ${i % 2 === 1 && 'subgrid_griditem_colored'} font_mono_normal`}>
                                {u.SERIES_LONGEST ? <>{u.SERIES_LONGEST.LENGTH}x (<Rondelink
                                    ronde={u.SERIES_LONGEST.SERIES[0].ronde} text="rondes"/> t/m <Rondelink
                                    ronde={u.SERIES_LONGEST.SERIES[u.SERIES_LONGEST.LENGTH - 1].ronde}/>)</> : 'niet beschikbaar'}
                            </div>

                        </Fragment>
                    )}
                </div>
            </Breed>
        </>
        :
        <Loading/>


}

export default Users