import {Link} from "react-router-dom"
import './Over.css'

const Over = () => {
    return <div className="over">
        <h3 className="font_sans_bold" style={{textAlign:'center'}}>
            Dit is <i>ziggy's videoclipgifquiz</i>.
        </h3>
        <table>
            <tbody>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-solid fa-tv"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Raad de clip!<br/>
                    Test je clipkennis door <b className="blauw">titel en artiest</b> te raden van het fragment dat je
                    ziet.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-regular fa-clock"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Elke dag om <b className="blauw">20.15 uur</b> begint een nieuwe ronde.<br/>
                    Je kan alleen een antwoord geven op de huidige ronde.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-regular fa-circle-user"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Je hebt een Twitter-, Google- of Mastodon-account nodig om mee te doen.<br/>
                    <ul>
                        <li><i className="fab fa-twitter oranje"/> twitter: klik op de website rechtsboven op <i
                            className="fas fa-user"/> en log in met je Twitter-account. Dan kan je onder de opgave je
                            antwoord insturen.
                        </li>
                        <li><i className="fab fa-google oranje"/> google: klik op de website rechtsboven op <i
                            className="fas fa-user"/> en log in met je Google-account. Dan kan je onder de opgave je
                            antwoord insturen.
                        </li>
                        <li><i className="fab fa-mastodon oranje"/> mastodon: stuur een <b
                            className="blauw">DM</b> naar <a href="https://mastodon.nl/@videoclipquiz"
                                                             target="_new">@videoclipquiz@mastodon.nl</a> met je
                            antwoord. Let erop dat de <b className="blauw">zichtbaarheid</b> van je bericht op "Direct
                            bericht" staat (<i
                                className="fa-solid fa-earth-americas"/> is fout, <i className="fa-solid fa-at"/> is
                            goed).
                        </li>
                    </ul>
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-solid fa-users-gear"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Log je in met een <b className="blauw">ander account</b> dan waarmee je eerder hebt gespeeld? Heb je
                    bijvoorbeeld eerder met Twitter antwoorden ingestuurd, maar gebruik je nu een Google- of een
                    Mastodonaccount?<br/>
                    Stuur me even een berichtje, dan kan ik je accounts samenvoegen.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-regular fa-comments"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Je krijgt <b className="blauw">altijd antwoord</b>, ook als je het fout hebt.<br/>
                    Als je alleen de titel of alleen de artiest goed hebt, hoef je die daarna niet meer in je antwoord
                    te zetten. Het antwoordapparaat onthoudt dat wel.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-solid fa-award"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Je kan <b className="blauw">niets winnen</b>, het gaat enkel om de eer. Wel kun je met bepaalde
                    prestaties in de statistiekenlijsten terecht komen.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-regular fa-circle-question"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    <b className="blauw">Meer weten</b>, vragen of suggesties?<br/>
                    Ik zit op Twitter onder gebruikersnaam <a href="https://twitter.com/videoclipquiz"
                                                              target="_new">@videoclipquiz</a>.
                    <br/>
                    Op Mastodon kun je me vinden op <a rel="me"
                                                       href="https://mastodon.nl/@videoclipquiz">@videoclipquiz@mastodon.nl</a>.<br/>
                    Of <Link to="/meta">klik hier</Link> voor meer informatie over de quiz, de site en mij.
                </td>
            </tr>
            <tr>
                <td className="overTableLeft">
                    <i className="fa-regular fa-thumbs-up"/>
                </td>
                <td className="font_serif_normal overTableRight">
                    Vind je de quiz leuk? Je kan me <b className="blauw">bedanken</b> met een kleine tegemoetkoming in
                    de serverkosten.<br/>
                    <Link to="/steun">Hier</Link> zie je hoe je dat kan doen.
                </td>
            </tr>
            </tbody>
        </table>
    </div>
}

export default Over