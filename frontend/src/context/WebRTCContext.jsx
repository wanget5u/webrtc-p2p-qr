import React, { createContext, useState, useRef, useEffect } from "react";
import Peer from "simple-peer/simplepeer.min.js";
import useMediaStream from "../hooks/useMediaStream";
import { decompressSignal } from "../functions/signalUtils";

export const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
    const stream = useMediaStream();
    const connectionRef = useRef();

    const [localSignal, setLocalSignal] = useState("");
    const [remoteSignal, setRemoteSignal] = useState("");
    const [remoteStream, setRemoteStream] = useState(null);
    const [connected, setConnected] = useState(false);
    const [isInitiator, setIsInitiator] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sdp = params.get("sdp");
        if (sdp) setRemoteSignal(decodeURIComponent(sdp));
    }, []);

    const peerSetup = (peer) => {
        peer.on("signal", (data) => setLocalSignal(JSON.stringify(data)));
        peer.on("stream", (stream) => setRemoteStream(stream));
        peer.on("connect", () => setConnected(true));
        peer.on("error", (err) => console.error("Peer error:", err));
        connectionRef.current = peer;
    };

    const createOffer = () => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peerSetup(peer);
        setIsInitiator(true);
    };

    const acceptOfferAndCreateAnswer = () => {
        if (!remoteSignal) return;
        const decoded = JSON.parse(decompressSignal(remoteSignal));
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peerSetup(peer);
        peer.signal(decoded);
        setIsInitiator(false);
    };

    const finishHandshake = () => {
        if (!remoteSignal || !connectionRef.current) return;
        const decoded = JSON.parse(decompressSignal(remoteSignal));
        connectionRef.current.signal(decoded);
    };

    const leaveCall = () => {
        if (connectionRef.current) connectionRef.current.destroy();
        connectionRef.current = null;
        setConnected(false);
        setRemoteStream(null);
        setIsInitiator(null);
        setLocalSignal("");
        setRemoteSignal("");
        window.history.replaceState({}, document.title, window.location.pathname);
    };

    return (
        <WebRTCContext.Provider value={{
            stream, remoteStream, connected, isInitiator,
            localSignal, remoteSignal, setRemoteSignal,
            createOffer, acceptOfferAndCreateAnswer, finishHandshake, leaveCall
        }}>
            {children}
        </WebRTCContext.Provider>
    );
}