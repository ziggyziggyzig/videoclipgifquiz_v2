import {useContext, useEffect, useState} from "react"
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

import {collection, getDocs, limit, orderBy, query, where} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"
import {UsersContext} from "../../Contexts/Users"

const Inzendingen = () => {
    const [user, setUser] = useState(null)
    const [inzendingen, setInzendingen] = useState(null)
    const [{usersData}] = useContext(UsersContext)

    useEffect(() => {
        const getData = async () => {
            let s
            if (user) {
                s = await getDocs(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), where('USER_ID', '==', user), limit(50)))
            } else {
                s = await getDocs(query(collection(db, 'inzendingen'), orderBy('timestamp', 'desc'), limit(100)))

            }
            let toState = []
            for (let d of s.docs) {
                let docdata = d.data()
                let user = usersData.find(o => o.USER_ID === docdata.USER_ID)
                toState.push({userData:user, ...docdata})
            }
            setInzendingen(toState)
        }

        usersData && usersData.length > 0 && getData()
    }, [user, usersData])

    return inzendingen && inzendingen.length > 0 && <Box sx={{width:'100%'}}>
        {/*<TextField id="standard-basic" label="ronde" variant="standard" sx={{width:'10em'}} onChange={(e)=>setRonde(e.target.value)}*/}
        {/*sx={{margin:'2em'}}/>*/}
        <hr/>
        <Button onClick={() => setUser(null)} variant="outlined">reset tabel</Button>
        <TableContainer component={Paper} sx={{marginTop:'1em', width:'100%'}}>
            <Table sx={{width:'100vw'}} size='small' padding='none' stickyHeader={true}>
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
                    {inzendingen.map((i,n) =>
                        <TableRow key={n}
                                  sx={{'&:last-child td, &:last-child th':{border:0},borderBottom:`${i.ronde!==inzendingen[n-1].ronde?'1px':0}`}}
                        hover={true}
                        >
                            <TableCell><Button variant="contained"
                                               color={i.beoordeling === 3 ? 'success' : i.beoordeling === 0 ? 'error' : 'warning'} size='small'>&nbsp;</Button></TableCell>
                            <TableCell>{new Date(i.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{i.ronde}</TableCell>
                            <TableCell>
                                {i.medium==='twitter' && <i className="fab fa-twitter"/>}
                                {i.medium==='google' && <i className="fab fa-google"/>}
                                {i.medium==='mastodon' && <i className="fab fa-mastodon"/>}
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