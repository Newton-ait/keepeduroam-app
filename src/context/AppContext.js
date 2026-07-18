import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  getDeviceId,
  clearDeviceId,
  getMode,
  saveMode,
  getUsername,
  getSession,
  isSessionExpired,
  getToken,
  clearToken,
  getDarkMode,
  saveDarkMode,
  getPrivacyAccepted,
  savePrivacyAccepted,
} from '../utils/storage';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(null);
  const [mode, setMode] = useState('store');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkModeState] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
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
      const savedToken = await getToken();
      const savedDarkMode = await getDarkMode();
      const savedPrivacyAccepted = await getPrivacyAccepted();

      setDeviceId(id);
      setMode(savedMode);
      setUsername(savedUsername || 'Guest');
      setToken(savedToken);
      setDarkModeState(savedDarkMode);
      setPrivacyAccepted(savedPrivacyAccepted);

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

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkModeState(next);
    await saveDarkMode(next);
  };

  const acceptPrivacy = async () => {
    setPrivacyAccepted(true);
    await savePrivacyAccepted();
  };

  // Retires the current device server-side (soft reset: stored time goes
  // to 0, the ID itself remains technically valid/gettable — see backend
  // notes) and clears local identity so a completely new device ID and
  // JWT get issued on the next socket registration. The caller is
  // responsible for warning the user they'll lose their stored time
  // before invoking this.
  const resetDevice = async () => {
    try {
      if (deviceId && token) {
        await fetch(`${WORKER_URL}/device/${deviceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error retiring device:', error);
    } finally {
      await clearDeviceId();
      await clearToken();
      setToken(null);
      const newId = await getDeviceId();
      setDeviceId(newId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        deviceId,
        token,
        mode,
        username,
        isConnected,
        isLoading,
        darkMode,
        privacyAccepted,
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
        setToken,
        toggleDarkMode,
        acceptPrivacy,
        resetDevice,
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
