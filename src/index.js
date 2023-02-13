import React from 'react'
import ReactDOM from 'react-dom/client'

import moment from 'moment'
import 'moment/locale/nl'
import {DateTime} from "luxon"

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

moment.locale(`nl`)

DateTime.local({locale:'nl'})

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
