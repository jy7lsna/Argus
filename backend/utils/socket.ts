import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const init = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'http://localhost:8080',
                    process.env.FRONTEND_URL || ''
                ].filter(Boolean),
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        console.log('✅ Socket.IO initialized');
        return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};
