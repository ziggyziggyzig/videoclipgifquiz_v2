import {Fragment, useContext, useEffect, useState} from "react"
import {collection, limit, onSnapshot, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {UsersContext} from "../../Contexts/Users"
import {DateTime} from "luxon"

const Messages = () => {
    const [{usersData}] = useContext(UsersContext)

    const [messages, setMessages] = useState(null)
    const [loadNumber, setLoadNumber] = useState(50)

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'messages'), orderBy('TIMESTAMP', 'desc'), limit(loadNumber || 50)), (snapshot) => {
            let toState = []
            for (let d of snapshot.docs) {
                toState.push({docid:d.id, ...d.data()})
            }
            setMessages(toState)
        })

        return () => {
            unsubscribe()
        }
    }, [loadNumber])

    return messages && messages.length > 0 && <>
        <table className="font_sans_normal admin_tabel">
            <thead>
            <tr>
                <td>aan</td>
                <td>tijd</td>
                <td>verloopt</td>
                <td>gelezen</td>
                <td>tekst</td>
            </tr>
            </thead>
            <tbody>
            {messages.map((i, n) =>
                <tr key={n} style={{backgroundColor:i.EXPIRES&&i.EXPIRES<Date.now()?'gray':undefined,borderBottom:i.EXPIRES&&i.EXPIRES<Date.now()?'1px solid var(--blue)':undefined}}>
                    <td>{i.FOR_USER_ID === '*' ? '*' : usersData.find(o => o.USER_ID === i.FOR_USER_ID).DISPLAYNAME}</td>
                    <td>{DateTime.fromMillis(i.TIMESTAMP).toLocaleString(DateTime.DATETIME_SHORT)}</td>
                    <td>{i.EXPIRES ? DateTime.fromMillis(i.EXPIRES).toLocaleString(DateTime.DATETIME_SHORT) : '-'}</td>
                    <td>{i.READ && i.READ.length>0 && i.READ.map((r,nn)=>
                        <Fragment key={nn}>{usersData.find(o => o.USER_ID === r).DISPLAYNAME}<br/></Fragment>
                    )}</td>
                    <td>{i.TEXT}</td>
                </tr>
            )}
            </tbody>
        </table>
    </>
}

export default Messages