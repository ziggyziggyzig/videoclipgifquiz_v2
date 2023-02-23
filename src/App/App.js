import {useCallback, useContext, useEffect, useState} from "react"
import './App.css'

import * as ReactGA from "react-ga"

import {BrowserRouter, Route, Routes} from "react-router-dom"

import {collection, doc, getDocs, onSnapshot, query, where, orderBy, updateDoc} from "firebase/firestore"
import {db} from "../Firebase/Firebase"
import {onAuthStateChanged, signInWithPopup, signOut} from "firebase/auth"
import {auth, twitterProvider, googleProvider} from "../Firebase/Firebase"

import {CurrentUserContext} from "../Contexts/CurrentUser"

import loadable from '@loadable/component'
import {HuidigeRondeContext} from "../Contexts/HuidigeRonde"
import {MessagesContext} from "../Contexts/Messages"
import {UsersContext} from "../Contexts/Users"
import Statistieken from "./Statistieken/Statistieken"

const Navigatie = loadable(() => import('./Navigatie/Navigatie'))
const Speler = loadable(() => import('./Speler/Speler'))
const Quiz = loadable(() => import('./Quiz/Quiz'))
const Login = loadable(() => import('./Login/Login'))
const Overzichten = loadable(() => import('./Overzichten/Overzichten'))
const Steun = loadable(() => import('./Steun/Steun'))
const Meta = loadable(() => import('./Meta/Meta'))
const Admin = loadable(() => import('./Admin/Admin'))
const Messages = loadable(() => import('./Messages/Messages'))

if (!window.location.href.includes("localhost") && !window.location.href.includes("admin") && !window.location.href.includes("test")) {
    const {measurementId} = require("../Firebase/FirebaseConfig.json")
    ReactGA.initialize(measurementId)
}

