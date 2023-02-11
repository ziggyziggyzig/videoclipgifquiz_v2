import {useEffect, useState} from "react"
import {collection, getDocs, query, limit, orderBy, getDoc, doc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Prijzen = ({user_id}) => {
    const [snelste, setSnelste] = useState(false)
    const [meeste, setMeeste] = useState(false)
    const [winste, setWinste] = useState(false)
    const [serie, setSerie] = useState(false)
    const [bonus, setBonus] = useState(0)
    const [donateur, setDonateur] = useState(false)
    const [cadeau, setCadeau] = useState(0)

    useEffect(() => {
        const fetchData = async () => {

            // snelste
            let qSnelste = query(collection(db, 'stats', 'inzendingen', 'speed'), orderBy('speed', 'asc'), limit(1))
            let sSnelste = await getDocs(qSnelste)
            sSnelste.forEach(doc => {
                let data = doc.data()
                if (data.gebruiker === user_id) setSnelste(true)
                return true
            })

            // meeste
            let qMeeste = query(collection(db, 'stats', 'inzendingen', 'aantal'), orderBy('count', 'desc'), limit(5))
            let sMeeste = await getDocs(qMeeste)
            let vorigeCount

            sMeeste.forEach(doc => {
                let data = doc.data()
                if (!vorigeCount || data.count === vorigeCount) {
                    data.gebruiker === user_id && setMeeste(true)
                } else {
                    return true
                }
                vorigeCount = data.count
                return true
            })

            // winst
            let qWinste = query(collection(db, 'stats', 'winnaars', 'aantal'), orderBy('count', 'desc'), limit(5))
            let sWinste = await getDocs(qWinste)
            vorigeCount = undefined

            sWinste.forEach(doc => {
                let data = doc.data()
                if (!vorigeCount || data.count === vorigeCount) {
                    data.gebruiker === user_id && setWinste(true)
                } else {
                    return true
                }
                vorigeCount = data.count
                return true
            })

            // serie
            let qSerie = query(collection(db, 'stats', 'inzendingen', 'series'), orderBy('lengte', 'desc'), limit(5))
            let sSerie = await getDocs(qSerie)
            vorigeCount = undefined

            sSerie.forEach(doc => {
                let data = doc.data()
                if (!vorigeCount || data.lengte === vorigeCount) {
                    data.gebruiker === user_id && setSerie(true)
                } else {
                    return true
                }
                vorigeCount = data.lengte
                return true
            })

            // bonus
            let qSpeler = query(doc(db, 'users', user_id))
            let sSpeler = await getDoc(qSpeler)
            if (sSpeler.data().BONUS_COUNT) {
                setBonus(sSpeler.data().BONUS_COUNT)
            }
            if (sSpeler.data().donateur) {
                setDonateur(true)
            }
            if (sSpeler.data().TAART_COUNT) {
                setCadeau(sSpeler.data().TAART_COUNT)
            }
            return true
        }

        fetchData()
    }, [user_id])

    return (
        <>
            {bonus > 0 &&
                <span className="prijs"><i className="far fa-star" style={{marginRight:'0em'}} title="Bonusronde beantwoord"/>{bonus}</span>
            }
            {snelste && <i className="far fa-clock prijs" title="Snelste antwoord ooit"/>}
            {meeste && <i className="far fa-check-square prijs" title="Meeste juiste antwoorden"/>}
            {winste && <i className="fas fa-trophy prijs" title="Meeste rondewinsten"/>}
            {serie && <i className="fas fa-sync-alt prijs" title="Langste serie antwoorden"/>}
            {donateur && <i className="far fa-thumbs-up prijs" title="Vriendelijke donateur"/>}
            {/*{<i className="fa-regular fa-alarm-clock prijs"/>}*/}
            {[...Array(cadeau)].map((e, i) => <i className="fa-solid fa-cake-candles prijs" key={i}
                                                 title="Verjaardagsronde beantwoord"/>
            )}
            {bonus > 0 && <span style={{letterSpacing:'-0.5em'}}> </span>}
        </>
    )
}

export default Prijzen