import {useContext, useEffect, useState} from "react"
import './App.css'

import * as ReactGA from "react-ga"

import {BrowserRouter, Route, Routes} from "react-router-dom"

import {collection, doc, getDocs, onSnapshot, query, where} from "firebase/firestore"
import {db} from "../Firebase/Firebase"
import {onAuthStateChanged, signInWithPopup, signOut} from "firebase/auth"
import {auth, twitterProvider, googleProvider} from "../Firebase/Firebase"

import {CurrentUserContext} from "../Contexts/CurrentUser"

import loadable from '@loadable/component'
import {HuidigeRondeContext} from "../Contexts/HuidigeRonde"

const Navigatie = loadable(() => import('./Navigatie/Navigatie'))
const Speler = loadable(() => import('./Speler/Speler'))
const Quiz = loadable(() => import('./Quiz/Quiz'))
const Login = loadable(() => import('./Login/Login'))
const Overzichten = loadable(() => import('./Overzichten/Overzichten'))
const Steun = loadable(() => import('./Steun/Steun'))
const Meta = loadable(() => import('./Meta/Meta'))
const Admin = loadable(() => import('./Admin/Admin'))

if (!window.location.href.includes("localhost") && !window.location.href.includes("admin") && !window.location.href.includes("test")) {
    const {measurementId} = require("../Firebase/FirebaseConfig.json")
    ReactGA.initialize(measurementId)
}

const App = () => {
    const [, dispatchCurrentUser] = useContext(CurrentUserContext)
    const [, dispatchHuidigeRonde] = useContext(HuidigeRondeContext)
    const [showMenu, setShowMenu] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [onthoudPagina, setOnthoudPagina] = useState(false)
    const [toonLoginPagina, setToonLoginPagina] = useState(true)
    const [newUser, setNewUser] = useState(null)

    const toonMenu = () => {
        setShowUserMenu(false)
        return setShowMenu(!showMenu)
    }

    const toonUserMenu = () => {
        setShowMenu(false)
        return setShowUserMenu(!showUserMenu)
    }

    const verbergAlleMenus = () => {
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
                let user = result.user
                const db_user = await getDocs(query(collection(db, 'users'), where('AUTH_UID', 'array-contains', user.uid)))
                if (db_user.size > 0) {
                    dispatchCurrentUser({
                        type:"SET",
                        currentUserData:{
                            PROVIDER:user.providerData[0].providerId,
                            USER_ID:db_user.docs[0].id, ...db_user.docs[0].data()
                        }
                    })
                } else {
                }
            })
            .catch((error) => console.error(error))
    }

    const uitloggen = async () => {
        await signOut(auth)
        return dispatchCurrentUser({type:"SET", currentUserData:null})
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
                const db_user = await getDocs(query(collection(db, 'users'), where('AUTH_UID', 'array-contains', user.uid)))
                if (db_user.size > 0) {
                    dispatchCurrentUser({
                        type:"SET",
                        currentUserData:{
                            PROVIDER:user.providerData[0].providerId,
                            USER_ID:db_user.docs[0].id, ...db_user.docs[0].data()
                        }
                    })
                    setToonLoginPagina(false)
                } else {
                    setOnthoudPagina(window.location.href)
                    setNewUser(user)
                    setToonLoginPagina(true)
                }
            } else {
                setToonLoginPagina(false)
                dispatchCurrentUser({type:"SET", currentUserData:null})
            }
            return true
        })
    }, [dispatchCurrentUser])

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "tellers", "huidige_ronde"), async (d) => {
            dispatchHuidigeRonde({type:'SET', huidigeRondeNummer:d.data().id})
        })

        return () => {
            unsubscribe()
        }
    }, [dispatchHuidigeRonde])

    useEffect(() => {
        if (!window.location.href.includes("localhost")
            && !window.location.href.includes("192.168")
            && !window.location.href.includes("test")
            && !window.location.href.includes("admin")) {
            ReactGA.pageview(window.location.pathname + window.location.search)
        }
    }, [])

    return <div className="App">
        <BrowserRouter>
            <Navigatie inloggen={(p) => inloggen(p)} uitloggen={() => uitloggen()}
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
                                <Speler/>
                            }/>
                        ))}
                        <Route path="/steun" element={<Steun/>}/>
                        <Route path="/meta" element={<Meta/>}/>
                        {/*<Route path="/statistieken" element={<Statistieken/>}/>*/}
                        <Route path="/overzichten" element={
                            <Overzichten/>
                        }/>
                        {Array(['/', '/ronde', '/ronde/:rondeId'].map(path =>
                            <Route key={path} path={path} element={
                                <Quiz/>
                            }/>
                        ))}
                        <Route path="/admin" element={<Admin/>}/>
                    </Routes>
                }
            </div>

        </BrowserRouter>
    </div>
}

export default App
