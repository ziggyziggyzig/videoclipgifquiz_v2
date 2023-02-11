import {useEffect, useState} from "react"
import {getDownloadURL, ref} from "firebase/storage"
import {storage} from "../../Firebase/Firebase"

import ('./Steun.css')

const Steun = () => {
    const [payPalImage, setPayPalImage] = useState(null)

    useEffect(() => {
        const fetchHeader = async () =>
            setPayPalImage(await getDownloadURL(ref(storage, `assets/donate-with-paypal-transparent.png`)))

        fetchHeader()
    }, [])


    return <div className="steun">
        <h2 className="font_sans_normal">
            Steun de videoclipgifquiz
        </h2>
        <div className="steun_grid_container">
            <Links>
                <i className="fa-regular fa-circle-question"/>
            </Links>
            <Rechts className="font_serif_normal">
                <a href="https://www.paypal.com/donate/?business=356C68SSMN7VG&no_recurring=0&currency_code=EUR"
                   target="_new">
                    <img src={payPalImage} width={250} alt="Doneer met PayPal" className="steun_image"/>
                </a>
                Vind je de videoclipgifquiz <b>leuk</b>? Overweeg dan een financiële ondersteuning. <b>Vermeld wel je
                gebruikersnaam</b>, zodat ik je een icoontje kan geven.
            </Rechts>
            <Links><i className="fa-solid fa-sack-dollar"/></Links>
            <Rechts className="font_serif_normal">
                Deze quiz is een <b>hobbyproject</b>. Hoewel ik hem heb gemaakt uit liefde voor de muziek en het plezier
                van het quizzen, is het draaien van deze quiz niet zonder kosten.<br/>
                Hosting van de site kost geld, het draaien van de achterliggende processen (zoals het antwoordapparaat)
                ook.<br/>
                We praten niet over honderden euro's, maar de quiz groeit, het aantal opgeslagen gegevens groeit en
                daarmee lopen de maandelijkse kosten inmiddels ook al in de tientallen euro's. Geen ramp, maar het is
                wel geld.
            </Rechts>
            <Links>
                <i className="fa-regular fa-thumbs-up"/>
            </Links>
            <Rechts className="font_serif_normal">
                Daarom ben je van harte welkom om een kleine financiële bijdrage te doen om je <b>waardering</b> uit te
                spreken over de quiz.<br/>
                Dat kun je doen via de PayPal-knop die hier rechtsboven staat. Hiervoor heb je wel een PayPal-account
                nodig. Dat is gratis en kan zonder creditcard.<br/>
                <b>Vermeld wel even je gebruikersnaam</b>, zodat ik je een icoontje kan geven.<br/>
                Andere betaalmethodes of abonnementsvormen ben ik nog aan het onderzoeken, maar voor de meeste opties
                heb je een zakelijke bankrekening nodig en een KvK-inschrijving, wat een beetje overdreven is voor een
                hobbyproject.
            </Rechts>
            <Links>
                <i className="fa-solid fa-handshake-angle"/>
            </Links>
            <Rechts className="font_serif_normal">
                Een bijdrage is vrijwillig en <b>de quiz is en blijft gratis</b>!<br/>
                Je krijgt geen voordelen of voorrang bij het raden van de clips.<br/>
                Wel krijg je, als bedankje, een <b>speciaal icoontje</b> achter je naam. Als je dat niet wilt, laat het
                me dan even weten.
            </Rechts>
        </div>
    </div>
}

const Links = ({list, children}) => <div
    className={`steun_griditem_links font_sans_bold ${list || undefined}`}>{children}</div>
const Rechts = ({list, children}) => <div
    className={`steun_griditem_rechts font_sans_normal ${list || undefined}`}>{children}</div>

export default Steun