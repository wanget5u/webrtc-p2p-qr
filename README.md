WebRTC App for video/audio calls

Direct audio and video connection between two devices located on the same local network. Communication is handled using WebRTC technology,
while signaling (exchange of OFFER/ANSWER data) does not rely on any server — instead, it is transmitted via QR codes that users scan with their device cameras.

    WebRTC (P2P connection)
    QR codes (used solely for exchanging SDP — offer/answer)
    URL parameters (as the signaling medium)

The entire process consists of three steps:

    Device A generates a connection (OFFER) and displays a QR code.
    Device B scans the QR code, creates a response (ANSWER), and displays its own QR code.
    Device A scans the QR code with the ANSWER, completing the connection setup.

After the offer and answer are exchanged, the devices connect directly, establishing a P2P connection with full bidirectional audio and video communication.

## Setup
1. Clone and Install Dependencies
```
# Navigate to the backend folder
cd webrtc-p2p-qr-backend
npm install

# Navigate to the frontend folder
cd ../frontend
npm install
```

2. Generate SSL Certificates (Required for Camera Access)

    - In the root of your backend folder, create/run your gencert.js script: ```node gencert.js```
    - Verify that key.pem and cert.pem now exist in your folder.


3. Build the Frontend
```
# Inside the /frontend folder
npm run build
```

4. Start the Server
```
# Inside the /webrtc-p2p-qr-backend folder
npm run dev
```