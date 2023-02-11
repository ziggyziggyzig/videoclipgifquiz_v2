import React, {createContext, useReducer} from "react"

let HuidigeRondeReducer = (state, action) => {
    switch (action.type) {
        case "SET":
            return {...state, huidigeRondeNummer:action.huidigeRondeNummer}
        default:
            return state
    }
}
const initialHuidigeRonde = [null]
const HuidigeRondeContext = createContext(initialHuidigeRonde)
const HuidigeRondeProvider = ({children}) => {
    const [state, dispatch] = useReducer(HuidigeRondeReducer, initialHuidigeRonde)
    return (
        <HuidigeRondeContext.Provider value={[state, dispatch]}>
            {children}
        </HuidigeRondeContext.Provider>
    )
}

export {HuidigeRondeContext, HuidigeRondeProvider}
