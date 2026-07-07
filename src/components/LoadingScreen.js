import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import COLORS from '../theme/colors';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⏰ KeepEduroam</Text>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 16,
  },
});
