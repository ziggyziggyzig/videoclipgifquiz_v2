import {useCallback, useContext, useEffect, useState} from "react"

import {collection, doc, limit, orderBy, query, updateDoc, where, onSnapshot, getDoc} from "firebase/firestore"
import {adminFunctions, db} from "../../Firebase/Firebase"
import {send_message} from "../../functions/messages"
import {UsersContext} from "../../Contexts/Users"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const Inzendingen = () => {
    const [user, setUser] = useState(null)
    const [{usersData}] = useContext(UsersContext)
    const [{currentUserData}] = useContext(CurrentUserContext)
    const [inzendingen, setInzendingen] = useState(null)
    const [loadNumber, setLoadNumber] = useState(50)

    const goedkeuren = async (inzending) => {
        let zekerweten = window.confirm(`"${inzending.tekst}" van ${inzending.userData.DISPLAYNAME} goedkeuren?`)
        if (zekerweten) {
            await updateDoc(doc(db, 'inzendingen', String(inzending.DOC_ID)), {beoordeling:3})
            let rondeData = await getDoc(doc(db, 'rondes', String(inzending.ronde)))
            let clipData = await getDoc(doc(db, 'clips', rondeData.data().clip))
            let juiste_antwoord = clipData.data().antwoord || `'${clipData.data().titel}' van ${clipData.data().artiest}`
            await send_message({
                to_user_id:inzending.USER_ID,
                text:`Je antwoord '${inzending.tekst}' is alsnog goedgekeurd, gefeliciteerd! (Het juiste antwoord was ${juiste_antwoord}.)`,
                expiration:Date.now() + 86400000
            })
            if (inzending.bron === 'direct_message' && inzending.medium === 'twitter') {
                let twitter_user = usersData.find(o => o.USER_ID === inzending.USER_ID)
                await adminFunctions({
                    context:'twitter',
                    action:'send_dm',
                    user:currentUserData.AUTH_UID[0],
                    content:{
                        dm_tekst:`Je antwoord "${inzending.tekst}" is alsnog goedgekeurd, gefeliciteerd! (Het juiste antwoord was ${juiste_antwoord}.)`,
                        dm_id:twitter_user.TWITTER_UID_STR || String(twitter_user.TWITTER_UID)
                    }
                })
            } else if (inzending.bron === 'direct_message' && inzending.medium === 'mastodon') {
                let masto_user = usersData.find(o => o.USER_ID === inzending.USER_ID)
                await adminFunctions({
                    context:'mastodon',
                    action:'send_dm',
                    user:currentUserData.AUTH_UID[0],
                    content:{
                        dm_tekst:`Je antwoord "${inzending.tekst}" is alsnog goedgekeurd, gefeliciteerd! (Het juiste antwoord was ${juiste_antwoord}.)`,
                        dm_account:masto_user.MASTODON_ACCOUNT
                    }
                })
            }
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

    // const reloadData = async () => {
    //     await loadUsers()
    //     return loadInzendingen()
    // }

    const loadInzendingen = useCallback(() => {
        let unsubscribe
        if (user) {
            unsubscribe = onSnapshot(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), where('USER_ID', '==', user), limit(loadNumber || 50)), (snapshot) => {
                let toState = []
                for (let d of snapshot.docs) {
                    let user = usersData.find(o => o.USER_ID === d.data().USER_ID)
                    let check_dubbel = toState.findIndex(o =>
                        o.USER_ID === d.data().USER_ID &&
                        o.beoordeling === 3 &&
                        d.data().beoordeling === 3 &&
                        o.ronde === d.data().ronde
                    )
                    if (check_dubbel === -1) toState.push({userData:user, DOC_ID:d.id, ...d.data()})
                    else {
                        toState[check_dubbel] = {dubbel:true, ...toState[check_dubbel]}
                        toState.push({userData:user, DOC_ID:d.id, dubbel:true, ...d.data()})
                    }
                }
                setInzendingen(toState)
            })
        } else {
            unsubscribe = onSnapshot(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), limit(loadNumber || 50)), (snapshot) => {
                let toState = []
                for (let d of snapshot.docs) {
                    let user = usersData.find(o => o.USER_ID === d.data().USER_ID)
                    let check_dubbel = toState.findIndex(o =>
                        o.USER_ID === d.data().USER_ID &&
                        o.beoordeling === 3 &&
                        d.data().beoordeling === 3 &&
                        o.ronde === d.data().ronde
                    )
                    if (check_dubbel === -1) toState.push({userData:user, DOC_ID:d.id, ...d.data()})
                    else {
                        toState[check_dubbel] = {dubbel:true, ...toState[check_dubbel]}
                        toState.push({userData:user, DOC_ID:d.id, dubbel:true, ...d.data()})
                    }

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

    return usersData && usersData.length > 0 && inzendingen && inzendingen.length > 0 && <>
        {/*<TextField id="standard-basic" label="ronde" variant="standard" sx={{width:'10em'}} onChange={(e)=>setRonde(e.target.value)}*/}
        {/*sx={{margin:'2em'}}/>*/}
        <hr/>
        <input type="button" onClick={() => setUser(null)} value="reset tabel"/><br/>
        {/*<Button onClick={() => reloadData()} variant="outlined">reload</Button>*/}

        <table className="font_sans_normal admin_tabel">
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
                        <input type="button"
                               style={{
                                   backgroundColor:i.dubbel ?
                                       'black' :
                                       (i.beoordeling === 3 ?
                                               'lime' :
                                               (i.beoordeling === 0 ?
                                                       'orangered' :
                                                       'gold'
                                               )
                                       )
                               }}
                               onClick={i.beoordeling === 3 ? () => afkeuren(i) : () => goedkeuren(i)} value={' '}
                        />
                    </td>
                    <td className="admin_inzendingen_datum_lang">
                        {new Date(i.timestamp).toLocaleString()}
                    </td>
                    <td className="admin_inzendingen_datum_kort">
                        {new Date(i.timestamp).toLocaleString('nl-NL', {
                            weekday:"short",
                            hour:"numeric",
                            minute:"numeric",
                            second:"numeric"
                        })}
                    </td>
                    <td>
                        {i.ronde}</td>
                    <td>
                        {i.medium === 'twitter' && <i className="fab fa-twitter"/>}
                        {i.medium === 'google' && <i className="fab fa-google"/>}
                        {i.medium === 'mastodon' && <i className="fab fa-mastodon"/>}
                    </td>
                    <td
                        onClick={() => setUser(i.USER_ID)}>{i.userData.DISPLAYNAME}</td>
                    <td style={{color:i.beoordeling === 3 ? 'lime' : i.beoordeling === 0 ? 'orangered' : 'yellow'}}>
                        {i.tekst}</td>
                </tr>
            )}
            </tbody>
        </table>
        <input type="button" onClick={() => setLoadNumber(loadNumber + 50)} value="50 meer..."/>

    </>
}


export default Inzendingen