import Loading from "../../Loading/Loading"

const Gif = ({url}) => {
    if (url) {
        return (
            <p>
                {url ? <img src={url} alt="Bewegende GIF uit een videoclip" style={{maxWidth:'90%'}}/> : <Loading/>}
            </p>
        )
    } else return null
}

export default Gif