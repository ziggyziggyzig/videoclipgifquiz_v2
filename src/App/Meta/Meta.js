import "./Meta.css"
import {Link} from "react-router-dom"
import {useEffect} from "react"

const Meta = ({setLoadAll}) => {
    useEffect(()=>{
        setLoadAll()
    },[setLoadAll])


    return <div className="meta">
        <h2 className="font_sans_bold">
            Dit is <i>ziggy's videoclipgifquiz</i>.
        </h2>
        <div className="meta_grid_container">
            <Links>
                <i className="fa-solid fa-tv"/>
            </Links>
            <Rechts>
                Raad de clip!<br/>
                Test je clipkennis door <b className="blauw">titel en artiest</b> te raden van het fragment dat je ziet.
            </Rechts>
            <Links>
                <i className="fa-regular fa-clock"/>
            </Links>
            <Rechts>
                Elke dag om <b className="blauw">20.15 uur</b> begint een nieuwe ronde.<br/>
                Je kan alleen een antwoord geven op de huidige ronde.
            </Rechts>
            <Links>
                <i className="fa-regular fa-circle-user"/>
            </Links>
            <Rechts>
                Op dit moment kun je meedoen met een <b className="blauw">Twitter-</b>, een <b
                className="blauw">Google-</b> of een <b className="blauw">Mastodon-account</b>.<br/>
                Klik rechtsboven op het poppetje en log in met Twitter of Google. Dan kan je direct op de website, met
                het invulveld onder de
                opgave, je antwoord insturen.<br/>
                Je kan ook op Mastodon een DM met je antwoord sturen naar <a href="https://mastodon.nl/@videoclipquiz"
                                                                             target="_new">@videoclipquiz@mastodon.nl</a>.
                Let daar goed op dat de <b className="blauw">zichtbaarheid</b> van je bericht op "Direct bericht" staat
                (<i className="fa-solid fa-earth-americas"/> is fout, <i className="fa-solid fa-at"/> is goed).
            </Rechts>
            <Links>
                <i className="fa-regular fa-comments"/>
            </Links>
            <Rechts>
                Je krijgt <b className="blauw">altijd antwoord</b> waar je je antwoord hebt ingestuurd. Stuur je in via
                DM, dan krijg je een DM terug. Op de website krijg je antwoord onder het invulding.<br/>
                Als je alleen de titel of alleen de artiest goed hebt, hoef je die daarna niet meer in je antwoord te
                zetten. Het antwoordapparaat onthoudt dat wel.
            </Rechts>
            <Links>
                <i className="fa-solid fa-users-gear"/>
            </Links>
            <Rechts>
                Log je in met een <b className="blauw">ander account</b> dan waarmee je eerder hebt gespeeld? Heb je
                bijvoorbeeld eerder met Twitter antwoorden ingestuurd, maar gebruik je nu een Google- of een
                Mastodonaccount?<br/>
                Stuur me even een berichtje, dan kan ik je accounts samenvoegen.
            </Rechts>
            <Links>
                <i className="fa-solid fa-award"/>
            </Links>
            <Rechts>
                Je kan <b className="blauw">niets winnen</b>, het gaat enkel om de eer. Wel kun je met bepaalde
                prestaties in de
                statistiekenlijsten terecht komen.
            </Rechts>
            <Links>
                <i className="fa-regular fa-circle-question"/>
            </Links>
            <Rechts>
                <b className="blauw">Meer weten</b>, vragen of suggesties?<br/>
                Ik zit op Twitter onder gebruikersnaam <a href="https://twitter.com/videoclipquiz"
                                                          target="_new">@videoclipquiz</a>.
                <br/>
                Op Mastodon kun je me vinden op <a rel="me"
                                                   href="https://mastodon.nl/@videoclipquiz">@videoclipquiz@mastodon.nl</a>.<br/>
            </Rechts>
            <Links>
                <i className="fa-regular fa-thumbs-up"/>
            </Links>
            <Rechts>
                Vind je de quiz leuk? Je kan me <b className="blauw">bedanken</b> met een kleine tegemoetkoming in de
                serverkosten.<br/>
                <Link to="/steun">Hier</Link> zie je hoe je dat kan doen.
            </Rechts>
            <Breed>
                <h2 className="font_sans_bold">
                    Over de quiz en de maker
                </h2>
            </Breed>
            <Links>
                <i className="fa-solid fa-landmark"/>
            </Links>
            <Rechts>
                De <b className="blauw">videoclipgifquiz</b> is een vervolg van de <a href="https://outroquiz.nl"
                                                                                      target="_new">outroquiz</a>, die
                gedurende de jaren
                2017 en 2018 je kennis van outro's testte. De geschikte outro's raakten op, dus na 730 rondes was het
                tijd om de quiz op te doeken.
            </Rechts>
            <Links>
                <i className="fa-solid fa-computer"/>
            </Links>
            <Rechts>
                Deze quiz is een <b className="blauw">hobbyproject</b> en volledig <i>from scratch</i> geschreven en
                geprogrammeerd. De
                frontend is geschreven in React, de backend in NodeJS en de hele toko draait op Firebase van Google.
            </Rechts>
            <Links>
                <i className="fa-regular fa-face-grin"/>
            </Links>
            <Rechts>
                Ik ben <b className="blauw">Wouter</b>, bouwjaar 1976. Ik woon in Groningen, heb drie zoons en ben
                treindienstleider. In
                mijn vrije tijd maak ik websites, luister ik veel muziek, loop ik hard en ben ik marshal op het
                TT-circuit van Assen.
            </Rechts>
            <Links>
                <i className="fa-solid fa-sitemap"/>
            </Links>
            <Rechts>
                Andere <b className="blauw">websites</b> die ik heb gebouwd:<br/>
                <ul>
                    <li><a href="https://regenrace.nl" target="_new">regenrace</a>, een buienradar voor Formule 1,
                        MotoGP en andere raceseries
                    </li>
                    <li><a href="https://fullwet.com" target="_new">fullwet</a>, de Engelstalige versie van regenrace.nl
                    </li>
                    <li><a href="https://blekejet.nl" target="_new">blekejet</a>, gewijd aan het iconische nummer <b
                        className="blauw">Achter
                        Glas</b> van de Tröckener Kecks
                    </li>
                    <li><a href="https://tis3.nl" target="_new">tis3</a>, een volledig overzicht van spoorwegongelukken
                        in Nederland
                    </li>
                    <li><a href="https://outroquiz.nl" target="_new">outroquiz</a>, een voormalige quiz met outro's</li>
                    <li><a href="https://penaltypoints.fullwet.com" target="_new">penaltypoints</a>, waarop ik de
                        strafpunten van de Formule 1-coureurs bijhoud
                    </li>
                </ul>
            </Rechts>

        </div>
    </div>
}

const Links = ({list, children}) => <div
    className={`meta_griditem_links ${list || undefined}`}>{children}</div>
const Rechts = ({list, children}) => <div
    className={`meta_griditem_rechts font_sans_normal ${list || undefined}`}>{children}</div>
export const Breed = ({children}) => <div className="meta_griditem_breed font_sans_normal">{children}</div>

export default Meta