import { useState, useEffect } from "react";

const useMediaStream = () => {
    const [stream, setStream] = useState(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((localStream) => {
                setStream(localStream)
            })
            .catch((error) => {
                console.error("getUserMedia error:", error);
            });
    }, []);

    return stream;
};

export default useMediaStream;