import {useContext} from "react"
import {HuidigeRondeContext} from "../../Contexts/HuidigeRonde"
import {ToonRondeContext} from "../../Contexts/ToonRonde"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const Menu = ({showMenu}) => {
    const [{huidigeRondeNummer}] = useContext(HuidigeRondeContext)
    const [{toonRondeNummer}] = useContext(ToonRondeContext)
    const [{currentUserData}] = useContext(CurrentUserContext)

    return huidigeRondeNummer &&
        <div className={showMenu ? 'navigatie_menu' : 'navmenuhidden'}>
            <table className="navigatie_menu_table font_sans_normal">
                <tbody>
                <tr className="navigatie_imitatie_link" onClick={() => window.location = '/'}>
                    <td>
                        huidige ronde
                    </td>
                    <td>
                        <i className={`fas fa-home`} title="huidige ronde"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className={!toonRondeNummer || (toonRondeNummer && toonRondeNummer <= 1) ? 'navigatie_imitatie_link_disabled' : 'navigatie_imitatie_link'}
                    onClick={toonRondeNummer > 1 ? () => window.location = `/ronde/${toonRondeNummer - 1}` : null}
                >
                    <td>
                        vorige ronde
                    </td>
                    <td>
                        <i className={`far fa-circle-left`} title="vorige ronde"/>
                    </td>
                </tr>
                <tr className={toonRondeNummer < huidigeRondeNummer ? 'navigatie_imitatie_link' : 'navigatie_imitatie_link_disabled'}
                    onClick={toonRondeNummer < huidigeRondeNummer ? () => window.location = `/ronde/${toonRondeNummer + 1}` : null}
                >
                    <td>
                        volgende ronde
                    </td>
                    <td>
                        <i className={`far fa-circle-right`} title="volgende ronde"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link"
                    onClick={() => window.location = `/ronde/${Math.floor(Math.random() * (huidigeRondeNummer)) + 1}`}
                >
                    <td>
                        willekeurige ronde
                    </td>
                    <td>
                        <i className={`fas fa-shuffle`} title="willekeurige ronde"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link_disabled">
                    <td>
                        statistieken
                    </td>
                    <td>
                        <i className={`fas fa-chart-line`} title="statistieken"/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link"
                    onClick={() => window.location = `/overzichten`}>
                    <td>
                        overzichten
                    </td>
                    <td>
                        <i className={`fas fa-list`} title="overzichten"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link" onClick={() => window.location = `/meta`}>
                    <td>
                        over de quiz
                    </td>
                    <td>
                        <i className={`far fa-circle-question`} title="over de quiz"/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link" onClick={() => window.location = `/steun`}>
                    <td>
                        steun de quiz
                    </td>
                    <td>
                        <i className={`far fa-thumbs-up`} title="steun de quiz"/>
                    </td>
                </tr>
                {currentUserData.OWN_ACCOUNT &&
                    <>
                        <tr>
                            <td colSpan={2}>
                                <hr/>
                            </td>
                        </tr>
                        <tr className="navigatie_imitatie_link" onClick={() => window.location = `/admin`}>
                            <td>
                                beheer
                            </td>
                            <td>
                                <i className={`fa-solid fa-screwdriver-wrench`} title="beheer"/>
                            </td>
                        </tr>
                    </>
                }
                </tbody>
            </table>
        </div>
}

export default Menu