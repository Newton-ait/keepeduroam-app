// src/components/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import COLORS from '../theme/colors';

export function SettingsScreen() {
  const { deviceId, mode, switchMode } = useApp();
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Device ID</Text>
        <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
          {deviceId || 'Loading...'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Default Mode</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'store' && styles.modeActive]}
            onPress={() => switchMode('store')}
          >
            <Text style={[styles.modeText, mode === 'store' && styles.modeTextActive]}>Store</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'use' && styles.modeActive]}
            onPress={() => switchMode('use')}
          >
            <Text style={[styles.modeText, mode === 'use' && styles.modeTextActive]}>Use</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={darkMode ? COLORS.text : COLORS.textMuted}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>About</Text>
        <Text style={styles.value}>KeepEduroam v2.0.0</Text>
        <Text style={styles.muted}>Save sessions. Use sessions. Share sessions.</Text>
      </View>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>📄 Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>📄 Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.link, styles.lastLink]}>
        <Text style={styles.linkText}>💬 Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    color: COLORS.text,
    fontSize: 14,
  },
  muted: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  modeActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  modeText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: COLORS.accent,
  },
  link: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastLink: {
    borderBottomWidth: 0,
  },
  linkText: {
    color: COLORS.accent,
    fontSize: 14,
  },
});
