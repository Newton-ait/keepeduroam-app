import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';

export function StatusBar({ connected, serverStatus }) {
  const getStatusColor = () => {
    if (!connected) return COLORS.danger;
    if (serverStatus.online) return COLORS.success;
    return COLORS.warning;
  };

  const getStatusText = () => {
    if (!connected) return 'Disconnected';
    if (serverStatus.online) return `Online (${serverStatus.servers} servers)`;
    return 'Connecting...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      {connected && serverStatus.online && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="server-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{serverStatus.servers || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{serverStatus.users || 0}</Text>
          </View>
          {!connected && (
            <ActivityIndicator size="small" color={COLORS.accent} style={styles.loader} />
          )}
        </View>
      )}
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
  loader: {
    marginLeft: 8,
  },
});
