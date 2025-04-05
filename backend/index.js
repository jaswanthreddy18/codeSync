import express from "express";
import http from 'http';
import {Server} from 'socket.io';
import ACTIONS from "../frontend/shared/actions.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const app = express(); 
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "https://your-frontend.vercel.app",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));


app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

const userSocketMap = {};
function getAllConnectedClients (roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return{
            socketId,
            username:userSocketMap[socketId]
        }
    })
}
io.on('connection',(socket) => {
    console.log('socket connected', socket.id );
    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        // console.log(clients);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId:socket.id,
            })
        })
    })
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        // console.log(`Code updated in room ${roomId}`);
        // console.log("Connected clients in room:", io.sockets.adapter.rooms.get(roomId));
        io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on('disconnecting', () => { 
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => { 
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId:socket.id,
                username:userSocketMap[socket.id]
            })
        }) 
        delete userSocketMap[socket.id];
        socket.leave();
    });
}) 


const PORT = 3000;
server.listen(PORT, (req,res) => {
    console.log(`app listining at port number ${PORT}`);
})  