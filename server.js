import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const frontendBuildPath = path.join(__dirname, "frontend", "dist");

app.use(express.static(frontendBuildPath));
app.get(/.*/, (req, res) => { res.sendFile(path.join(frontendBuildPath, "index.html")); });

const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

const PORT = 5050;
const HOST = '0.0.0.0';

const server = https.createServer(options, app);

server.listen(PORT, HOST, () => {
    console.log(`Server is running on:`);
    console.log(`- Local:   https://localhost:${PORT}`);
    console.log(`- Network: https://<YOUR_IPv4>:${PORT}`);
});