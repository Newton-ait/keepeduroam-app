// src/components/StoreMode.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSocketContext } from '../context/SocketContext';
import { StatusBar } from './StatusBar';
import { TimeDisplay } from './TimeDisplay';
import COLORS from '../theme/colors';
import { authFetch } from '../utils/storage';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

/**
 * Dedicated "store data" screen: this device acts as a provider, sharing
 * its eduroam connection so time accrues for later use.
 *
 * Which mode is active (this screen vs. UseMode) is decided entirely by
 * ConnectionScreen's connectivity auto-detection — this component no
 * longer switches mode itself.
 */
export function StoreMode({ navigation }) {
  const { deviceId, isConnected, timeData, serverStatus, points, updateTimeData, updateServerStatus } =
    useApp();
  const { isReady } = useSocketContext();
  const [refreshing, setRefreshing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetchTimeData();
    fetchStatus();
  }, [deviceId]);

  const fetchTimeData = async () => {
    try {
      // /time/{id} now requires the device's JWT — authFetch attaches it
      // automatically if one is stored.
      const response = await authFetch(`${WORKER_URL}/time/${deviceId}`);
      const data = await response.json();
      updateTimeData(data);
    } catch (error) {
      console.error('Error fetching time data:', error);
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

  const toggleSharing = () => {
    if (!isConnected || !isReady) {
      Alert.alert('Not Connected', 'Please check your internet connection before sharing.');
      return;
    }
    setIsSharing((prev) => !prev);
    Alert.alert(
      isSharing ? '⏸ Sharing Paused' : '📡 Sharing Started',
      isSharing
        ? 'You have stopped sharing your connection.'
        : 'Your Wi-Fi data is now being stored for others to relay through.'
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTimeData(), fetchStatus()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar connected={isConnected} serverStatus={serverStatus} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Ionicons name="cloud-upload-outline" size={28} color={COLORS.accent} />
          <Text style={styles.headerText}>Store Mode</Text>
          <Text style={styles.headerSubtext}>
            Share your connection to bank time for later
          </Text>
        </View>

        <TimeDisplay timeData={timeData} mode="store" />

        <TouchableOpacity
          style={[styles.shareButton, isSharing && styles.shareButtonActive]}
          onPress={toggleSharing}
        >
          <Ionicons
            name={isSharing ? 'pause-circle-outline' : 'play-circle-outline'}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Stop Sharing' : 'Start Sharing'}
          </Text>
        </TouchableOpacity>

        <View style={styles.pointsCard}>
          <Ionicons name="star-outline" size={18} color={COLORS.gold} />
          <Text style={styles.pointsText}>{points} points earned</Text>
        </View>
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonActive: {
    backgroundColor: COLORS.warning,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  pointsText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
