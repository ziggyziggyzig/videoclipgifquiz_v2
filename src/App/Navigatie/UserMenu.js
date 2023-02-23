import {useContext} from "react"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const UserMenu = ({showUserMenu, inloggen, uitloggen}) => {
    const [{currentUserData}] = useContext(CurrentUserContext)

    return <div className={showUserMenu ? 'navigatie_usermenu' : 'navmenuhidden'}>
        {currentUserData ?
            <table className="navigatie_menu_table font_sans_normal">
                <tbody>
                <tr>
                    <td>
                        {currentUserData.DISPLAYNAME || (currentUserData.TWITTER_HANDLE && `@${currentUserData.TWITTER_HANDLE}`) || currentUserData.GOOGLE_DISPLAYNAME || ''}
                    </td>
                    <td>
                        {currentUserData.TWITTER_UID && <i className="fab fa-twitter"/>}
                        {currentUserData.GOOGLE_UID === "google.com" && <i className="fab fa-google"/>}
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link" onClick={() => window.location = `/speler/${currentUserData.USER_ID}`}>
                    <td>
                        profiel
                    </td>
                    <td>
                        <i className="fa-regular fa-address-card"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link" onClick={() => uitloggen()}>
                    <td>
                        uitloggen
                    </td>
                    <td>
                        <i className="fa-solid fa-power-off"/>
                    </td>
                </tr>
                </tbody>
            </table>
            :
            <table className="navigatie_menu_table font_sans_normal">
                <tbody>
                <tr className="navigatie_imitatie_link" onClick={() => inloggen('twitter.com')}>
                    <td>
                        inloggen met twitter
                    </td>
                    <td>
                        <i className="fab fa-twitter"/>
                    </td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <hr/>
                    </td>
                </tr>
                <tr className="navigatie_imitatie_link" onClick={() => inloggen('google.com')}>
                    <td>
                        inloggen met google
                    </td>
                    <td>
                        <i className="fab fa-google"/>
                    </td>
                </tr>
                </tbody>
            </table>
        }
    </div>
}

export default UserMenu