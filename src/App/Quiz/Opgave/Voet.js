import Invulding from "./Invulding"
import {useContext} from "react"
import {CurrentUserContext} from "../../../Contexts/CurrentUser"
import {ToonRondeContext} from "../../../Contexts/ToonRonde"
import {DateTime} from "luxon"

const Voet = ({clipData, oudeRonde}) => {

    const [{currentUserData}] = useContext(CurrentUserContext)
    const [{toonRondeData}] = useContext(ToonRondeContext)

    if (toonRondeData) {
        return <>
            {oudeRonde && clipData &&
                <>
                    <p className="font_serif_normal"
                       onClick={() => document.getElementById("antwoord").style.display = "block"}
                       style={{cursor:"pointer"}}>Klik hier om het antwoord op deze opgave te tonen</p>
                    <p className="font_serif_normal" id="antwoord" style={{display:"none"}}>Antwoord:<br/>
                        {toonRondeData.bonus && toonRondeData.antwoord ?
                            <>{toonRondeData.antwoord}</>
                            :
                            <>
                                {clipData.youtube ?
                                    <><a
                                        href={`https://www.youtube.com/watch?v=${clipData.youtube}`}
                                        target="_new">{clipData.artiest} - {clipData.titel}</a> ({clipData.jaar})</>
                                    :
                                    <>{clipData.artiest} - {clipData.titel}</>
                                }
                            </>
                        }
                    </p>
                </>
            }
            {!oudeRonde &&
                <>
                    <p className="font_serif_normal"><span className="rood">Waarschijnlijk werkt het antwoordapparaat via Twitter binnenkort niet meer.</span><br/>
                        Verstuur je antwoord via Mastodon
                        {currentUserData ?
                            <>, of via onderstaand invulding.<br/>Je krijgt bevestiging onder het invulding.</> :
                            <> of klik rechtsboven op het poppetje om in te loggen. Je kan dan via de website je
                                antwoord
                                insturen.</>
                        }
                    </p>
                    {currentUserData && currentUserData.USER_ID && <Invulding/>}
                    <p className="font_serif_normal opgave_voet_sluitdatum"><i>insturen kan
                        tot {DateTime.fromMillis(toonRondeData.TIMESTAMP_END).toFormat("DDDD T' uur'")}.</i></p>
                </>
            }
        </>
    } else return null
}

export default Voet