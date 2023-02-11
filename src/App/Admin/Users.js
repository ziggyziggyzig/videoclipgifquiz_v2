import {
    Box,
    Button, Card, CardContent,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Typography
} from "@mui/material"

import {Fragment, useEffect, useState} from "react"
import {collection, doc, getDocs, updateDoc,setDoc,deleteDoc} from "firebase/firestore"
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
        console.log(currentState)
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
        <Box sx={{width:'100%'}}>
            <hr/>
            <Button variant="outlined" disabled={toMergeLength !== 2}
                    onClick={() => setDoMerge(true)}>samenvoegen</Button>
            <TableContainer component={Paper} sx={{marginTop:'1em', width:'100%'}}>
                <Table sx={{width:'100%'}} size="small" padding="none" stickyHeader={true}>
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell>id</TableCell>
                            <TableCell>twitter</TableCell>
                            <TableCell>google</TableCell>
                            <TableCell>mastodon</TableCell>
                            <TableCell>eerste</TableCell>
                            <TableCell>aantal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alleUsers.map(i =>
                            <TableRow key={i.USER_ID}
                                      sx={{'&:last-child td, &:last-child th':{border:0}}}
                                      hover={true}
                            >
                                <TableCell>
                                    {(toMergeLength >= 2 && !toMerge.includes(i.USER_ID)) ?
                                        <input type="checkbox" disabled checked={toMerge.includes(i.USER_ID)}/>
                                        :
                                        <input type="checkbox"
                                               onChange={() => klikCheckBox(i.USER_ID)}
                                               checked={toMerge.includes(i.USER_ID)}
                                        />
                                    }
                                </TableCell>
                                <TableCell>{i.USER_ID}</TableCell>
                                <TableCell>{i.TWITTER_HANDLE ? <>@{i.TWITTER_HANDLE}</> : ''}</TableCell>
                                <TableCell>{i.GOOGLE_EMAIL || ''}</TableCell>
                                <TableCell>{i.MASTODON_ACCOUNT || ''}</TableCell>
                                <TableCell>{(i.ATTEMPT_FIRST && i.ATTEMPT_FIRST.timestamp) ? new Date(i.ATTEMPT_FIRST.timestamp).toLocaleDateString() : ''}</TableCell>
                                <TableCell>{i.CORRECT_COUNT || 0}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>


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
            OWN_ACCOUNT:users[order[0]].OWN_ACCOUNT,
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
            TWITTER_UID:users[order[0]].TWITTER_UID || users[order[1]].TWITTER_UID || null
        })
    }, [users, order])

    const wissel = () => {
        setOrder(order[0] === 0 ? [1, 0] : [0, 1])
        setTimeout(() => {
            document.getElementById('knoppen').scrollIntoView()
        }, 50)
    }

    const opslaan=async () => {
        await setDoc(doc(db,'users_backup',`${users[order[0]].USER_ID}-${new Date().getTime()}`),users[order[0]])
        await setDoc(doc(db,'users_backup',`${users[order[1]].USER_ID}-${new Date().getTime()}`),users[order[1]])
        await updateDoc(doc(db,'users',mergedUser.USER_ID),mergedUser)
        await deleteDoc(doc(db,'users',users[order[1]].USER_ID))
        done()
    }

    return <>
        {order.map((i, n) =>
            <Fragment key={i}>
                <Card raised={true} sx={{margin:'1em', backgroundColor:n === 0 ? 'green' : 'red'}}>
                    <CardContent>
                        <Typography variant="h5">{users[i].USER_ID}</Typography>
                        <Typography variant="body1"><b>auth_uids:</b> {JSON.stringify(users[i].AUTH_UID)}</Typography>
                        <Typography variant="body1"><b>displayname:</b> {users[i].DISPLAYNAME}</Typography>
                        <Typography variant="body1"><b>ownaccount:</b> {users[i].OWN_ACCOUNT ? 'true' : 'false'}
                        </Typography>
                        <Typography variant="body1"><b>google displayname:</b> {users[i].GOOGLE_DISPLAYNAME}
                        </Typography>
                        <Typography variant="body1"><b>google email:</b> {users[i].GOOGLE_EMAIL}</Typography>
                        <Typography variant="body1"><b>google photourl:</b> {users[i].GOOGLE_PHOTOURL}</Typography>
                        <Typography variant="body1"><b>google_uid:</b> {users[i].GOOGLE_UID}</Typography>
                        <Typography variant="body1"><b>mastodon account:</b> {users[i].MASTODON_ACCOUNT}</Typography>
                        <Typography variant="body1"><b>mastodon displayname:</b> {users[i].MASTODON_DISPLAYNAME}
                        </Typography>
                        <Typography variant="body1"><b>mastodon
                            limited:</b> {users[i].MASTODON_LIMITED ? 'true' : 'false'}</Typography>
                        <Typography variant="body1"><b>mastodon photourl:</b> {users[i].MASTODON_PHOTOURL}</Typography>
                        <Typography variant="body1"><b>mastodon url:</b> {users[i].MASTODON_URL}</Typography>
                        <Typography variant="body1"><b>twitter displayname:</b> {users[i].TWITTER_DISPLAYNAME}
                        </Typography>
                        <Typography variant="body1"><b>twitter handle:</b> {users[i].TWITTER_HANDLE}</Typography>
                        <Typography variant="body1"><b>twitter photourl:</b> {users[i].TWITTER_PHOTOURL}</Typography>
                        <Typography variant="body1"><b>twitter uid:</b> {users[i].TWITTER_UID}</Typography>
                        {users[i].ATTEMPT_FIRST && users[i].ATTEMPT_FIRST.timestamp &&
                            <Typography variant="body1"><b>eerste
                                antwoord:</b> {new Date(users[i].ATTEMPT_FIRST.timestamp).toLocaleDateString()}
                            </Typography>
                        }
                        <Typography variant="body1"><b>aantal antwoorden:</b> {users[i].CORRECT_COUNT || 0}
                        </Typography>

                    </CardContent>
                </Card>
                {n === 0 &&
                    <Typography variant="h4" sx={{textAlign:'center'}}><i
                        className="fa-solid fa-plus"/></Typography>}
            </Fragment>
        )}
        <Typography variant="h4" sx={{textAlign:'center'}}><i className="fa-solid fa-equals"/></Typography>
        <Card raised={true} sx={{margin:'1em', backgroundColor:'yellow'}}>
            <CardContent>
                <Typography variant="h5">{mergedUser.USER_ID}</Typography>
                <Typography variant="body1"><b>auth_uids:</b> {JSON.stringify(mergedUser.AUTH_UID)}</Typography>
                <Typography variant="body1"><b>displayname:</b> {mergedUser.DISPLAYNAME}</Typography>
                <Typography variant="body1"><b>ownaccount:</b> {mergedUser.OWN_ACCOUNT ? 'true' : 'false'}</Typography>
                <Typography variant="body1"><b>google displayname:</b> {mergedUser.GOOGLE_DISPLAYNAME}</Typography>
                <Typography variant="body1"><b>google email:</b> {mergedUser.GOOGLE_EMAIL}</Typography>
                <Typography variant="body1"><b>google photourl:</b> {mergedUser.GOOGLE_PHOTOURL}</Typography>
                <Typography variant="body1"><b>google_uid:</b> {mergedUser.GOOGLE_UID}</Typography>
                <Typography variant="body1"><b>mastodon account:</b> {mergedUser.MASTODON_ACCOUNT}</Typography>
                <Typography variant="body1"><b>mastodon displayname:</b> {mergedUser.MASTODON_DISPLAYNAME}</Typography>
                <Typography variant="body1"><b>mastodon limited:</b> {mergedUser.MASTODON_LIMITED ? 'true' : 'false'}
                </Typography>
                <Typography variant="body1"><b>mastodon photourl:</b> {mergedUser.MASTODON_PHOTOURL}</Typography>
                <Typography variant="body1"><b>mastodon url:</b> {mergedUser.MASTODON_URL}</Typography>
                <Typography variant="body1"><b>twitter displayname:</b> {mergedUser.TWITTER_DISPLAYNAME}</Typography>
                <Typography variant="body1"><b>twitter handle:</b> {mergedUser.TWITTER_HANDLE}</Typography>
                <Typography variant="body1"><b>twitter photourl:</b> {mergedUser.TWITTER_PHOTOURL}</Typography>
                <Typography variant="body1"><b>twitter uid:</b> {mergedUser.TWITTER_UID}</Typography>
            </CardContent>
        </Card>
        <Button variant="contained" onClick={() => opslaan()}>gereed</Button>
        <Button variant="contained" onClick={() => wissel()}><a id="knoppen"/> wissel</Button>

    </>
}

export default Users