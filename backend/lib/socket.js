import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join_conversation', (otherUserId) => {
      const room = conversationRoom(socket.userId, otherUserId);
      socket.join(room);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

export function conversationRoom(userIdA, userIdB) {
  const [a, b] = [userIdA, userIdB].sort((x, y) => x - y);
  return `conversation:${a}:${b}`;
}

export function emitToUser(userId, event, data) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(userIdA, userIdB, event, data) {
  io?.to(conversationRoom(userIdA, userIdB)).emit(event, data);
}

export function getIO() {
  return io;
}
