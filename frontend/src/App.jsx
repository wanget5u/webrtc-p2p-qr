import React, { useContext } from "react";
import { WebRTCProvider, WebRTCContext } from "./context/WebRTCContext";
import VideoPlayer from "./components/VideoDisplay";
import Controls from "./components/Controls";
import SignalArea from "./components/SignalArea";
import './style.css';

const AppContent = () => {
    const { stream, remoteStream, connected } = useContext(WebRTCContext);

    return (
        <div className="container">
            <h1 style={{ textAlign: "center" }}>WebRTC QR Video Chat</h1>

            <div className="video-container">
                <div className="video-column">
                    <h4>Your camera</h4>
                    <VideoPlayer stream={stream} muted={true} />
                </div>
                <div className="video-column">
                    <h4>Recipient camera</h4>
                    <VideoPlayer stream={remoteStream} />
                </div>
            </div>

            <div>{connected ? "Status: Connected" : "Status: Disconnected"}</div>

            <h5>Connection steps</h5>

            1. User A: click "Create OFFER", show QR code.{" "} <br/>

            2. User B: scan OFFER, paste the text into the "Remote signal"

            field, click "Accept OFFER and create ANSWER", show QR code.{" "} <br/>

            3. User A: scan ANSWER, paste text into the "Remote signal"

            field, click "Finish assemble (ANSWER)".{" "} <br/>

            <Controls />
            <SignalArea />
        </div>
    );
};

export default function App() {
    return (
        <WebRTCProvider>
            <AppContent />
        </WebRTCProvider>
    );
}