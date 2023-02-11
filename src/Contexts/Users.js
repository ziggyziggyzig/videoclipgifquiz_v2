import React, {createContext, useReducer} from "react"

let UsersReducer = (state, action) => {
    switch (action.type) {
        case "SET":
            return {...state, usersData:action.usersData}
        default:
            return state
    }
}
const initialUsers = []
const UsersContext = createContext(initialUsers)
const UsersProvider = ({children}) => {
    const [state, dispatch] = useReducer(UsersReducer, initialUsers)
    return (
        <UsersContext.Provider value={[state, dispatch]}>
            {children}
        </UsersContext.Provider>
    )
}

export {UsersContext, UsersProvider}
