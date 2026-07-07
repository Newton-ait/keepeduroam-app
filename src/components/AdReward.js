// src/components/AdReward.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { showAd, loadAd, createRewardedAd } from '../utils/ads';
import { extendSession } from '../utils/storage';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

/**
 * Self-contained rewarded-ad flow. Renders a button; tapping it fetches
 * the next ad to show from the server, loads + displays it, then reports
 * the reward back via onReward({ hours, session }).
 */
export function AdReward({ deviceId, adData, onReward, onError }) {
  const [stage, setStage] = useState('idle'); // idle | fetching | loading | showing | done
  const [visible, setVisible] = useState(false);

  const stageLabel = {
    idle: '',
    fetching: 'Finding an ad for you…',
    loading: 'Loading ad…',
    showing: 'Playing ad…',
    done: 'Reward earned!',
  }[stage];

  const handleWatchAd = async () => {
    if (stage !== 'idle' || !adData?.canWatch) return;

    try {
      setVisible(true);
      setStage('fetching');

      const adResponse = await fetch(
        `${WORKER_URL}/api/next-ad?device_id=${deviceId}&platform=${Platform.OS}`
      );
      const nextAd = await adResponse.json();

      if (nextAd.error) {
        throw new Error(nextAd.error);
      }

      setStage('loading');
      const rewarded = createRewardedAd(nextAd.ad_unit_name);
      await loadAd(rewarded);

      setStage('showing');
      await showAd(rewarded);

      setStage('done');
      const extraSeconds = (nextAd.hours || 1) * 3600;
      const session = await extendSession(extraSeconds);

      onReward?.({ hours: nextAd.hours || 1, session });
    } catch (error) {
      console.error('AdReward error:', error);
      onError?.(error);
    } finally {
      setTimeout(() => {
        setVisible(false);
        setStage('idle');
      }, stage === 'done' ? 900 : 0);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, !adData?.canWatch && styles.buttonDisabled]}
        onPress={handleWatchAd}
        disabled={!adData?.canWatch || stage !== 'idle'}
      >
        <Ionicons name="play-circle-outline" size={18} color={COLORS.primary} />
        <Text style={styles.buttonText}>
          {adData?.canWatch ? 'Watch Ad for More Time' : 'Daily Limit Reached'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            {stage === 'done' ? (
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            ) : (
              <ActivityIndicator size="large" color={COLORS.accent} />
            )}
            <Text style={styles.stageText}>{stageLabel}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 220,
  },
  stageText: {
    color: COLORS.text,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});
