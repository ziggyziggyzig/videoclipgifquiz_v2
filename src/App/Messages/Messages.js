import {useContext, useEffect} from "react"
import {MessagesContext} from "../../Contexts/Messages"
import {getToken} from 'firebase/messaging'
import {messaging} from "../../Firebase/Firebase"

const Messages=()=>{
    const [{messages}]=useContext(MessagesContext)


    useEffect(()=>{
        const go=async () => {
            let currentToken = await getToken(messaging, {vapidKey:'BIBKNoqHpMr4eWYH01xruHziS0Z_FsinCwV2cti_Eftr5AvsvRUJ6PWxCdUS16q0V10IO3tUviJfnbWcNt5Ynuo'})
            if (currentToken) {
                console.log(currentToken)
            } else {
                console.log('ask permission')
            }
        }

        go()
    },[])

    return null
}

export default Messages

// BIBKNoqHpMr4eWYH01xruHziS0Z_FsinCwV2cti_Eftr5AvsvRUJ6PWxCdUS16q0V10IO3tUviJfnbWcNt5Ynuo