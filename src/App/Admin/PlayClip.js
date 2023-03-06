import {useEffect, useState} from "react"
import {getDownloadURL, ref} from "firebase/storage"
import {storage} from "../../Firebase/Firebase"


const PlayClip = ({clip, onHide}) => {
    const [clipUrl, setClipUrl] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            if (clip !== "") {
                setClipUrl(await getDownloadURL(ref(storage, `clips/${clip}.gif`)))
            } else {
                setClipUrl("")
            }
        }

        fetchData().then(() => true)
    }, [clip])

    return (
        <div className="clip" onClick={() => onHide()}>
            {clipUrl !== "" &&
                <img src={String(clipUrl)} alt={''}/>}
        </div>
    )
}

export default PlayClip