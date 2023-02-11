import {useContext, useState} from "react"
import {CurrentUserContext} from "../../Contexts/CurrentUser"
import {Container, Box, Button, ButtonGroup} from "@mui/material"
import NieuweClip from "./NieuweClip"
import Clips from "./Clips"
import Rondes from "./Rondes"
import Inzendingen from "./Inzendingen"
import Users from "./Users"
import Cycles from "./Cycles"

const Admin = () => {
    const [{currentUserData}] = useContext(CurrentUserContext)
    const [showClips, setShowClips] = useState(false)
    const [showNieuweClip, setShowNieuweClip] = useState(false)
    const [showRondes, setShowRondes] = useState(false)
    const [showInzendingen, setShowInzendingen] = useState(false)
    const [showUsers, setShowUsers] = useState(false)
    const [showCycles, setShowCycles] = useState(false)

    return currentUserData && currentUserData.OWN_ACCOUNT && <Container sx={{marginTop:'1em'}}>
        <Box>
            <ButtonGroup variant="contained">
                <Button sx={{fontSize:'1.5em'}}
                        variant={showNieuweClip ? 'outlined' : 'contained'}
                        onClick={() => setShowNieuweClip(!showNieuweClip)}>
                    <i className="fa-sharp fa-solid  fa-cloud-arrow-up" title="nieuwe clip"/>
                </Button>
                <Button sx={{fontSize:'1.5em'}} variant={showClips ? 'outlined' : 'contained'}
                        onClick={() => setShowClips(!showClips)}>
                    <i className="fa-sharp fa-solid  fa-film"/>
                </Button>
                <Button sx={{fontSize:'1.5em'}} variant={showRondes ? 'outlined' : 'contained'}
                        onClick={() => setShowRondes(!showRondes)}>
                    <i className="fa-sharp fa-regular fa-calendar-days"/>
                </Button>
                <Button sx={{fontSize:'1.5em'}}
                        variant={showInzendingen ? 'outlined' : 'contained'}
                        onClick={() => setShowInzendingen(!showInzendingen)}>
                    <i className="fa-sharp fa-solid  fa-comment"/>
                </Button>
                <Button sx={{fontSize:'1.5em'}} variant={showUsers ? 'outlined' : 'contained'}
                        onClick={() => setShowUsers(!showUsers)}>
                    <i className="fa-sharp fa-solid  fa-users"/>
                </Button>
                <Button sx={{fontSize:'1.5em'}} variant={showCycles ? 'outlined' : 'contained'}
                        onClick={() => setShowCycles(!showCycles)}>
                    <i className="fa-sharp fa-solid  fa-arrows-spin"/>
                </Button>
            </ButtonGroup>
        </Box>
        {showNieuweClip && <NieuweClip/>}
        {showClips && <Clips/>}
        {showRondes && <Rondes/>}
        {showInzendingen && <Inzendingen/>}
        {showUsers && <Users/>}
        {showCycles && <Cycles/>}
    </Container>

}

export default Admin