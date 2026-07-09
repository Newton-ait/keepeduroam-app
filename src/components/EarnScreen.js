// src/components/EarnScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AdReward, getAdErrorMessage } from './AdReward';
import COLORS from '../theme/colors';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

/**
 * "Earn" tab: dedicated screen for watching rewarded ads to bank extra
 * time. Wraps the AdReward component with the context wiring (device id,
 * ad status) it needs, since a bare component can't be used directly as
 * a tab screen.
 *
 * This is the only screen that renders <AdReward /> — it previously also
 * appeared in UseMode, giving users two separate "Watch Ad" buttons.
 */
export function EarnScreen() {
  const { deviceId, adData, points, timeData, updateAdData, updateTimeData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdStatus();
  }, [deviceId]);

  const fetchAdStatus = async () => {
    try {
      const response = await fetch(`${WORKER_URL}/api/ad-status?device_id=${deviceId}`);
      const data = await response.json();
      updateAdData(data);
    } catch (error) {
      console.error('Error fetching ad status:', error);
    }
  };

  const handleReward = ({ hours, session }) => {
    if (session?.expiresAt) {
      updateTimeData({ ...timeData, expires_at: session.expiresAt });
    }
    fetchAdStatus();
    Alert.alert('✅ Time Extended!', `You earned +${hours} hour${hours > 1 ? 's' : ''}!`);
  };

  const handleAdError = (error) => {
    Alert.alert('Ad Unavailable', getAdErrorMessage(error));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdStatus();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={28} color={COLORS.gold} />
        <Text style={styles.headerText}>Earn Time</Text>
        <Text style={styles.headerSubtext}>Watch a rewarded ad to bank more hours</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{adData.remaining}</Text>
          <Text style={styles.statLabel}>Ads Left Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{adData.max}</Text>
          <Text style={styles.statLabel}>Daily Max</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <View style={styles.adCard}>
        <AdReward deviceId={deviceId} adData={adData} onReward={handleReward} onError={handleAdError} />
        {!adData.canWatch && (
          <Text style={styles.limitText}>You've hit today's ad limit. Come back tomorrow!</Text>
        )}
      </View>

      <Text style={styles.footnote}>Each ad watched earns between 1 and 4 hours of session time.</Text>
    </ScrollView>
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
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  adCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  limitText: {
    color: COLORS.warning,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  footnote: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 32,
  },
});
