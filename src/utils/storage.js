import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DEVICE_ID: '@keepeduroam:device_id',
  MODE: '@keepeduroam:mode',
  SESSION: '@keepeduroam:session',
  USERNAME: '@keepeduroam:username',
};

export async function getDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `device_${Date.now()}`;
  }
}

export async function saveMode(mode) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (error) {
    console.error('Error saving mode:', error);
  }
}

export async function getMode() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.MODE) || 'store';
  } catch (error) {
    return 'store';
  }
}

export async function saveUsername(username) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
  } catch (error) {
    console.error('Error saving username:', error);
  }
}

export async function getUsername() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME) || '';
  } catch (error) {
    return '';
  }
}

export async function saveSession(session) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

export function isSessionExpired(session) {
  if (!session || !session.expiresAt) return true;
  return new Date(session.expiresAt).getTime() <= Date.now();
}

export async function extendSession(extraSeconds) {
  try {
    const session = await getSession();
    const base = session && !isSessionExpired(session)
      ? new Date(session.expiresAt).getTime()
      : Date.now();
    const newExpiresAt = new Date(base + extraSeconds * 1000).toISOString();
    const updated = { ...(session || {}), expiresAt: newExpiresAt };
    await saveSession(updated);
    return updated;
  } catch (error) {
    console.error('Error extending session:', error);
    return null;
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}
