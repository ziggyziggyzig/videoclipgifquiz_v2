import {useContext, useEffect, useState} from "react"

import {CurrentUserContext} from "../../Contexts/CurrentUser"
import NieuweClip from "./NieuweClip"
import Clips from "./Clips"
import Rondes from "./Rondes"
import Inzendingen from "./Inzendingen"
import Users from "./Users"
import Cycles from "./Cycles"

import './Admin.css'
import PlayClip from "./PlayClip"
import Messages from "./Messages"

const Admin = ({setLoadAll}) => {
    const [{currentUserData}] = useContext(CurrentUserContext)
    const [showSection, setShowSection] = useState(null)

    const [playClip, setPlayClip] = useState(null)

    useEffect(() => {
        setLoadAll()
    }, [setLoadAll])

    return currentUserData && currentUserData.OWN_ACCOUNT && <div className="admin_content">
        <>
            <button
                style={{backgroundColor:showSection === 'NieuweClip' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'NieuweClip' ? setShowSection(null) : setShowSection('NieuweClip')}
                className="button_groot">
                <i className="fa-sharp fa-solid  fa-cloud-arrow-up" title="nieuwe clip"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Clips' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Clips' ? setShowSection(null) : setShowSection('Clips')}
                className="button_groot">
                <i className="fa-sharp fa-solid  fa-film"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Rondes' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Rondes' ? setShowSection(null) : setShowSection('Rondes')}
                className="button_groot">
                <i className="fa-sharp fa-regular fa-calendar-days"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Inzendingen' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Inzendingen' ? setShowSection(null) : setShowSection('Inzendingen')}
                className="button_groot">
                <i className="fa-sharp fa-solid  fa-comment"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Users' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Users' ? setShowSection(null) : setShowSection('Users')}
                className="button_groot">
                <i className="fa-sharp fa-solid  fa-users"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Cycles' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Cycles' ? setShowSection(null) : setShowSection('Cycles')}
                className="button_groot">
                <i className="fa-sharp fa-solid  fa-arrows-spin"/>
            </button>
            <button
                style={{backgroundColor:showSection === 'Messages' ? 'var(--darkblue)' : 'var(--blue)'}}
                onClick={() => showSection === 'Messages' ? setShowSection(null) : setShowSection('Messages')}
                className="button_groot">
                <i className="fa-regular fa-envelope"/>
            </button>
            <br/>
        </>
        {showSection === 'NieuweClip' && <NieuweClip/>}
        {showSection === 'Clips' && <Clips playClip={(c) => setPlayClip(c)}/>}
        {showSection === 'Rondes' && <Rondes playClip={(c) => setPlayClip(c)}/>}
        {showSection === 'Inzendingen' && <Inzendingen/>}
        {showSection === 'Users' && <Users/>}
        {showSection === 'Cycles' && <Cycles/>}
        {showSection === 'Messages' && <Messages/>}
        {playClip && <PlayClip clip={playClip} onHide={() => setPlayClip(null)}/>}
    </div>
}

export default Admin