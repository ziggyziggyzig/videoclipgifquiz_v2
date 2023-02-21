import {useContext, useState} from "react"

import {CurrentUserContext} from "../../Contexts/CurrentUser"
import NieuweClip from "./NieuweClip"
import Clips from "./Clips"
import Rondes from "./Rondes"
import Inzendingen from "./Inzendingen"
import Users from "./Users"
import Cycles from "./Cycles"

import './Admin.css'

const Admin = () => {
    const [{currentUserData}] = useContext(CurrentUserContext)
    const [showClips, setShowClips] = useState(false)
    const [showNieuweClip, setShowNieuweClip] = useState(false)
    const [showRondes, setShowRondes] = useState(false)
    const [showInzendingen, setShowInzendingen] = useState(false)
    const [showUsers, setShowUsers] = useState(false)
    const [showCycles, setShowCycles] = useState(false)

    return currentUserData && currentUserData.OWN_ACCOUNT && <div className="admin_content">
        <>
            <button
                style={{backgroundColor:showNieuweClip ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowNieuweClip(!showNieuweClip)} className="button_groot">
                <i className="fa-sharp fa-solid  fa-cloud-arrow-up" title="nieuwe clip"/>
            </button>
            <button
                style={{backgroundColor:showClips ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowClips(!showClips)} className="button_groot">
                <i className="fa-sharp fa-solid  fa-film"/>
            </button>
            <button
                style={{backgroundColor:showRondes ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowRondes(!showRondes)} className='button_groot'>
                <i className="fa-sharp fa-regular fa-calendar-days"/>
            </button>
            <button
                style={{backgroundColor:showInzendingen ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowInzendingen(!showInzendingen)} className='button_groot'>
                <i className="fa-sharp fa-solid  fa-comment"/>
            </button>
            <button
                style={{backgroundColor:showUsers ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowUsers(!showUsers)} className='button_groot'>
                <i className="fa-sharp fa-solid  fa-users"/>
            </button>
            <button
                style={{backgroundColor:showCycles ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => setShowCycles(!showCycles)} className='button_groot'>
                <i className="fa-sharp fa-solid  fa-arrows-spin"/>
            </button>
        </>
        {showNieuweClip && <NieuweClip/>}
        {showClips && <Clips/>}
        {showRondes && <Rondes/>}
        {showInzendingen && <Inzendingen/>}
        {showUsers && <Users/>}
        {showCycles && <Cycles/>}
    </div>
}

export default Admin