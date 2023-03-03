import React from 'react'
import ReactDOM from 'react-dom/client'

import {DateTime, Settings} from "luxon"

import './index.css'

import "./Fonts/Courier Prime Sans/Courier Prime Sans.ttf"
import "./Fonts/Courier Prime Sans/Courier Prime Sans Bold.ttf"
import "./Fonts/Courier Prime Sans/Courier Prime Sans Italic.ttf"
import "./Fonts/Courier Prime Sans/Courier Prime Sans Bold Italic.ttf"

import {UsersProvider} from "./Contexts/Users"
import {CurrentUserProvider} from "./Contexts/CurrentUser"
import {ToonRondeProvider} from "./Contexts/ToonRonde"
import {HuidigeRondeProvider} from "./Contexts/HuidigeRonde"

import App from "./App/App"
import {MessagesProvider} from "./Contexts/Messages"

// const App = lazy(() => import("./App/App"))

DateTime.local({locale:'nl'})

Settings.defaultLocale = "nl";

console.log(`Koekoek!`)

if (module.hot) {
    module.hot.accept()
}

const root = ReactDOM.createRoot(document.getElementById(`root`))

root.render(
    <React.StrictMode>
        <UsersProvider>
            <CurrentUserProvider>
                <HuidigeRondeProvider>
                    <ToonRondeProvider>
                        <MessagesProvider>
                            <App/>
                        </MessagesProvider>
                    </ToonRondeProvider>
                </HuidigeRondeProvider>
            </CurrentUserProvider>
        </UsersProvider>
    </React.StrictMode>
)
