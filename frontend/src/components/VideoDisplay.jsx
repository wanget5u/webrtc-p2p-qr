import React, { useRef, useEffect } from "react";

const VideoPlayer = ({ stream, muted = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) return <div className="video-placeholder">Waiting...</div>;
    return <video ref={videoRef} autoPlay playsInline muted={muted} />;
};

export default VideoPlayer;