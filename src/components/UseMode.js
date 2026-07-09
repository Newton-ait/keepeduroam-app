// src/components/UseMode.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useSocketContext } from '../context/SocketContext';
import { StatusBar } from './StatusBar';
import { SessionTimer } from './SessionTimer';
import COLORS from '../theme/colors';
import { getSession, isSessionExpired } from '../utils/storage';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

/**
 * Dedicated "use data" screen: this device relays through a provider's
 * shared connection, drawing down previously stored time.
 *
 * This screen no longer renders its own <AdReward /> — that previously
 * duplicated the "Watch Ad" button also present on the Earn tab. Earning
 * more time now happens exclusively on the Earn tab; this screen links
 * there instead.
 */
export function UseMode({ navigation }) {
  const {
    deviceId,
    isConnected,
    adData,
    serverStatus,
    updateAdData,
    updateServerStatus,
    timeData,
    switchMode,
  } = useApp();
  useSocketContext();
  const [refreshing, setRefreshing] = useState(false);
  const [expiresAt, setExpiresAt] = useState(timeData.expiresAt);
  const [expired, setExpired] = useState(false);

  // Tabs stay mounted after first visit, so mode must be (re)synced on
  // focus rather than on mount alone — this is what drives the socket's
  // register_provider vs register_consumer choice. (The socket itself no
  // longer reconnects on mode change — see useSocket.js — so this is now
  // a cheap re-registration, not a full teardown.)
  useFocusEffect(
    useCallback(() => {
      switchMode('use');
    }, [switchMode])
  );

  useEffect(() => {
    fetchAdStatus();
    fetchStatus();
    loadLocalSession();
  }, [deviceId]);

  const loadLocalSession = async () => {
    const session = await getSession();
    if (session?.expiresAt) {
      setExpiresAt(session.expiresAt);
      setExpired(isSessionExpired(session));
    }
  };

  const fetchAdStatus = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/api/ad-status?device_id=${deviceId}`);
      const data = await response.json();
      updateAdData(data);
    } catch (error) {
      console.error('Error fetching ad status:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/status`);
      const data = await response.json();
      updateServerStatus({
        online: data.status === 'online',
        servers: data.servers?.total || 0,
        users: data.users?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdStatus(), fetchStatus(), loadLocalSession()]);
    setRefreshing(false);
  };

  const goToEarn = () => {
    navigation?.navigate?.('Earn');
  };

  return (
    <View style={styles.container}>
      <StatusBar connected={isConnected} serverStatus={serverStatus} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Ionicons name="cloud-download-outline" size={28} color={COLORS.accent} />
          <Text style={styles.headerText}>Use Mode</Text>
          <Text style={styles.headerSubtext}>Relay through a provider's shared connection</Text>
        </View>

        {expiresAt ? (
          <View style={styles.timerWrap}>
            <SessionTimer expiresAt={expiresAt} onExpire={() => setExpired(true)} />
          </View>
        ) : (
          <View style={styles.noSessionCard}>
            <Text style={styles.noSessionText}>No active session yet. Watch an ad to get started.</Text>
          </View>
        )}

        {expired && (
          <View style={styles.expiredBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
            <Text style={styles.expiredText}>Your session has ended.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.earnLink} onPress={goToEarn}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
          <Text style={styles.earnLinkText}>
            Watch an Ad to Extend ({adData.remaining}/{adData.max} left today)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  headerText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  headerSubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  timerWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  noSessionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noSessionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    gap: 6,
  },
  expiredText: {
    color: COLORS.danger,
    fontSize: 12,
  },
  earnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  earnLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
