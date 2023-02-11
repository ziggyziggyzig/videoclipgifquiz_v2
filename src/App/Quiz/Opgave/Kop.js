import moment from "moment-timezone"
import {useContext} from "react"
import {ToonRondeContext} from "../../../Contexts/ToonRonde"

const Kop=({oudeRonde})=>{
    const [{toonRondeNummer,toonRondeData}]=useContext(ToonRondeContext)

    if (toonRondeNummer && toonRondeData) {
        return <>
            <h3 style={{marginBottom:'0.5em'}} className='font_sans_bold'>
                {toonRondeData.EPISODE === 1 && toonRondeData.SEASON > 1 && <><i
                    className="fa-solid fa-cake-candles prijs"
                    title="Verjaardagsronde"/>&nbsp;</>}
                {toonRondeData.bonus?'Bonusronde':'Ronde'}&nbsp;
                <span className="oranje" style={{fontSize:'1.2em'}}>
                    {toonRondeNummer}
                </span>
            </h3>
            <span className='font_serif_bold'><i>{moment(toonRondeData.start).format("dddd D MMMM YYYY [20:15u]")}</i></span>
            <i className='font_serif_normal'><br/>seizoen {toonRondeData.SEASON}, dag {toonRondeData.EPISODE}</i>
            {toonRondeData.toelichting &&
                <p className='font_serif_normal'>
                    {toonRondeData.toelichting}
                </p>
            }
            {oudeRonde &&
                <h4 className="oranje font_sans_bold">Let op: dit is een oude ronde. Je kan geen antwoord meer insturen.</h4>
            }
        </>
    }
    else {
        return null
    }
}

export default Kop