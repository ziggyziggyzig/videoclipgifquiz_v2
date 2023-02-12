import {useEffect, useState} from "react"
import {
    Box, Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material"

import {collection, doc, getDocs, limit, orderBy, query, updateDoc, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Inzendingen = () => {
    const [user, setUser] = useState(null)
    const [inzendingen, setInzendingen] = useState(null)
    const [usersData, setUsersData] = useState([])

    const goedkeuren = async (inzending) => {
        let zekerweten = window.confirm(`"${inzending.tekst}" van ${inzending.userData.DISPLAYNAME} goedkeuren?`)
        if (zekerweten) {
            await updateDoc(doc(db, 'inzendingen', String(inzending.DOC_ID)), {beoordeling:3})
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

    const loadUsers = () =>
        new Promise(async resolve => {
            let snapshot = await getDocs(collection(db, 'users'))
            let toState = []
            for (let d of snapshot.docs) {
                toState.push({USER_ID:d.id, ...d.data()})

            }
            setUsersData(toState)
        })

    const loadInzendingen = async () => {
        let snapshot
        if (user) {
            snapshot = await getDocs(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), where('USER_ID', '==', user), limit(50)))
        } else {
            snapshot = await getDocs(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), limit(50)))
        }
        let toState = []
        for (let d of snapshot.docs) {
            let user = usersData.find(o => o.USER_ID === d.data().USER_ID)
            toState.push({userData:user, DOC_ID:d.id, ...d.data()})

        }
        setInzendingen(toState)
    }

    useEffect(() => {
        if (usersData && usersData.length > 0) loadInzendingen()
    }, [usersData, user])

    useEffect(() => {
        loadUsers()
    }, [])

    return usersData && usersData.length > 0 && inzendingen && inzendingen.length > 0 && <Box sx={{width:'100%'}}>
        {/*<TextField id="standard-basic" label="ronde" variant="standard" sx={{width:'10em'}} onChange={(e)=>setRonde(e.target.value)}*/}
        {/*sx={{margin:'2em'}}/>*/}
        <hr/>
        <Button onClick={() => setUser(null)} variant="outlined">reset tabel</Button>
        <Button onClick={() => reloadData()} variant="outlined">reload</Button>

        <TableContainer component={Paper} sx={{marginTop:'1em', width:'100%'}}>
            <Table sx={{width:'100vw'}} size="small" padding="none" stickyHeader={true}>
                <TableHead>
                    <TableRow>
                        <TableCell>&nbsp;</TableCell>
                        <TableCell>tijd</TableCell>
                        <TableCell>ronde</TableCell>
                        <TableCell>medium</TableCell>
                        <TableCell>user</TableCell>
                        <TableCell>tekst</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inzendingen.map((i, n) =>
                        <TableRow key={n}
                                  sx={{
                                      '&:last-child td, &:last-child th':{border:0},
                                      borderBottom:`${n > 0 && i.ronde !== inzendingen[n - 1].ronde ? '1px' : 0}`
                                  }}
                                  hover={true}
                        >
                            <TableCell>
                                <Button variant="contained"
                                        color={i.beoordeling === 3 ? 'success' : i.beoordeling === 0 ? 'error' : 'warning'}
                                        size="small"
                                        onClick={i.beoordeling === 3 ? () => afkeuren(i) : () => goedkeuren(i)}
                                >
                                    &nbsp;
                                </Button>
                            </TableCell>
                            <TableCell>{new Date(i.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{i.ronde}</TableCell>
                            <TableCell>
                                {i.medium === 'twitter' && <i className="fab fa-twitter"/>}
                                {i.medium === 'google' && <i className="fab fa-google"/>}
                                {i.medium === 'mastodon' && <i className="fab fa-mastodon"/>}
                            </TableCell>
                            <TableCell onClick={() => setUser(i.USER_ID)}>{i.userData.DISPLAYNAME}</TableCell>
                            <TableCell>{i.tekst}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>

}


export default Inzendingen