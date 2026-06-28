import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  const baseUrl = import.meta.env.VITE_SOCKET_URL
    || (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || window.location.origin);

  socket = io(baseUrl, {
    auth: { token },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(otherUserId) {
  socket?.emit('join_conversation', Number(otherUserId));
}
