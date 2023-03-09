import {Fragment, useEffect, useState} from "react"

import {collection, doc, getDocs, updateDoc, setDoc, deleteDoc, query, where, deleteField} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Users = () => {
    const [alleUsers, setAlleUsers] = useState([])
    const [toMerge, setToMerge] = useState([])
    const [toMergeLength, setToMergeLength] = useState(0)
    const [doMerge, setDoMerge] = useState(false)

    const loadUsers = async () => {
        let toState = []
        let snap = await getDocs(collection(db, 'users'))
        for (let d of snap.docs) {
            toState.push({USER_ID:d.id, ...d.data()})
        }
        toState.sort((a, b) => b.CORRECT_COUNT - a.CORRECT_COUNT)
        setAlleUsers(toState)
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const klikCheckBox = (userid) => {
        let currentState = toMerge
        let i = currentState.findIndex(o => o === userid)
        if (i === 0) currentState.shift()
        else if (i === 1) currentState.pop()
        else if (i === -1 && currentState.length < 2) currentState.push(userid)
        setToMerge(currentState)
        setToMergeLength(currentState.length)
    }

    const mergeDone = () => {
        setDoMerge(false)
        setToMerge([])
        setToMergeLength(0)
        loadUsers()
    }

    return (alleUsers && alleUsers.length > 0) &&
    doMerge ? <MergeUsers
            users={[alleUsers.find(o => o.USER_ID === toMerge[0]), alleUsers.find(o => o.USER_ID === toMerge[1])]}
            done={() => mergeDone()}/> :
        <>
            <hr/>
            <input type="button" disabled={toMergeLength !== 2}
                   onClick={() => setDoMerge(true)} value="samenvoegen"/><br/>
            <table className="admin_tabel font_sans_normal">
                <thead>
                <tr>
                    <td/>
                    <td>id</td>
                    <td>twitter</td>
                    <td>google</td>
                    <td>mastodon</td>
                    <td>donateur</td>
                    <td>eerste</td>
                    <td>aantal</td>
                </tr>
                </thead>
                <tbody>
                {alleUsers.map(i =>
                    <tr key={i.USER_ID}
                    >
                        <td>
                            {(toMergeLength >= 2 && !toMerge.includes(i.USER_ID)) ?
                                <input type="checkbox" disabled checked={toMerge.includes(i.USER_ID)}/>
                                :
                                <input type="checkbox"
                                       onChange={() => klikCheckBox(i.USER_ID)}
                                       checked={toMerge.includes(i.USER_ID)}
                                />
                            }
                        </td>
                        <td>{i.USER_ID}</td>
                        <td><>{i.TWITTER_UID_STR && alleUsers.filter(o => o.TWITTER_UID_STR === i.TWITTER_UID_STR).length > 1 &&
                            <i className="fa-solid fa-triangle-exclamation rood"/>}{i.TWITTER_HANDLE}</>
                        </td>
                        <td><>{i.GOOGLE_UID && alleUsers.filter(o => o.GOOGLE_UID === i.GOOGLE_UID).length > 1 &&
                            <i className="fa-solid fa-triangle-exclamation rood"/>}{i.GOOGLE_EMAIL || ''}</>
                        </td>
                        <td><>{i.MASTODON_ACCOUNT && alleUsers.filter(o => o.MASTODON_ACCOUNT === i.MASTODON_ACCOUNT).length > 1 &&
                            <i className="fa-solid fa-triangle-exclamation rood"/>}{i.MASTODON_ACCOUNT || ''}</>
                        </td>
                        <td>{i.donateur ? 'true' : 'false'}</td>
                        <td>{(i.ATTEMPT_FIRST && i.ATTEMPT_FIRST.timestamp) ? new Date(i.ATTEMPT_FIRST.timestamp).toLocaleDateString() : ''}</td>
                        <td>{i.CORRECT_COUNT || 0}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </>
}

const MergeUsers = ({users, done}) => {
    const [mergedUser, setMergedUser] = useState([])
    const [order, setOrder] = useState([0, 1])

    useEffect(() => {
        let AUTH_IDS = [...users[0].AUTH_UID, ...users[1].AUTH_UID]

        setMergedUser({
            USER_ID:users[order[0]].USER_ID,
            AUTH_UID:AUTH_IDS,
            DISPLAYNAME:users[order[0]].DISPLAYNAME,
            donateur:users[order[0]].donateur || users[order[1]].donateur || false,
            GOOGLE_DISPLAYNAME:users[order[0]].GOOGLE_DISPLAYNAME || users[order[1]].GOOGLE_DISPLAYNAME || null,
            GOOGLE_EMAIL:users[order[0]].GOOGLE_EMAIL || users[order[1]].GOOGLE_EMAIL || null,
            GOOGLE_PHOTOURL:users[order[0]].GOOGLE_PHOTOURL || users[order[1]].GOOGLE_PHOTOURL || null,
            GOOGLE_UID:users[order[0]].GOOGLE_UID || users[order[1]].GOOGLE_UID || null,
            MASTODON_ACCOUNT:users[order[0]].MASTODON_ACCOUNT || users[order[1]].MASTODON_ACCOUNT || null,
            MASTODON_DISPLAYNAME:users[order[0]].MASTODON_DISPLAYNAME || users[order[1]].MASTODON_DISPLAYNAME || null,
            MASTODON_LIMITED:users[order[0]].MASTODON_LIMITED || users[order[1]].MASTODON_LIMITED || false,
            MASTODON_PHOTOURL:users[order[0]].MASTODON_PHOTOURL || users[order[1]].MASTODON_PHOTOURL || null,
            MASTODON_URL:users[order[0]].MASTODON_URL || users[order[1]].MASTODON_URL || null,
            TWITTER_DISPLAYNAME:users[order[0]].TWITTER_DISPLAYNAME || users[order[1]].TWITTER_DISPLAYNAME || null,
            TWITTER_HANDLE:users[order[0]].TWITTER_HANDLE || users[order[1]].TWITTER_HANDLE || null,
            TWITTER_PHOTOURL:users[order[0]].TWITTER_PHOTOURL || users[order[1]].TWITTER_PHOTOURL || null,
            TWITTER_UID:users[order[0]].TWITTER_UID || users[order[1]].TWITTER_UID || null,
            TWITTER_UID_STR:users[order[0]].TWITTER_UID_STR || users[order[1]].TWITTER_UID_STR || null,
            ATTEMPT_FIRST:deleteField(),
            BONUS_LIST:deleteField(),
            BRON_COUNT:deleteField(),
            CORRECT_FIRST:deleteField(),
            CORRECT_LAST:deleteField(),
            FAST_FIVE:deleteField(),
            MEDIUM_COUNT:deleteField(),
            SERIES_LIST:deleteField(),
            SLOW_FIVE:deleteField(),
            WIN_LIST:deleteField(),
            YEARS_LIST:deleteField()
        })
    }, [users, order])

    const wissel = () => {
        setOrder(order[0] === 0 ? [1, 0] : [0, 1])
        setTimeout(() => {
            document.getElementById('knoppen').scrollIntoView()
        }, 50)
    }

    const opslaan = async () => {
        let z = await getDocs(query(collection(db, 'inzendingen'), where('USER_ID', '==', users[order[1]].USER_ID)))
        for (let f of z.docs) {
            await updateDoc(doc(db, 'inzendingen', f.id), {USER_ID:mergedUser.USER_ID})
        }
        await setDoc(doc(db, 'users_backup', `${users[order[0]].USER_ID}-${new Date().getTime()}`), users[order[0]])
        await setDoc(doc(db, 'users_backup', `${users[order[1]].USER_ID}-${new Date().getTime()}`), users[order[1]])
        let m = await getDocs(query(collection(db, 'messages'), where('FOR_USER_ID', '==', users[order[1]].USER_ID)))
        for (let d of m.docs) {
            await updateDoc(doc(d.ref), {FOR_USER_ID:mergedUser.USER_ID})
        }
        await updateDoc(doc(db, 'users', mergedUser.USER_ID), mergedUser)
        await deleteDoc(doc(db, 'users', users[order[1]].USER_ID))
        done()
    }

    return <>
        {order.map((i, n) =>
            <Fragment key={i}>
                <div style={{backgroundColor:n === 0 ? 'green' : 'red'}} className="font_sans_normal">
                    <h5>{users[i].USER_ID}</h5>
                    <span><b>auth_uids:</b> {JSON.stringify(users[i].AUTH_UID)}<br/></span>
                    <span><b>displayname:</b> {users[i].DISPLAYNAME}<br/></span>
                    <span><b>donateur:</b> {users[i].donateur ? 'true' : 'false'}<br/></span>
                    <span><b>google displayname:</b> {users[i].GOOGLE_DISPLAYNAME}
                        <br/></span>
                    <span><b>google email:</b> {users[i].GOOGLE_EMAIL}<br/></span>
                    <span><b>google photourl:</b> {users[i].GOOGLE_PHOTOURL}<br/></span>
                    <span><b>google_uid:</b> {users[i].GOOGLE_UID}<br/></span>
                    <span><b>mastodon account:</b> {users[i].MASTODON_ACCOUNT}
                        <br/></span>
                    <span><b>mastodon displayname:</b> {users[i].MASTODON_DISPLAYNAME}
                        <br/></span>
                    <span><b>mastodon
                            limited:</b> {users[i].MASTODON_LIMITED ? 'true' : 'false'}<br/></span>
                    <span><b>mastodon photourl:</b> {users[i].MASTODON_PHOTOURL}
                        <br/></span>
                    <span><b>mastodon url:</b> {users[i].MASTODON_URL}<br/></span>
                    <span><b>twitter displayname:</b> {users[i].TWITTER_DISPLAYNAME}
                        <br/></span>
                    <span><b>twitter handle:</b> {users[i].TWITTER_HANDLE}<br/></span>
                    <span><b>twitter photourl:</b> {users[i].TWITTER_PHOTOURL}
                        <br/></span>
                    <span><b>twitter uid:</b> {users[i].TWITTER_UID}<br/></span>
                    <span><b>twitter uid_str:</b> {users[i].TWITTER_UID_STR}<br/></span>
                    {users[i].ATTEMPT_FIRST && users[i].ATTEMPT_FIRST.timestamp &&
                        <span><b>eerste
                                antwoord:</b> {new Date(users[i].ATTEMPT_FIRST.timestamp).toLocaleDateString()}
                            <br/></span>
                    }
                    <span><b>aantal antwoorden:</b> {users[i].CORRECT_COUNT || 0}<br/></span>
                </div>
                {n === 0 &&
                    <h4 style={{textAlign:'center', color:'var(--darkblue'}}><i
                        className="fa-solid fa-plus"/></h4>}
            </Fragment>
        )}
        <h4 style={{textAlign:'center', color:'var(--darkblue)'}}><i className="fa-solid fa-equals"/></h4>
        <div style={{backgroundColor:'green'}} className="font_sans_normal">
            <h5>{mergedUser.USER_ID}</h5>
            <span><b>auth_uids:</b> {JSON.stringify(mergedUser.AUTH_UID)}<br/></span>
            <span><b>displayname:</b> {mergedUser.DISPLAYNAME}<br/></span>
            <span><b>donateur:</b> {mergedUser.donateur ? 'true' : 'false'}<br/></span>
            <span><b>google displayname:</b> {mergedUser.GOOGLE_DISPLAYNAME}<br/></span>
            <span><b>google email:</b> {mergedUser.GOOGLE_EMAIL}<br/></span>
            <span><b>google photourl:</b> {mergedUser.GOOGLE_PHOTOURL}<br/></span>
            <span><b>google_uid:</b> {mergedUser.GOOGLE_UID}<br/></span>
            <span><b>mastodon account:</b> {mergedUser.MASTODON_ACCOUNT}<br/></span>
            <span><b>mastodon displayname:</b> {mergedUser.MASTODON_DISPLAYNAME}<br/></span>
            <span><b>mastodon limited:</b> {mergedUser.MASTODON_LIMITED ? 'true' : 'false'}
                <br/></span>
            <span><b>mastodon photourl:</b> {mergedUser.MASTODON_PHOTOURL}<br/></span>
            <span><b>mastodon url:</b> {mergedUser.MASTODON_URL}<br/></span>
            <span><b>twitter displayname:</b> {mergedUser.TWITTER_DISPLAYNAME}<br/></span>
            <span><b>twitter handle:</b> {mergedUser.TWITTER_HANDLE}<br/></span>
            <span><b>twitter photourl:</b> {mergedUser.TWITTER_PHOTOURL}<br/></span>
            <span><b>twitter uid:</b> {mergedUser.TWITTER_UID}<br/></span>
            <span><b>twitter uid_str:</b> {mergedUser.TWITTER_UID_STR}<br/></span>
        </div>
        <hr/>
        <input type="button" onClick={() => opslaan()} value="gereed"/>
        <a id="knoppen" href="#"><input type="button" onClick={() => wissel()} value="wissel"/></a>
    </>
}

export default Users