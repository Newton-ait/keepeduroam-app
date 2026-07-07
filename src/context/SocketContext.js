// src/context/SocketContext.js
import React, { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext(null);

/**
 * Wraps the app once so every screen shares a single socket connection.
 * Needed because Store/Use/Earn all live in the tab tree at the same
 * time (tabs stay mounted after first visit) — without this, each
 * screen calling useSocket() directly would open its own connection and
 * could register the same device as both provider and consumer at once.
 */
export function SocketProvider({ children }) {
  const socketApi = useSocket();
  return <SocketContext.Provider value={socketApi}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
