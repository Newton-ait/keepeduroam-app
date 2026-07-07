import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { formatTimeFull, getPercentageUsed } from '../utils/time';

export function TimeDisplay({ timeData, mode }) {
  const { stored, used, remaining, expiresAt } = timeData;
  const percentage = getPercentageUsed(stored, used);
  const isStoreMode = mode === 'store';

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View style={styles.timeRow}>
          <Ionicons
            name={isStoreMode ? 'cloud-upload-outline' : 'cloud-download-outline'}
            size={24}
            color={COLORS.accent}
          />
          <Text style={styles.timeLabel}>
            {isStoreMode ? 'Stored Time' : 'Using Time'}
          </Text>
        </View>

        <Text style={styles.timeValue}>
          {formatTimeFull(isStoreMode ? stored : remaining)}
        </Text>

        {isStoreMode && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.min(percentage, 100).toFixed(0)}% used
            </Text>
          </View>
        )}

        {!isStoreMode && expiresAt && (
          <Text style={styles.expiryText}>
            Expires: {new Date(expiresAt).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {isStoreMode && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTimeFull(stored)}</Text>
            <Text style={styles.statLabel}>Stored</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTimeFull(used)}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTimeFull(stored - used)}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 8,
  },
  timeValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  expiryText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
});
