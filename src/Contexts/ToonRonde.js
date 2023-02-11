import React, {createContext, useReducer} from "react"

let ToonRondeReducer = (state, action) => {
    switch (action.type) {
        case "SET":
            return {...state, toonRondeNummer:action.toonRondeNummer,toonRondeData:action.toonRondeData}
        default:
            return state
    }
}

const initialToonRonde = [null]

const ToonRondeContext = createContext(initialToonRonde)

const ToonRondeProvider = ({children}) => {
    const [state, dispatch] = useReducer(ToonRondeReducer, initialToonRonde)
    return (
        <ToonRondeContext.Provider value={[state, dispatch]}>
            {children}
        </ToonRondeContext.Provider>
    )
}

export {ToonRondeContext, ToonRondeProvider}
