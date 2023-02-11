import {antwoordVanWebsite_v2} from "../../../Firebase/Firebase"
import {useContext, useState} from "react"
import {CurrentUserContext} from "../../../Contexts/CurrentUser"

const Invulding = () => {
    const [antwoord, setAntwoord] = useState("")
    const [antwoordRetourTekst, setAntwoordRetourTekst] = useState(null)
    const [antwoordRetourKleur, setAntwoordRetourKleur] = useState("orange")
    const [{currentUserData}] = useContext(CurrentUserContext)

    const verwijder_accenten = (str) =>
        str.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z\s])/g, '')

    const verstuurAntwoord = async (e) => {
        e.preventDefault()
        setAntwoordRetourTekst("een momentje geduld...")
        setAntwoordRetourKleur("orange")
        if (antwoord.length > 0) {
            let bericht = {USER_ID:currentUserData.USER_ID, PROVIDER: currentUserData.PROVIDER, TEKST:antwoord}
            let retour = await antwoordVanWebsite_v2(bericht)
            console.log(retour)
            if (retour.data.status === "error" || retour.data.status === "repeat") {
                setAntwoordRetourKleur("red")
            }
            setAntwoordRetourTekst(retour.data.tekst)
            setAntwoord("")
        }
        return true
    }

    const antwoordVeranderd = (event) => {
        setAntwoord(verwijder_accenten(event.target.value))
        return true
    }

    return (
        <form onSubmit={verstuurAntwoord}>
            <p>
                <input type="text" className="opgave_invulding_tekstveld font_mono_normal" value={antwoord}
                       onChange={(e) => antwoordVeranderd(e)} autoFocus={true}/>
                <input type="submit" value="verstuur" className="opgave_invulding_knop font_sans_bold"/>
            </p>
            <p>
                <span style={{color:`--var(${antwoordRetourKleur}`}}
                      className={`${antwoordRetourTekst ? 'opgave_invulding_retour' : 'opgave_invulding_retour_inactief'} font_sans_normal`}>{antwoordRetourTekst}</span>
            </p>
        </form>
    )

}

export default Invulding