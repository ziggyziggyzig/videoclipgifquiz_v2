import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App/App'

import moment from 'moment'
import 'moment/locale/nl'

moment.locale(`nl`)

console.log(`Koekoek!`)

const root = ReactDOM.createRoot(document.getElementById(`root`))
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
