import {adminFunctions} from "../../Firebase/Firebase"
import {useContext} from "react"
import {CurrentUserContext} from "../../Contexts/CurrentUser"

const Cycles = () => {
    const [{currentUserData}] = useContext(CurrentUserContext)

    const forceCycle = async (mode) => {
        let zekerweten = window.confirm(`cycle ${mode} uitvoeren?`)
        if (zekerweten) {
            await adminFunctions({
                context:'cycle',
                action:'run',
                content:{
                    mode:mode
                },
                user:currentUserData.AUTH_UID[0]
            })
        }
        return true
    }

    return <div>
        <table className="font_sans_normal admin_tabel admin_cycle_tabel">
            <thead>
            <tr>
                <td style={{width:'auto'}}/>
                <td>clean</td>
                <td>02</td>
                <td>03</td>
                <td>19</td>
                <td>20</td>
                <td>21</td>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>ronde correct_first</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>ronde correct_last</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>ronde speed_first</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>ronde speed_last</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>ronde correct_count</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>ronde bron_count</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>ronde medium_count</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user correct_last</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user correct_count</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user fast_five</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user slow_five</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user series_list</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>user years_list</td>
                <td/>
                <td/>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>user bron_count</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user medium_count</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td>user win_list</td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
            </tr>
            <tr>
                <td>global years</td>
                <td/>
                <td/>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>global artiesten</td>
                <td/>
                <td/>
                <td/>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
            </tr>
            <tr>
                <td>global stats</td>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td><i className="fa-regular fa-circle-check"/></td>
            </tr>
            <tr>
                <td>inzendingen speeds</td>
                <td/>
                <td><i className="fa-regular fa-circle-check"/></td>
                <td/>
                <td/>
                <td/>
                <td/>
            </tr>
            <tr>
                <td/>
                <td><input type="button" onClick={()=>forceCycle(1)} value="run 01"/></td>
                <td><input type="button" onClick={()=>forceCycle(2)} value="run 02"/></td>
                <td><input type="button" onClick={()=>forceCycle(3)} value="run 03"/></td>
                <td><input type="button" onClick={()=>forceCycle(19)} value="run 19"/></td>
                <td><input type="button" onClick={()=>forceCycle(20)} value="run 20"/></td>
                <td><input type="button" onClick={()=>forceCycle(21)} value="run 21"/></td>
            </tr>
            </tbody>
        </table>
    </div>
}

export default Cycles