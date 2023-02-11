const Logo = ({url}) =>
    <>
    <span className="titel"><img src={url || ''} className="titellogo" alt="ZVGQ"
                                 title={`ziggy's videoclipgifquiz`} onClick={()=>window.location='/'}/></span><br/>
        <span className="scoretabelklein font_mono_normal">versie {require("../../../package.json").version}</span>
    </>

export default Logo