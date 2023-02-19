import {useCallback, useEffect, useState} from "react"

import {collection, doc, getDocs, limit, orderBy, query, updateDoc, where, addDoc, onSnapshot} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Inzendingen = () => {
    const [user, setUser] = useState(null)
    const [inzendingen, setInzendingen] = useState(null)
    const [usersData, setUsersData] = useState([])
    const [loadNumber, setLoadNumber] = useState(50)

    const goedkeuren = async (inzending) => {
        let zekerweten = window.confirm(`"${inzending.tekst}" van ${inzending.userData.DISPLAYNAME} goedkeuren?`)
        if (zekerweten) {
            await updateDoc(doc(db, 'inzendingen', String(inzending.DOC_ID)), {beoordeling:3})
            await addDoc(collection(db, 'messages'), {
                FOR_USER_ID:inzending.USER_ID,
                PUSHED:false,
                READ:[],
                TIMESTAMP:Date.now(),
                TEXT:`Je antwoord '${inzending.tekst}' is alsnog goedgekeurd, gefeliciteerd!`
            })
            return loadInzendingen()
        } else {
            return true
        }
    }

    const afkeuren = async (inzending) => {
        let zekerweten = window.confirm(`"${inzending.tekst}" van ${inzending.userData.DISPLAYNAME} afkeuren?`)
        if (zekerweten) {
            await updateDoc(doc(db, 'inzendingen', String(inzending.DOC_ID)), {beoordeling:0})
            return loadInzendingen()
        } else {
            return true
        }
    }

    const reloadData = async () => {
        await loadUsers()
        return loadInzendingen()
    }

    const loadUsers = async () => {
        let snapshot = await getDocs(collection(db, 'users'))
        let toState = []
        for (let d of snapshot.docs) {
            toState.push({USER_ID:d.id, ...d.data()})

        }
        return setUsersData(toState)
    }

    const loadInzendingen = useCallback(() => {
        let unsubscribe
        if (user) {
            unsubscribe = onSnapshot(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), where('USER_ID', '==', user), limit(loadNumber || 50)), (snapshot) => {
                let toState = []
                for (let d of snapshot.docs) {
                    let user = usersData.find(o => o.USER_ID === d.data().USER_ID)
                    toState.push({userData:user, DOC_ID:d.id, ...d.data()})

                }
                setInzendingen(toState)
            })
        } else {
            unsubscribe = onSnapshot(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), limit(loadNumber || 50)), (snapshot) => {
                let toState = []
                for (let d of snapshot.docs) {
                    let user = usersData.find(o => o.USER_ID === d.data().USER_ID)
                    toState.push({userData:user, DOC_ID:d.id, ...d.data()})

                }
                setInzendingen(toState)
            })
        }
        return () => {
            unsubscribe()
        }
    }, [user, usersData, loadNumber])

    useEffect(() => {
        if (usersData && usersData.length > 0) loadInzendingen()
    }, [usersData, user, loadInzendingen])

    useEffect(() => {
        loadUsers()
    }, [])

    return usersData && usersData.length > 0 && inzendingen && inzendingen.length > 0 && <>
        {/*<TextField id="standard-basic" label="ronde" variant="standard" sx={{width:'10em'}} onChange={(e)=>setRonde(e.target.value)}*/}
        {/*sx={{margin:'2em'}}/>*/}
        <hr/>
        <input type="button" onClick={() => setUser(null)} value='reset tabel'/><br/>
        {/*<Button onClick={() => reloadData()} variant="outlined">reload</Button>*/}

        <table className='font_sans_normal admin_tabel'>
            <thead>
            <tr>
                <td>&nbsp;</td>
                <td>tijd</td>
                <td>ronde</td>
                <td>medium</td>
                <td>user</td>
                <td>tekst</td>
            </tr>
            </thead>
            <tbody>
            {inzendingen.map((i, n) =>
                <tr key={n}

                >
                    <td>
                        <input type='button' style={{backgroundColor:i.beoordeling === 3 ? 'green' : i.beoordeling === 0 ? 'red' : 'yellow'}}
                                onClick={i.beoordeling === 3 ? () => afkeuren(i) : () => goedkeuren(i)}
                        />
                    </td>
                    <td>
                        {new Date(i.timestamp).toLocaleString()}</td>
                    <td>
                        {i.ronde}</td>
                    <td>
                        {i.medium === 'twitter' && <i className="fab fa-twitter"/>}
                        {i.medium === 'google' && <i className="fab fa-google"/>}
                        {i.medium === 'mastodon' && <i className="fab fa-mastodon"/>}
                    </td>
                    <td
                        onClick={() => setUser(i.USER_ID)}>{i.userData.DISPLAYNAME}</td>
                    <td>
                        {i.tekst}</td>
                </tr>
            )}
            </tbody>
        </table>
        <input type='button' onClick={() => setLoadNumber(loadNumber + 50)} value='50 meer...'/>

    </>
}


export default Inzendingen