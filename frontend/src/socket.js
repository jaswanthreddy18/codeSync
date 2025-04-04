import { io } from "socket.io-client";

const options = {
    'force new connection': true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ['websocket'],
};

let socket = null;

export const initSocket = () => {
    if (!socket) {
        socket = io(import.meta.env.VITE_BACKEND_URL, options);
    }
    return socket;
};