const App = () => {
    const [{currentUserData}, dispatchCurrentUserData] = useContext(CurrentUserContext)
    const [, dispatchUsers] = useContext(UsersContext)
    const [{huidigeRondeNummer}, dispatchHuidigeRonde] = useContext(HuidigeRondeContext)
    const [, dispatchMessages] = useContext(MessagesContext)
    const [showMessages, setShowMessages] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [onthoudPagina, setOnthoudPagina] = useState(false)
    const [toonLoginPagina, setToonLoginPagina] = useState(false)
    const [newUser, setNewUser] = useState(null)
    const [loadAll, setLoadAll] = useState(false)

    const toonMessages = () => {
        setShowUserMenu(false)
        setShowMenu(false)
        return setShowMessages(!showMessages)
    }

    const toonMenu = () => {
        setShowMessages(false)
        setShowUserMenu(false)
        return setShowMenu(!showMenu)
    }

    const toonUserMenu = () => {
        setShowMessages(false)
        setShowMenu(false)
        return setShowUserMenu(!showUserMenu)
    }

    const verbergAlleMenus = () => {
        setShowMessages(false)
        setShowMenu(false)
        return setShowUserMenu(false)
    }

    const inloggen = (provider) => {
        let loginProvider
        if (provider === "twitter.com") loginProvider = twitterProvider
        else if (provider === "google.com") loginProvider = googleProvider
        else return
        return signInWithPopup(auth, loginProvider)
            .then(async (result) => {
                if (result.user) await processLogin(result.user)
            })
            .catch((error) => console.error(error))
    }

    const processLogin = useCallback(async (user) => {
        const db_user_auth = await getDocs(query(collection(db, 'users'), where('AUTH_UID', 'array-contains', user.uid)))
        if (db_user_auth.size > 0) {
            dispatchCurrentUserData({
                type:"SET",
                currentUserData:{
                    PROVIDER:user.providerData[0].providerId,
                    USER_ID:db_user_auth.docs[0].id, ...db_user_auth.docs[0].data()
                }
            })
        } else if (user.providerData[0].providerId === 'twitter.com') {
            const db_user_twitter = await getDocs(query(collection(db, 'users'), where('TWITTER_UID_STR', '==', String(user.providerData[0].uid))))
            if (db_user_twitter.size > 0) {
                let data = db_user_twitter.docs[0].data()
                data.AUTH_UID.push(user.uid)
                dispatchCurrentUserData({
                    type:"SET",
                    currentUserData:{
                        PROVIDER:user.providerData[0].providerId,
                        USER_ID:db_user_twitter.docs[0].id, ...data
                    }
                })
                await updateDoc(doc(db, 'users', db_user_twitter.docs[0].id), data)
            } else {
                setOnthoudPagina(window.location.href)
                setNewUser(user)
                setToonLoginPagina(true)
            }
        } else if (user.providerData[0].providerId === 'google.com') {
            const db_user_google = await getDocs(query(collection(db, 'users'), where('GOOGLE_UID', '==', String(user.providerData[0].uid))))
            if (db_user_google.size > 0) {
                let data = db_user_google.docs[0].data()
                data.AUTH_UID.push(user.uid)
                dispatchCurrentUserData({
                    type:"SET",
                    currentUserData:{
                        PROVIDER:user.providerData[0].providerId,
                        USER_ID:db_user_google.docs[0].id, ...data
                    }
                })
                await updateDoc(doc(db, 'users', db_user_google.docs[0].id), data)
            } else {
                setOnthoudPagina(window.location.href)
                setNewUser(user)
                setToonLoginPagina(true)
            }
        }
    },[dispatchCurrentUserData])

    const uitloggen = async () => {
        await signOut(auth)
        return dispatchCurrentUserData({type:"SET", currentUserData:null})
    }

    const loginVoltooid = () => {
        if (onthoudPagina) {
            setToonLoginPagina(false)
            window.location.href = onthoudPagina
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await processLogin(user)
            } else {
                setToonLoginPagina(false)
                dispatchCurrentUserData({type:"SET", currentUserData:null})
            }
            return true
        })
    }, [dispatchCurrentUserData,processLogin])

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "tellers", "huidige_ronde"), async (d) => {
            dispatchHuidigeRonde({type:'SET', huidigeRondeNummer:d.data().id})
        })

        return () => {
            unsubscribe()
        }
    }, [dispatchHuidigeRonde])

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "messages"), orderBy('TIMESTAMP', 'desc')), async (s) => {
            if (currentUserData && currentUserData.USER_ID) {
                let toContext = []
                let unread = false
                let unpushed = false
                for (let d of s.docs) {
                    if (toContext.length >= 5) continue
                    if (
                        (d.data().FOR_USER_ID === currentUserData.USER_ID || d.data().FOR_USER_ID === '*')
                        && (
                            !d.data().EXPIRES
                            || (d.data().EXPIRES && d.data().EXPIRES > Date.now())
                        )
                    ) {
                        toContext.push({ID:d.id, ...d.data()})
                        if (!d.data().READ.includes(currentUserData.USER_ID)) unread = true
                        if (d.data().PUSHED === false) unpushed = true
                    }
                }
                toContext.sort((a, b) => b.TIMESTAMP - a.TIMESTAMP)
                if (toContext.length > 0) dispatchMessages({
                    type:'SET',
                    messages:{unread:unread, unpushed:unpushed, list:toContext}
                })
            }
        })

        return () => {
            unsubscribe()
        }
    }, [currentUserData, dispatchMessages])

    useEffect(() => {
        if (!window.location.href.includes("localhost")
            && !window.location.href.includes("192.168")
            && !window.location.href.includes("test")
            && !window.location.href.includes("admin")) {
            ReactGA.pageview(window.location.pathname + window.location.search)
        }
    }, [])

    useEffect(() => {
        if (loadAll) {
            const unsubscribe = onSnapshot(collection(db, "users"), async (users) => {
                let toContext = []
                for (let user of users.docs) {
                    let {
                        TWITTER_UID_STR,
                        GOOGLE_UID,
                        MASTODON_ACCOUNT,
                        MASTODON_URL,
                        MASTODON_DISPLAYNAME,
                        BONUS_COUNT,
                        DISPLAYNAME,
                        OWN_ACCOUNT,
                        TAART_COUNT,
                        TWITTER_HANDLE,
                        CORRECT_COUNT,
                        SERIES_LIST,
                        WIN_COUNT,
                        FAST_FIVE,
                        WIN_LIST,
                        donateur,
                        MEDIUM_COUNT,
                        BRON_COUNT,
                        CORRECT_FIRST
                    } = user.data()
                    if (huidigeRondeNummer && WIN_LIST && WIN_LIST.length > 0) {
                        let i = WIN_LIST.findIndex(o => o.ronde === huidigeRondeNummer)
                        if (i > -1) delete WIN_LIST[i].tekst
                    }
                    toContext.push({
                        BONUS_COUNT:BONUS_COUNT || 0,
                        DISPLAYNAME:DISPLAYNAME,
                        OWN_ACCOUNT:OWN_ACCOUNT,
                        TAART_COUNT:TAART_COUNT,
                        TWITTER_HANDLE:TWITTER_HANDLE,
                        USER_ID:user.id,
                        CORRECT_COUNT:CORRECT_COUNT || 0,
                        SERIES_LIST:SERIES_LIST || [],
                        WIN_COUNT:WIN_COUNT || 0,
                        FAST_FIVE:FAST_FIVE || [],
                        TWITTER:!!TWITTER_UID_STR,
                        GOOGLE:!!GOOGLE_UID,
                        MASTODON:!!MASTODON_ACCOUNT,
                        MASTODON_URL:MASTODON_URL || null,
                        MASTODON_DISPLAYNAME:MASTODON_DISPLAYNAME || null,
                        WIN_LIST:WIN_LIST || [],
                        donateur:donateur || false,
                        MEDIUM_COUNT:MEDIUM_COUNT || [],
                        BRON_COUNT:BRON_COUNT || [],
                        CORRECT_FIRST: CORRECT_FIRST||[]
                    })
                }
                dispatchUsers({type:"SET", usersData:toContext})

            })

            return () => {
                unsubscribe()
            }
        }
    }, [dispatchUsers, huidigeRondeNummer, loadAll])

    return <div className="App">
        <BrowserRouter>
            {/*{currentUserData && (!currentUserData.ALLOW_MESSAGES || currentUserData.ALLOW_MESSAGES!==false) && <Messages/>}*/}
            <Navigatie inloggen={(p) => inloggen(p)} uitloggen={() => uitloggen()}
                       showMessages={showMessages} toonMessages={() => toonMessages()}
                       showMenu={showMenu} toonMenu={() => toonMenu()}
                       showUserMenu={showUserMenu} toonUserMenu={() => toonUserMenu()}
            />
            <div onClick={() => verbergAlleMenus()}>
                {toonLoginPagina
                    ?
                    <Login newUser={newUser} loginVoltooid={() => loginVoltooid()}
                           uitloggen={() => uitloggen()}/>
                    :
                    <Routes>
                        {Array(['/speler', '/speler/:spelerId'].map(path =>
                            <Route key={path} path={path} element={
                                <Speler setLoadAll={()=>setLoadAll(true)}/>
                            }/>
                        ))}
                        <Route path="/steun" element={<Steun setLoadAll={()=>setLoadAll(true)}/>}/>
                        <Route path="/meta" element={<Meta setLoadAll={()=>setLoadAll(true)}/>}/>
                        <Route path="/statistieken" element={<Statistieken setLoadAll={()=>setLoadAll(true)}/>}/>
                        <Route path="/overzichten" element={
                            <Overzichten setLoadAll={()=>setLoadAll(true)}/>
                        }/>
                        {Array(['/', '/ronde', '/ronde/:rondeId'].map(path =>
                            <Route key={path} path={path} element={
                                <Quiz loadAll={loadAll} setLoadAll={()=>setLoadAll(true)}/>
                            }/>
                        ))}
                        <Route path="/admin" element={<Admin setLoadAll={()=>setLoadAll(true)}/>}/>
                    </Routes>
                }
            </div>

        </BrowserRouter>
    </div>
}

export default App
