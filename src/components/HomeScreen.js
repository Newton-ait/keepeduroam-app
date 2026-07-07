import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import { StatusBar } from './StatusBar';
import { TimeDisplay } from './TimeDisplay';
import { showAd, loadAd, createRewardedAd } from '../utils/ads';
import COLORS from '../theme/colors';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

export function HomeScreen({ navigation }) {
  const {
    deviceId,
    mode,
    isConnected,
    timeData,
    adData,
    serverStatus,
    switchMode,
    updateTimeData,
    updateAdData,
    updateServerStatus,
  } = useApp();

  useSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchTimeData();
    fetchAdStatus();
  }, [deviceId]);

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

  const fetchTimeData = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/time/${deviceId}`);
      const data = await response.json();
      updateTimeData(data);
    } catch (error) {
      console.error('Error fetching time data:', error);
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

  const handleWatchAd = async () => {
    if (isAdLoading) return;

    try {
      setIsAdLoading(true);

      const adResponse = await fetch(
        `${WORKER_URL}/api/next-ad?device_id=${deviceId}&platform=${Platform.OS}`
      );
      const nextAd = await adResponse.json();

      if (nextAd.error) {
        Alert.alert('Error', nextAd.error);
        return;
      }

      Alert.alert('🎬 Loading Ad...', 'Please wait while we load your ad.');

      const rewarded = createRewardedAd(nextAd.ad_unit_name);
      await loadAd(rewarded);
      await showAd(rewarded);

      Alert.alert(
        '✅ Time Extended!',
        `You earned +${nextAd.hours} hour${nextAd.hours > 1 ? 's' : ''}!`,
        [
          {
            text: 'Great!',
            onPress: () => {
              fetchTimeData();
              fetchAdStatus();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Ad error:', error);
      Alert.alert('Error', 'Failed to show ad. Please try again.');
    } finally {
      setIsAdLoading(false);
    }
  };

  const handleConnect = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please check your internet connection.');
      return;
    }

    if (mode === 'store') {
      Alert.alert('📡 Storing Data', 'Your Wi-Fi data is being stored securely.', [
        { text: 'OK' },
      ]);
    } else {
      Alert.alert('📡 Using Stored Data', 'You are now using your stored data.', [
        { text: 'OK' },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchTimeData(), fetchAdStatus()]);
    setRefreshing(false);
  };

  const isStoreMode = mode === 'store';

  return (
    <View style={styles.container}>
      <StatusBar connected={isConnected} serverStatus={serverStatus} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, isStoreMode && styles.modeActive]}
            onPress={() => switchMode('store')}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={isStoreMode ? COLORS.accent : COLORS.textMuted}
            />
            <Text style={[styles.modeText, isStoreMode && styles.modeTextActive]}>
              Store Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, !isStoreMode && styles.modeActive]}
            onPress={() => switchMode('use')}
          >
            <Ionicons
              name="cloud-download-outline"
              size={20}
              color={!isStoreMode ? COLORS.accent : COLORS.textMuted}
            />
            <Text style={[styles.modeText, !isStoreMode && styles.modeTextActive]}>
              Use Data
            </Text>
          </TouchableOpacity>
        </View>

        <TimeDisplay timeData={timeData} mode={mode} />

        <TouchableOpacity
          style={[styles.connectButton, !isConnected && styles.connectButtonDisabled]}
          onPress={handleConnect}
          disabled={!isConnected}
        >
          <Text style={styles.connectButtonText}>
            {isStoreMode ? '📡 STORE DATA' : '📡 USE DATA'}
          </Text>
        </TouchableOpacity>

        {!isStoreMode && (
          <View style={styles.adSection}>
            <View style={styles.adHeader}>
              <Text style={styles.adTitle}>🎬 Extend Your Time</Text>
              <Text style={styles.adSubtitle}>
                {adData.remaining} / {adData.max} ads remaining today
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.adButton,
                (!adData.canWatch || isAdLoading) && styles.adButtonDisabled,
              ]}
              onPress={handleWatchAd}
              disabled={!adData.canWatch || isAdLoading}
            >
              <Text style={styles.adButtonText}>
                {isAdLoading ? 'Loading...' : '🎬 Watch Ad +1-4 Hours'}
              </Text>
            </TouchableOpacity>

            {!adData.canWatch && (
              <Text style={styles.adLimitText}>Daily limit reached. Come back tomorrow!</Text>
            )}
          </View>
        )}

        <View style={styles.serverInfo}>
          <Text style={styles.serverInfoText}>
            🔒 256-bit encrypted • {serverStatus.servers || 0} servers online
          </Text>
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
  modeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
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
  connectButton: {
    backgroundColor: COLORS.accent,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  connectButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  adSection: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adHeader: {
    marginBottom: 12,
  },
  adTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  adSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  adButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  adButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  adLimitText: {
    color: COLORS.warning,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  serverInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  serverInfoText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
