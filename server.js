import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const frontendBuildPath = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendBuildPath));
app.get((req, res) =>
{
    res.sendFile(path.join(frontendBuildPath, "index.html"));
});

io.on("connection", (socket) =>
{
    socket.emit("me", socket.id);

    socket.on("disconnect", () =>
    {
       socket.broadcast.emit("callEnded");
    });

    socket.on("callUser", (data) =>
    {
        io.to(data.userToCall).emit("callUser",
            {
                signal: data.signalData,
                from: data.from,
                name: data.name
            });
    });

    socket.on("answerCall", (data) =>
    {
        io.to(data.to).emit("callAccepted", data.signal);
    });
});

server.listen(5050, () => console.log("Server is now running on port 5050."));