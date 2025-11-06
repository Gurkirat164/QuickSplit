import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Singleton socket instance
let socket = null;
let currentToken = null;
let isInitialized = false;

/**
 * Initialize socket connection (singleton)
 * @param {string} token - Authentication token
 * @returns {object} Socket instance
 */
const initializeSocket = (token) => {
  // If socket exists and token hasn't changed, return existing socket
  if (socket && socket.connected && currentToken === token) {
    console.log('♻️ Reusing existing socket connection');
    return socket;
  }

  // If token changed, disconnect old socket
  if (socket && currentToken !== token) {
    console.log('🔄 Token changed, reconnecting socket');
    socket.disconnect();
    socket = null;
    isInitialized = false;
  }

  // Create new socket connection only once
  if (!socket && !isInitialized) {
    console.log('Creating new socket connection to:', SOCKET_URL);
    isInitialized = true;
    currentToken = token;
    
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    // Connection event handlers (set up only once)
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  return socket;
};

/**
 * Custom hook to manage Socket.IO connection
 * @param {string} token - Authentication token
 * @returns {object} Socket instance
 */
const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Get or create singleton socket instance
    socketRef.current = initializeSocket(token);

    // Cleanup: Don't disconnect on unmount to maintain connection across components
    return () => {
      // Socket will persist across components
    };
  }, [token]);

  return socketRef.current;
};

// Export socket instance for use outside hooks
export const getSocket = () => socket;

export default useSocket;
