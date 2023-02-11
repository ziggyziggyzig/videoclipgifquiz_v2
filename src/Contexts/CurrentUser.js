import React, {createContext, useReducer} from "react"

let CurrentUserReducer = (state, action) => {
    switch (action.type) {
        case "SET":
            return {...state, currentUserData:action.currentUserData}
        default:
            return state
    }
}
const initialCurrentUser = [null]
const CurrentUserContext = createContext(initialCurrentUser)
const CurrentUserProvider = ({children}) => {
    const [state, dispatch] = useReducer(CurrentUserReducer, initialCurrentUser)
    return (
        <CurrentUserContext.Provider value={[state, dispatch]}>
            {children}
        </CurrentUserContext.Provider>
    )
}

export {CurrentUserContext, CurrentUserProvider}
