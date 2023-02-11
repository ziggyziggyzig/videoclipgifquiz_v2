import {useState} from "react"

const Hints = ({hints}) => {
    const [showHints,setShowHints]=useState(false)

    return <>
        <p className="oranje" style={{cursor:'pointer', marginBottom:0}}
           onClick={() => setShowHints(!showHints)}>Bij deze
            opgave {hints.length === 1 ? <>is een hint</> : <>zijn hints</>} gegeven. Klik hier om
            deze te tonen.</p>
        <ul style={{display:showHints ? "inline-block" : "none"}}>
            {hints.map(h =>
                <li key={`hint${h.order}`} style={{textAlign:'left'}}>"{h.hint}"</li>
            )}
        </ul>
    </>
}

export default Hints