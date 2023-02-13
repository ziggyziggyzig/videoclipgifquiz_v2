import {lazy, useContext, useEffect, useState, Suspense} from "react"
import {getDownloadURL, ref} from "firebase/storage"
import {db, storage} from "../../Firebase/Firebase"
import "./Navigatie.css"
import {CurrentUserContext} from "../../Contexts/CurrentUser"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import Loading from "../Loading/Loading"
import {doc, getDoc} from "firebase/firestore"
import {MessagesContext} from "../../Contexts/Messages"

const Logo = lazy(() => import('./Logo'))
const Messages = lazy(() => import('./Messages'))
const Menu = lazy(() => import('./Menu'))
const UserMenu = lazy(() => import('./UserMenu'))

const Navigatie = ({
                       inloggen,
                       uitloggen,
                       showMessages,
                       toonMessages,
                       showMenu,
                       toonMenu,
                       showUserMenu,
                       toonUserMenu
                   }) => {
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)
    const [{currentUserData}] = useContext(CurrentUserContext)
    const [{messages}]=useContext(MessagesContext)
    const [headerUrl, setHeaderUrl] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [huidigeRondeStart, setHuidigeRondeStart] = useState(null)
    const [huidigeRondeEind, setHuidigeRondeEind] = useState(null)

    useEffect(() => {
        const getData = async () => {
            let snap = await getDoc(doc(db, 'rondes', String(huidigeRondeNummer)))
            let data = snap.data()
            setHuidigeRondeStart(data.TIMESTAMP_START / 1000)
            setHuidigeRondeEind(data.TIMESTAMP_END / 1000)
        }

        huidigeRondeNummer && getData()
    }, [huidigeRondeNummer])

    useEffect(() => {
        const img = new Image()
        img.onload = () => setImageLoaded(true)
        if (currentUserData && (currentUserData.TWITTER_PHOTOURL || currentUserData.GOOGLE_PHOTOURL))
            img.src = currentUserData.TWITTER_PHOTOURL || currentUserData.GOOGLE_PHOTOURL
    }, [currentUserData])

    const login = (p) => {
        inloggen(p)
        return toonUserMenu(false)
    }

    useEffect(() => {
        huidigeRondeStart &&
        huidigeRondeEind &&
        document.getElementById('navigatie_container') &&
        document.getElementById('navigatie_container').style &&
        setInterval(() => {
            let time = Math.round(new Date().getTime() / 1000)
            if (time >= huidigeRondeEind - 60 && time < huidigeRondeEind) {
                let perc = ((time - huidigeRondeEind + 60) / 60) * 100
                document.getElementById('navigatie_container').style.backgroundImage = `linear-gradient(to right,red 0%,red ${perc}%,var(--blue) ${perc}%,var(--blue) 100%`
                setShowAlert(false)
            } else if (time >= huidigeRondeStart && time < huidigeRondeStart + 60) {
                document.getElementById('navigatie_container').style.backgroundColor = 'red'
                document.getElementById('navigatie_container').style.backgroundImage = 'none'
                setShowAlert(true)
            } else {
                document.getElementById('navigatie_container').style.backgroundColor = 'var(--blue)'
                document.getElementById('navigatie_container').style.backgroundImage = 'none'
                setShowAlert(false)
            }
        }, 1000)
    }, [huidigeRondeStart, huidigeRondeEind])

    useEffect(() => {
        const fetchHeader = async () =>
            setHeaderUrl(await getDownloadURL(ref(storage, `assets/logo_line_yellow_trans.png`)))

        fetchHeader()
    }, [])

    return <div className={`navigatie_container ${showAlert ? 'navigatie_container_flash' : ''}`}
                id="navigatie_container">
        <div className="navigatie_links">
            <Suspense fallback={<Loading/>}>
                <Logo url={headerUrl}/>
            </Suspense>
        </div>
        {currentUserData && currentUserData.USER_ID &&
            <div className="navigatie_rechts" onClick={() => toonMessages()}>
                <div className="navigatie_messages_icon_container">
                    {messages && messages.unread && <i className="fa-solid fa-circle-exclamation navigatie_messages_icon_unread"/>}
                    <i className="fa-regular fa-envelope navigatie_messages_icon"/>
                </div>
            </div>
        }
        <div className="navigatie_rechts" onClick={() => toonUserMenu()}>
            {currentUserData ? <div className="navigatie_userimage_container">
                    {currentUserData.PROVIDER === "twitter.com" &&
                        <i className="fab fa-twitter navigatie_userimage_twitter"/>}
                    {currentUserData.PROVIDER === "google.com" &&
                        <i className="fab fa-google navigatie_userimage_twitter"/>}
                    {currentUserData.TWITTER_PHOTOURL || currentUserData.GOOGLE_PHOTOURL
                        ?
                        imageLoaded && <img src={currentUserData.TWITTER_PHOTOURL || currentUserData.GOOGLE_PHOTOURL}
                                            className="navigatie_userimage" alt={''}
                                            title={'Klik voor opties'}/>
                        :
                        <i className="fa-regular fa-id-card" title={'Klik voor opties'}/>}
                </div>
                :
                <i className="fas fa-user" title={'Klik voor inlogopties'}/>}
        </div>
        <div className="navigatie_rechts" onClick={() => toonMenu()}>
            <i className="fa-solid fa-bars"/>
        </div>
        <Suspense fallback={<Loading/>}>
            {currentUserData && currentUserData.USER_ID && currentUserData.USER_ID==='Qt1Ra4sGHrTHvgsJg9e7' && <Messages showMessages={showMessages}/>}
            <UserMenu showUserMenu={showUserMenu} inloggen={(p) => login(p)} uitloggen={() => uitloggen()}/>
            <Menu showMenu={showMenu}/>
        </Suspense>
    </div>
}

export default Navigatie