import React, { useContext } from "react";
import { WebRTCContext } from "../context/WebRTCContext";

const Controls = () => {
    const {
        stream, remoteSignal, connected, isInitiator, connectionRef,
        createOffer, acceptOfferAndCreateAnswer, finishHandshake, leaveCall
    } = useContext(WebRTCContext);

    return (
        <div className="controls">
            <div className="buttons">
                <button onClick={createOffer} disabled={!stream || isInitiator === false || connected}>
                    Create OFFER (User A)
                </button>
                <button onClick={acceptOfferAndCreateAnswer} disabled={!stream || !remoteSignal || isInitiator === true || connected}>
                    Accept OFFER (User B)
                </button>
                <button onClick={finishHandshake} disabled={!isInitiator || !remoteSignal || connected}>
                    Finish Handshake (User A)
                </button>
                <button onClick={leaveCall} disabled={!connected}>End call</button>
            </div>
        </div>
    );
};

export default Controls;