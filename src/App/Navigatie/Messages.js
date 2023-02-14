import {Fragment, useContext, useEffect, useState} from "react"
import {MessagesContext} from "../../Contexts/Messages"
import {DateTime} from "luxon"
import {doc, updateDoc} from "firebase/firestore"
import {db} from "../../Firebase/Firebase"

const Messages = ({showMessages, unread, USER_ID}) => {
    const [{messages}] = useContext(MessagesContext)
    const [showAll, setShowAll] = useState(false)
    const [filteredMessages, setFilteredMessages] = useState(null)

    const toggleMessageRead = async (id, read) => {
        if (read.includes(USER_ID)) {
            read = read.filter(o => o !== USER_ID)
        } else {
            read.push(USER_ID)
        }
        await updateDoc(doc(db, 'messages', id), {READ:read})
    }

    const markAllRead = async () => {
        if (messages && messages.list && messages.list.length > 0) {
            for (let m of messages.list) {
                let read = m.READ
                if (!m.READ.includes(USER_ID)) read.push(USER_ID)
                await updateDoc(doc(db, 'messages', m.ID), {READ:read})
            }
        }
        return true
    }

    useEffect(() => {
        if (messages && messages.list && messages.list.length > 0) {
            let toState
            if (showAll) toState = {...messages}
            else toState = {
                unread:messages.unread,
                unpushed:messages.unpushed,
                list:messages.list.filter(o => !o.READ.includes(USER_ID))
            }
            setFilteredMessages(toState)
        }
    }, [messages, showAll, USER_ID])

    return <div className={showMessages ? 'navigatie_messages' : 'navmenuhidden'}>
        <div className="navigatie_menu_table font_sans_normal">
            {/*<span className="navigatie_messages_message_toon_alle_berichten navigatie_imitatie_link"*/}
            {/*      onClick={() => setShowAll(!showAll)}>*/}
            {/*{showAll ?*/}
            {/*    <><i className="fa-regular fa-square-check"/> toon alle berichten</>*/}
            {/*    :*/}
            {/*    <><i className="fa-regular fa-square"/> toon alle berichten</>*/}
            {/*}*/}
            {/*</span><br/>*/}
            {/*<hr/>*/}
            {filteredMessages && filteredMessages.list && filteredMessages.list.map((m, i) =>
                <Fragment key={i}>
                    <span className="navigatie_messages_message_buttons navigatie_imitatie_link"
                          onClick={() => toggleMessageRead(m.ID, m.READ)}>
                            {m.READ.includes(USER_ID) ?
                                <i className="fa-regular fa-square-check"/>
                                :
                                <i className="fa-regular fa-square"/>
                            }
                    </span>
                    <span className="navigatie_messages_message_timestamp font_sans_bold">
                            {DateTime.fromMillis(m.TIMESTAMP).toRelative()}
                        </span><br/>
                    <span className="navigatie_messages_message_text font_serif_bold">
                            {m.TEXT}
                        </span>
                    <hr/>
                </Fragment>
            )}
            {!(filteredMessages && filteredMessages.list && filteredMessages.list.length > 0) &&
                <span className="navigatie_messages_message_text font_serif_bold">
                            <i>geen berichten</i>
                        </span>
            }
            {filteredMessages && filteredMessages.list && filteredMessages.list.length > 0 && unread &&
                <span className="navigatie_messages_message_markeer_alles_gelezen navigatie_imitatie_link"
                      onClick={() => markAllRead()}>
                markeer alles als gelezen
            </span>
            }
        </div>
    </div>

}

export default Messages