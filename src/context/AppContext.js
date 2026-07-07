import React, { createContext, useState, useContext, useEffect } from 'react';
import { getDeviceId, getMode, saveMode, getUsername, getSession, isSessionExpired } from '../utils/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [deviceId, setDeviceId] = useState(null);
  const [mode, setMode] = useState('store');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeData, setTimeData] = useState({
    stored: 0,
    used: 0,
    expiresAt: null,
    remaining: 0,
  });
  const [adData, setAdData] = useState({
    remaining: 6,
    max: 6,
    canWatch: true,
  });
  const [serverStatus, setServerStatus] = useState({
    online: false,
    servers: 0,
    users: 0,
  });
  const [points, setPoints] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    loadDeviceData();
  }, []);

  const loadDeviceData = async () => {
    try {
      const id = await getDeviceId();
      const savedMode = await getMode();
      const savedUsername = await getUsername();

      setDeviceId(id);
      setMode(savedMode);
      setUsername(savedUsername || 'Guest');

      const session = await getSession();
      if (session) {
        setSessionExpired(isSessionExpired(session));
        if (session.expiresAt) {
          setTimeData((prev) => ({ ...prev, expiresAt: session.expiresAt }));
        }
      }
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = async (newMode) => {
    setMode(newMode);
    await saveMode(newMode);
  };

  const updateTimeData = (data) => {
    setTimeData({
      stored: data.stored_time_seconds || 0,
      used: data.used_time_seconds || 0,
      expiresAt: data.expires_at || null,
      remaining: data.remaining || 0,
    });
  };

  const updateAdData = (data) => {
    setAdData({
      remaining: data.remaining_ads || 0,
      max: data.max_ads || 6,
      canWatch: data.remaining_ads > 0,
    });
  };

  const updateServerStatus = (status) => {
    setServerStatus({
      online: status.online || false,
      servers: status.servers || 0,
      users: status.users || 0,
    });
  };

  const updatePoints = (data) => {
    setPoints(typeof data === 'number' ? data : data?.points || 0);
  };

  return (
    <AppContext.Provider
      value={{
        deviceId,
        mode,
        username,
        isConnected,
        isLoading,
        timeData,
        adData,
        serverStatus,
        points,
        sessionExpired,
        setUsername,
        switchMode,
        setIsConnected,
        updateTimeData,
        updateAdData,
        updateServerStatus,
        updatePoints,
        setSessionExpired,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
