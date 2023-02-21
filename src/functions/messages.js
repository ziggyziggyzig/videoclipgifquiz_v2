import {addDoc, collection} from "firebase/firestore"
import {db} from "../Firebase/Firebase"

const send_message = ({to_user_id, text, expiration = null}) =>
    new Promise(async (resolve) => {
        return resolve(
            await addDoc(collection(db, 'messages'), {
                FOR_USER_ID:to_user_id,
                PUSHED:false,
                READ:[],
                TIMESTAMP:Date.now(),
                TEXT:text,
                EXPIRES:expiration
            })
        )
    })

export {send_message}
