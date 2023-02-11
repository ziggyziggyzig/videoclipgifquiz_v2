import {Link} from "react-router-dom"
import {useContext, useEffect, useState} from "react"
import {doc, getDoc} from "firebase/firestore"
import Prijzen from "../Prijzen/Prijzen"
import {db} from "../../Firebase/Firebase"
import {UsersContext} from "../../Contexts/Users"

const scrollToTop = () => {
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
    return true
}

export const Rondelink = ({text, ronde, inhoud = false}) => {
    let [titel, setTitel] = useState(null)
    let [artiest, setArtiest] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            let r = await getDoc(doc(db, "rondes", String(ronde)))
            let c = await getDoc(doc(db, "clips", r.data().clip))
            setTitel(c.data().titel)
            setArtiest(c.data().artiest)
        }

        inhoud && fetch()
    }, [inhoud, ronde])

    return text ?
        <><Link to={`/ronde/${ronde}`} onClick={() => scrollToTop()}
                className="linkslink">
            <>{text}&nbsp;</>
            {ronde}
        </Link>{inhoud && titel && artiest && <span style={{
            color:"var(--yellow)",
            fontSize:'0.9em'
        }}> ({parseInt(ronde, 10) % 100 !== 0 && `${artiest} - `}{titel})</span>}</>
        :
        <><Link to={`/ronde/${ronde}`} onClick={() => scrollToTop()}
                className="linkslink">{ronde}</Link>{inhoud && titel && artiest && <span style={{
            color:"var(--yellow)",
            fontSize:'0.9em'
        }}> ({parseInt(ronde, 10) % 100 !== 0 && `${artiest} - `}{titel})</span>}</>
}

export const Spelerlink = ({user_id, prijzen = true, naam = true,eigenLink=false}) => {
    const [{usersData}]=useContext(UsersContext)

    const [user,setUser]=useState(null)

    useEffect(()=>{
        if (user_id && usersData.length>0) {
            setUser(usersData.find(o=>o.USER_ID===user_id))
        }
    },[user_id,usersData])

    return user && user.DISPLAYNAME && <>{naam && <Link to={`/speler/${user_id}`} onClick={() => scrollToTop()}
                            className={`linkslink ${eigenLink ? 'lichtblauw' : undefined}`}>{user.DISPLAYNAME}</Link>}
        {prijzen && <Prijzen user_id={user_id}/>}</>
}
