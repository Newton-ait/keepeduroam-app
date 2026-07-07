// src/components/SessionTimer.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';
import { formatTimeFull } from '../utils/time';

export function SessionTimer({ expiresAt, onExpire }) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    setIsExpired(false);

    const tick = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(remaining);
      return remaining;
    };

    // Run once immediately so the UI doesn't wait a full second
    const initial = tick();
    if (initial === 0) {
      setIsExpired(true);
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const remaining = tick();
      if (remaining === 0) {
        setIsExpired(true);
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const getStatusColor = () => {
    if (timeRemaining < 3600) return COLORS.danger;
    if (timeRemaining < 7200) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        <Text style={styles.label}>⏰ Session Remaining</Text>
        <Text style={[styles.time, { color: getStatusColor() }]}>
          {isExpired ? 'Expired' : formatTimeFull(timeRemaining)}
        </Text>
      </View>
      {timeRemaining < 3600 && timeRemaining > 0 && (
        <Text style={styles.warning}>
          ⚠️ Session expiring soon! Watch an ad to extend.
        </Text>
      )}
      {isExpired && (
        <Text style={styles.warning}>
          Your session has ended. Watch an ad to keep going.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  warning: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
