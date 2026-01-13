import React, { useContext, useState } from "react";
import QRCode from "react-qr-code";
import { WebRTCContext } from "../context/WebRTCContext";
import { generateShareUrl, compressSignal, extractSdpFromUrl } from "../functions/signalUtils";

const SignalArea = () => {
    const { localSignal, remoteSignal, setRemoteSignal } = useContext(WebRTCContext);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(compressSignal(localSignal)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        });
    };

    return (
        <div className="signals">
            <div className="signal-block">
                <h4>Your Signal</h4>
                {localSignal && (
                    <>
                        <QRCode value={generateShareUrl(localSignal)} size={450} />

                        <button onClick={handleCopy}>{copied ? "Copied" : "Copy Code"}</button>
                    </>
                )}
            </div>
            <div className="signal-block">
                <h4>Remote Signal</h4>
                <textarea
                    value={remoteSignal}
                    onChange={(e) => setRemoteSignal(extractSdpFromUrl(e.target.value))}
                    placeholder="Paste Signal Here"
                />
            </div>
        </div>
    );
};

export default SignalArea;