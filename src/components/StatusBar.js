// src/components/StatusBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../theme/colors';

// Deliberately simple: just "are we connected or not." Previously this
// also surfaced server/user counts ("3 servers, 12 users") — internal
// relay-network details a user has no reason to see and that don't mean
// anything to them. The relay mechanism (who they're actually connecting
// through) is meant to be invisible to the user by design; this brought
// the status bar in line with that.
export function StatusBar({ connected, serverStatus }) {
  const getStatusColor = () => {
    if (!connected) return COLORS.danger;
    if (serverStatus?.online) return COLORS.success;
    return COLORS.warning;
  };

  const getStatusText = () => {
    if (!connected) return 'Disconnected';
    if (serverStatus?.online) return 'Connected';
    return 'Connecting…';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
});
