import React, {createContext, useReducer} from "react"

let MessagesReducer = (state, action) => {
    switch (action.type) {
        case "SET":
            return {...state, messages:action.messages}
        default:
            return state
    }
}
const initialMessages = []
const MessagesContext = createContext(initialMessages)
const MessagesProvider = ({children}) => {
    const [state, dispatch] = useReducer(MessagesReducer, initialMessages)
    return (
        <MessagesContext.Provider value={[state, dispatch]}>
            {children}
        </MessagesContext.Provider>
    )
}

export {MessagesContext, MessagesProvider}
