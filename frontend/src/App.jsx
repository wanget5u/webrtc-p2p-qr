import './style.css'
import React, {useEffect, useRef, useState} from "react";
import Peer from "simple-peer/simplepeer.min.js";
import pako from "pako";
import QRCode from "react-qr-code";

function App()
{
    const [ stream, setStream ] = useState("");

    const myVideo = useRef(null);
    const otherUserVideo = useRef(null);
    const connectionRef = useRef();

    const [isInitiator, setIsInitiator] = useState(null);
    const [localSignal, setLocalSignal] = useState("");
    const [remoteSignal, setRemoteSignal] = useState("");
    const [hasRemoteSignal, setHasRemoteSignal] = useState(false);
    const [connected, setConnected] = useState(false);

    const [copied, setCopied] = useState(false);

    useEffect(() =>
    {
        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then((localStream) =>
            {
                setStream(localStream);

                if (myVideo.current)
                {myVideo.current.srcObject = localStream;}
            })
            .catch((error) =>
            {console.error("getUserMedia error:", error);});
    }, []);

    useEffect(() =>
    {
        if (myVideo.current && stream)
        {myVideo.current.srcObject = stream;}
    }, [stream]);

    const peerSetup = (peer) =>
    {
        try
        {
            peer.on("signal", (data) =>
            {
                setLocalSignal(JSON.stringify(data));
            });

            peer.on("stream", (remoteStream) =>
            {
                if (otherUserVideo.current)
                {otherUserVideo.current.srcObject = remoteStream;}
            });

            peer.on("connect", () =>
            {
                setConnected(true);
            });

            peer.on("error", (error) =>
            {
                console.error("Peer error:", error);
            });

            connectionRef.current = peer;
        }
        catch (error)
        {console.error("peerSetup error:", error);}
    }

    const createOffer = () =>
    {
        if (!stream) return;

        const peer = new Peer(
            {
                initiator: true,
                trickle: false,
                stream: stream
            });

        peerSetup(peer);
        setIsInitiator(true);
    }

    const acceptOfferAndCreateAnswer = () =>
    {
      if (!stream || !remoteSignal) return;

      let remote;
      try
      {
          const cleanedRemoteSignal = remoteSignal.trim();
          const jsonString = decompressSignal(cleanedRemoteSignal);
          if (!jsonString)
          {
              console.error("acceptOfferAndCreateAnswer: Decompressed signal is empty.");
              return;
          }
          remote = JSON.parse(jsonString.toString());
      }
      catch (error)
      {
          console.error("acceptOfferAndCreateAnswer json error:", error);
          return;
      }

      const peer = new Peer(
          {
             initiator: false,
             trickle: false,
             stream: stream
          });

      peerSetup(peer);
      peer.signal(remote);
      setIsInitiator(false);
    };

    const finishHandshakeWithAnswer = () =>
    {
        if (!connectionRef.current || !remoteSignal) return;

        let remote;
        try
        {
            const cleanedRemoteSignal = remoteSignal.trim();
            const jsonString = decompressSignal(cleanedRemoteSignal);
            if (!jsonString)
            {
                console.error("finishHandshakeWithAnswer: Decompressed signal is empty.");
                return;
            }
            remote = JSON.parse(jsonString.toString());
        }
        catch (error)
        {
            console.error("finishHandshakeWithAnswer json error:", error);
            return;
        }

        connectionRef.current.signal(remote);
    };

    const leaveCall = () =>
    {
        try
        {
            if (connectionRef.current)
            {
                connectionRef.current.destroy();
                connectionRef.current = null;
            }

            setConnected(false);
            setIsInitiator(null);
            setLocalSignal("");
            setRemoteSignal("");
            setHasRemoteSignal(false);

            if (otherUserVideo.current)
            {otherUserVideo.current.srcObject = null;}
        }
        catch (error)
        {console.error("leaveCall error:", error);}
    };

    const compressSignal = (str) =>
    {
        try
        {
            const compressed = pako.deflate(str);
            return btoa(String.fromCharCode(...compressed));
        }
        catch (error)
        {console.error("compressSignal error:", error);}
    };

    const decompressSignal = (b64) =>
    {
        try
        {
            const binary = atob(b64);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            return pako.inflate(bytes, {to: "string"});
        }
        catch (error)
        {
            console.error("decompressSignal error:", error);
            return ""
        }
    };

    const createShareUrl = () =>
    {
        try
        {
            if (!localSignal) return "";
            const compressed = compressSignal(localSignal);
            const encoded = encodeURIComponent(compressed);
            return `${window.location.origin}?sdp=${encoded}`;
        }
        catch (error)
        {console.error("createShareUrl error:", error);}
    };

    useEffect(() =>
    {
        try
        {
            const params = new URLSearchParams(window.location.search);
            const sdp = params.get("sdp");

            if (sdp)
            {
                const raw = decodeURIComponent(sdp);
                setRemoteSignal(raw);
                setHasRemoteSignal(true);
            }
        }
        catch (error)
        {console.error("sdp error:", error);}
    }, []);

    const handleCopy = () =>
    {
        if (!localSignal) return;
        navigator.clipboard.writeText(compressSignal(localSignal)).then(() =>
        {
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        });
    };

    return (
        <div className="wrapper">
            <div className="container">

                <h1 style={{ textAlign: "center" }}>WebRTC QR Video Chat</h1>

                <div className="video-container">
                    <div className="video-column">

                        <h4>Your camera</h4>

                        <div className="video">
                            {stream && (
                                <video
                                    muted
                                    playsInline
                                    autoPlay
                                    ref={myVideo}
                                    style={{ width: "400px" }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="video-column">

                        <h4>Recipient camera</h4>

                        <div className="video">
                            {connected && (
                                <video
                                    playsInline
                                    autoPlay
                                    ref={otherUserVideo}
                                    style={{ width: "400px" }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="controls">

                    <h5>Connection steps</h5>

                    1. User A: click "Create OFFER", show QR code.{" "} <br/>
                    2. User B: scan OFFER, paste the text into the "Remote signal"
                    field, click "Accept OFFER and create ANSWER", show QR code.{" "} <br/>
                    3. User A: scan ANSWER, paste text into the "Remote signal"
                    field, click "Finish assemble (ANSWER)".{" "} <br/>

                    <div className="buttons">
                        <button onClick={createOffer} disabled={!stream || isInitiator === false || connected}>
                            Create OFFER (User A)
                        </button>

                        <button onClick={acceptOfferAndCreateAnswer}
                                disabled={!stream || !remoteSignal || isInitiator === true || connected}>
                            Accept OFFER and create ANSWER (User B)
                        </button>

                        <button onClick={finishHandshakeWithAnswer}
                                disabled={!connectionRef.current || !remoteSignal || isInitiator !== true || connected}>
                            Finish assemble (ANSWER on A)
                        </button>

                        <button onClick={leaveCall} disabled={!connectionRef.current}>
                            End call
                        </button>
                    </div>
                </div>

                <div className="signals">
                    <div className="signal-block">

                        <h4>Your local signal (OFFER/ANSWER)</h4>

                        {localSignal && (
                            <>
                                <p>QR for share to other user:</p>

                                <QRCode value={compressSignal(localSignal)} size={200} />

                                <div style={{ margin: "10px 0" }}>
                                    <button className="copy-btn" onClick={handleCopy}>
                                        {copied ? "Copied" : "Copy SDP to clipboard"}
                                    </button>
                                </div>

                                <p style={{ fontSize: 12 }}>Or share URL:</p>
                                <p className="long-url">{createShareUrl()}</p>
                            </>
                        )}
                    </div>

                    <div className="signal-block">

                        <h4>Remote signal (Paste after scanning QR code)</h4>

                        <textarea
                            value = {remoteSignal}
                            onChange = {(event) =>
                            {
                                setRemoteSignal(event.target.value);
                                setHasRemoteSignal(!!event.target.value)
                            }}
                            rows = {6}
                            style = {{ width: "100%" }}
                            placeholder = "Here paste and OFFER or ANSWER in JSON format"
                        />

                        <p style={{ fontSize: 12 }}>
                            This text comes from QR from the other device or parameter
                            ?sdp= in URL.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;