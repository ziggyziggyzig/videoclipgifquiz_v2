import {useContext, useEffect, useState} from "react"
import {collection, getDocs, query, limit, orderBy, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {UsersContext} from "../../Contexts/Users"

const Prijzen = ({user_id}) => {
    const [snelste, setSnelste] = useState(false)
    const [meeste, setMeeste] = useState(false)
    const [winste, setWinste] = useState(false)
    const [serie, setSerie] = useState(false)
    const [bonus, setBonus] = useState(0)
    const [donateur, setDonateur] = useState(false)
    const [cadeau, setCadeau] = useState(0)
    const [{usersData}] = useContext(UsersContext)

    useEffect(() => {
        const fetchData = async () => {
            let all_users = usersData
            let this_user=all_users.find(o=>o.USER_ID===user_id)

            // snelste
            let qSnelste = query(collection(db, 'inzendingen'), where('beoordeling', '==', 3), orderBy('SPEED', 'asc'), limit(1))
            let sSnelste = await getDocs(qSnelste)
            sSnelste.forEach(doc => {
                let data = doc.data()
                if (data.USER_ID === user_id) setSnelste(true)
                return true
            })

            // meeste
            // let qMeeste = query(collection(db, 'users'), orderBy('CORRECT_COUNT', 'desc'), limit(5))
            // let sMeeste = await getDocs(qMeeste)
            let vorigeCount

            all_users.sort((a, b) => b.CORRECT_COUNT - a.CORRECT_COUNT)
            all_users.forEach(data => {
                if (!vorigeCount || data.CORRECT_COUNT === vorigeCount) {
                    data.USER_ID === user_id && setMeeste(true)
                } else {
                    return true
                }
                vorigeCount = data.CORRECT_COUNT
                return true
            })

            // winst

            vorigeCount = undefined
            all_users.sort((a, b) => b.WIN_COUNT - a.WIN_COUNT)

            all_users.forEach(data => {
                if (!vorigeCount || data.WIN_COUNT === vorigeCount) {
                    data.USER_ID === user_id && setWinste(true)
                } else {
                    return true
                }
                vorigeCount = data.WIN_COUNT
                return true
            })

            // serie
            vorigeCount = undefined
            let alle_series=[]
            for (let user of all_users) {
                if (user.SERIES_LIST && user.SERIES_LIST.length>0) {
                    for (let serie of user.SERIES_LIST) {
                        alle_series.push({USER_ID:user.USER_ID,SERIES_LENGTH:serie.LENGTH})
                    }
                }
            }

            alle_series.sort((a,b)=>b.SERIES_LENGTH-a.SERIES_LENGTH)
            alle_series.forEach(data => {
                if (!vorigeCount || data.SERIES_LENGTH === vorigeCount) {
                    data.USER_ID === user_id && setSerie(true)
                } else {
                    return true
                }
                vorigeCount = data.SERIES_LENGTH
                return true
            })

            // bonus
            if (this_user.BONUS_COUNT) {
                setBonus(this_user.BONUS_COUNT)
            }
            if (this_user.donateur) {
                setDonateur(true)
            }
            if (this_user.TAART_COUNT) {
                setCadeau(this_user.TAART_COUNT)
            }
            return true
        }

        usersData && usersData.length>0 && fetchData()
    }, [user_id,usersData])

    return (
        <>
            {bonus > 0 &&
                <span className="prijs"><i className="far fa-star" style={{marginRight:'0em'}}
                                           title="Bonusronde beantwoord"/>{bonus}</span>
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