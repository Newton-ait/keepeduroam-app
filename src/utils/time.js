export function formatTime(seconds) {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatTimeFull(seconds) {
  if (seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function getTimeRemaining(expiresAt) {
  if (!expiresAt) return 0;
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const remaining = Math.floor((expiry - now) / 1000);
  return Math.max(0, remaining);
}

export function getStorageTime(storedSeconds) {
  return formatTime(storedSeconds);
}

export function getPercentageUsed(stored, used) {
  if (stored === 0) return 0;
  return Math.min(100, (used / stored) * 100);
}
