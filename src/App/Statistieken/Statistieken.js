import {Fragment, useContext, useEffect, useState} from "react"

import './Statistieken.css'
import {UsersContext} from "../../Contexts/Users"
import {Rondelink, Spelerlink} from "../Links/Links"
import Loading from "../Loading/Loading"
import {padLeadingZeros} from "../../functions/strings"

const Statistieken = ({setLoadAll}) => {
    const [{usersData}] = useContext(UsersContext)
    const [spelersEerste, setSpelersEerste] = useState([])
    const [spelersMeesteAntwoorden, setSpelersMeesteAntwoorden] = useState([])
    const [spelersMeesteWinsten, setSpelersMeesteWinsten] = useState([])

    useEffect(() => {
        setLoadAll()
    }, [setLoadAll])

    useEffect(() => {
        const parseSpelers = async () => {
            let toState = []
            for (let u of usersData) {
                if (u.DISPLAYNAME && u.CORRECT_FIRST && u.CORRECT_FIRST.ronde && u.CORRECT_FIRST.timestamp) {
                    toState.push({
                        USER_ID:u.USER_ID,
                        DISPLAYNAME:u.DISPLAYNAME,
                        ronde:u.CORRECT_FIRST.ronde,
                        timestamp:parseInt(u.CORRECT_FIRST.timestamp, 10) || 0,
                        CORRECT_COUNT:u.CORRECT_COUNT || 0,
                        WIN_COUNT:u.WIN_COUNT || 0
                    })
                }
            }
            setSpelersEerste([...toState].sort((a, b) => a.timestamp - b.timestamp))
            setSpelersMeesteAntwoorden([...toState].sort((a, b) => b.CORRECT_COUNT - a.CORRECT_COUNT))
            setSpelersMeesteWinsten([...toState].sort((a, b) => b.WIN_COUNT - a.WIN_COUNT))
        }
        if (usersData && usersData.length > 0) parseSpelers()
    }, [usersData])

    return <div className="statistieken">
        <h2 className="font_sans_normal">Statistieken</h2>
        <div className="stats_gridcontainer">
            <Breed id="spelers">
                <h3>Spelers</h3>
            </Breed>
            <Links>
                eerste spelers
            </Links>
            <Rechts>
                {spelersEerste && spelersEerste.length > 0 ?
                    spelersEerste.map((s, i) =>
                        i < 10 && <Fragment key={s.USER_ID}>
                            <Rondelink ronde={s.ronde} text="ronde"/> &mdash;{' '}
                            {new Date(s.timestamp).toLocaleString()} &mdash;{' '}
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
                            {padLeadingZeros(s.CORRECT_COUNT,4)}x &mdash; <Spelerlink user_id={s.USER_ID} prijzen={false} naam={s.DISPLAYNAME}/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Links>
                <b>spelers met de meeste winsten</b>
            </Links>
            <Rechts>
                {spelersMeesteWinsten && spelersMeesteWinsten.length > 0 ?
                    spelersMeesteWinsten.map((s, i) =>
                        i < 10 && <Fragment key={s.USER_ID}>
                            {padLeadingZeros(s.WIN_COUNT,4)}x &mdash; <Spelerlink user_id={s.USER_ID} prijzen={false} naam={s.DISPLAYNAME}/>
                            <br/>
                        </Fragment>)
                    :
                    <Loading/>}
            </Rechts>
            <Breed id="spelers">
                <h3>Rondes</h3>
            </Breed>
            <Breed id="spelers">
                <h3>Inzendingen</h3>
            </Breed>
        </div>
    </div>
}

const Links = ({list, children}) => <div
    className={`stats_griditem_links font_sans_normal ${list || undefined}`}>{children}</div>
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