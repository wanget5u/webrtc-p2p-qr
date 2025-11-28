import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const frontendBuildPath = path.join(__dirname, "frontend", "dist");

app.use(express.static(frontendBuildPath));
app.get((req, res) =>
{res.sendFile(path.join(frontendBuildPath, "index.html"));});

server.listen(5050, () => console.log("Server is now running on port 5050."));