import express from "express";
import http from 'http';
import {Server} from 'socket.io';
import ACTIONS from "../frontend/shared/actions.js";
const app = express(); 
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true
    }
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