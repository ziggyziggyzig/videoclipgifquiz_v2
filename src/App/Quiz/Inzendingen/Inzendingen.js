import {useContext, useEffect, useState} from "react"
import { collection, onSnapshot, query, where} from "firebase/firestore"
import {db} from "../../../Firebase/Firebase"
import {Spelerlink} from "../../Links/Links"
import moment from "moment-timezone"
import "./Inzendingen.css"
import {UsersContext} from "../../../Contexts/Users"
import Loading from "../../Loading/Loading"
import {CurrentUserContext} from "../../../Contexts/CurrentUser"
import {ToonRondeContext} from "../../../Contexts/ToonRonde"

const Inzendingen = () => {
    const [inzendingen, setInzendingen] = useState([])
    const [{toonRondeNummer}]=useContext(ToonRondeContext)

    useEffect(() => {
        const q = query(collection(db, "inzendingen"), where("ronde", "==", parseInt(toonRondeNummer, 10)))

        let unsubscribe = onSnapshot(q, querySnap => {
            let toState = []
            for (let d of querySnap.docs) {
                if (d.data().beoordeling === 3) toState.push(d.data())
            }
            toState.sort((a, b) => a.timestamp - b.timestamp)
            setInzendingen(toState)
        })
        return () => {
            unsubscribe()
        }

    }, [toonRondeNummer])

    return <div className="inzendingen_content font_sans_normal">
        <h3>Inzendingen</h3>
        {inzendingen ?
            inzendingen.length > 0 ? <>
                    <table className="inzendingen_tabel font_mono_normal">
                        <thead>
                        <tr>
                            <td style={{textAlign:'right'}}>naam</td>
                            <td/>
                            <td/>
                            <td style={{textAlign:'right'}}>tijdstip</td>
                        </tr>
                        </thead>
                        <tbody>

                        {inzendingen.map((inzending, i) =>
                            inzending.timestamp && <Inzending inzending={inzending} key={i}/>
                        )}
                        </tbody>
                    </table>

                    <p className="font_mono_normal"><i>Totaal: <b>{inzendingen.length || 0}</b> antwoorden</i></p>
                </>

                :
                <span>nog geen goede antwoorden ontvangen</span>
            :
            <Loading/>
        }

    </div>
}

const Inzending = ({inzending}) => {
    const [showDetails, setShowDetails] = useState(false)
    const datumFormaat = {l:"dddd DD MMM HH:mm.ss", s:"dd HH:mm.ss"}
    const [{usersData}] = useContext(UsersContext)
    const [user, setUser] = useState(null)
    const [eigenInzending, setEigenInzending] = useState(false)

    const [{currentUserData}] = useContext(CurrentUserContext)

    useEffect(() => {
        if (usersData.length > 0) {
            let u = usersData.filter(o => o.USER_ID === inzending.USER_ID)
            setUser(u[0])
        }
    }, [usersData, inzending])

    useEffect(() => {
        if (user && user.USER_ID && currentUserData && currentUserData.USER_ID) {
            if (user.USER_ID === currentUserData.USER_ID) {
                setEigenInzending(true)
            } else {
                setEigenInzending(false)
            }
        }
    }, [user, currentUserData])

    const padLeadingZeros = (num, size) => {
        let s = num + ""
        while (s.length < size) s = "0" + s
        return s
    }

    return user && <>
        <tr key={inzending.id} className={showDetails ? 'inzendingen_details' : undefined}>
            <td style={{textAlign:'right'}}><Spelerlink user_id={user.USER_ID} prijzen={false}
                                                        eigenLink={eigenInzending}/></td>
            <td>{inzending.medium==='twitter' && <i className="fab fa-twitter inzendingen_provider inzendingen_doorklikker geel"
                                    onClick={() => window.open(`https://twitter.com/${user.TWITTER_HANDLE}`)}/>}
                {inzending.medium==='google' && <i className="fab fa-google inzendingen_provider geel"/>}
                {inzending.medium==='mastodon' && <i className="fab fa-mastodon inzendingen_provider geel"/>}
            </td>
            <td style={{textAlign:'left'}}><Spelerlink speler={user.TWITTER_HANDLE} prijzen={true}
                                                       naam={false}/></td>
            <td style={{textAlign:'right'}}>
                {!showDetails && <>
                    <div className="inzendingen_datum_lang">
                        {moment.unix(Math.floor(inzending.timestamp / 1000)).format(datumFormaat.l)}
                        <span style={{fontSize:'0.6em',color:'rgba(0,0,0,0)'}}>.xxx</span>
                    </div>
                    <div className="inzendingen_datum_kort">
                        {moment.unix(Math.floor(inzending.timestamp / 1000)).format(datumFormaat.s)}
                        <span style={{fontSize:'0.6em',color:'rgba(0,0,0,0)'}}>.xxx</span>
                    </div>
                </>}
            </td>
            <td onClick={() => setShowDetails(!showDetails)} style={{cursor:'pointer'}}
                title={showDetails ? 'details verbergen' : 'details tonen'}>
                {showDetails ? <i className="fa-solid fa-angles-up"/> : <i className="fa-solid fa-angles-down"/>}
            </td>
        </tr>
        {showDetails &&
            <tr className="inzendingen_details">
                <td style={{textAlign:'right'}}>
                    {inzending.bron === "website" ?
                        <><i className="fa-regular fa-keyboard" style={{fontSize:'0.8em'}}/> via website</> :
                        <><i className="fa-regular fa-comment" style={{fontSize:'0.8em'}}/> via direct message</>}
                </td>
                <td colSpan={3} style={{textAlign:'right'}}>
                    <div>
                        {moment.unix(Math.floor(inzending.timestamp / 1000)).format(datumFormaat.l)}
                        <span style={{fontSize:'0.6em'}}>
                                .{padLeadingZeros(inzending.timestamp - (Math.floor(inzending.timestamp / 1000) * 1000), 3)}
                            </span>
                    </div>
                </td>
                <td/>
            </tr>
        }
    </>

}

export default Inzendingen