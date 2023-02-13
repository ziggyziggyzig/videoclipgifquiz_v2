import {Fragment, useContext, useEffect, useState} from "react"
import {MessagesContext} from "../../Contexts/Messages"
import {DateTime} from "luxon"
import {doc, updateDoc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Messages = ({showMessages}) => {
    const [{messages}] = useContext(MessagesContext)
    const [showAll,setShowAll]=useState(false)
    const [filteredMessages,setFilteredMessages]=useState(null)

    const toggleMessageRead=async (id, status) => {
        await updateDoc(doc(db, 'messages', id), {READ:status})
    }

    useEffect(()=>{
        if (messages && messages.list && messages.list.length>0) {
            let toState
            if (showAll) toState = {...messages}
            else toState = {
                unread:messages.unread,
                unpushed:messages.unpushed,
                list:messages.list.filter(o=>o.READ===false)
            }
            setFilteredMessages(toState)
        }
    },[messages,showAll])

    return <div className={showMessages ? 'navigatie_messages' : 'navmenuhidden'}>
        <div className="navigatie_menu_table font_sans_normal">
            <span className='navigatie_messages_message_toon_alle_berichten navigatie_imitatie_link'  onClick={()=>setShowAll(!showAll)}>
            {showAll ?
                <><i className="fa-regular fa-square-check"/> toon alle berichten</>
                :
                <><i className="fa-regular fa-square"/> toon alle berichten</>
            }
            </span>
            <hr/>
            {filteredMessages && filteredMessages.list && filteredMessages.list.map((m, i) =>
                <Fragment key={i}>
                    <span className='navigatie_messages_message_buttons navigatie_imitatie_link'
                          onClick={()=>toggleMessageRead(m.ID,!m.READ)}>
                            {m.READ ?
                                <i className="fa-regular fa-square-check"/>
                                :
                                <i className="fa-regular fa-square"/>
                            }
                    </span>
                        <span className='navigatie_messages_message_timestamp font_sans_bold'>
                            {/*{new Date(m.TIMESTAMP).toLocaleString()}*/}
                            {DateTime.fromMillis(m.TIMESTAMP).toRelative()}
                        </span><br/>
                        <span className='navigatie_messages_message_text font_serif_bold'>
                            {m.TEXT}
                        </span>
                            <hr/>
                </Fragment>
            )}
            {filteredMessages && ((filteredMessages.list && filteredMessages.list.length === 0) || !filteredMessages.list) &&
                <span className='navigatie_messages_message_text font_serif_bold'>
                            <i>geen berichten</i>
                        </span>
            }
        </div>
    </div>

}

export default Messages