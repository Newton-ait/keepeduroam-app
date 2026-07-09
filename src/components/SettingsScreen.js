// src/components/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Linking, Alert, Modal, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useApp } from '../context/AppContext';
import { getColors } from '../theme/colors';

const URLS = {
  privacy: 'https://keepeduroam.web.app/privacy.html',
  terms: 'https://keepeduroam.web.app/terms.html',
  support: 'https://keepeduroam.web.app/support.html',
  home: 'https://keepeduroam.web.app/',
};

export function SettingsScreen() {
  const { deviceId, mode, switchMode, darkMode, toggleDarkMode, resetDevice } = useApp();
  const [shareVisible, setShareVisible] = useState(false);
  const [resetting, setResetting] = useState(false);
  const COLORS = getColors(darkMode);
  const styles = makeStyles(COLORS);

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', url);
    });
  };

  const confirmRandomizeId = () => {
    Alert.alert(
      'Randomize Device ID?',
      "This creates a brand new device identity. You'll lose any time you currently have stored — this can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Randomize',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetDevice();
              Alert.alert('Done', 'Your device now has a new ID.');
            } catch (error) {
              Alert.alert('Error', 'Could not reset device. Please try again.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Get KeepEduroam — store and use Wi-Fi data on the go: ${URLS.home}`,
      });
    } catch (error) {
      // User cancelled the share sheet — not an error worth surfacing.
    }
  };

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
            onValueChange={toggleDarkMode}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={darkMode ? COLORS.text : COLORS.textMuted}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Share App</Text>
        <Text style={styles.muted}>Invite a friend by QR code or link.</Text>
        <View style={styles.shareRow}>
          <TouchableOpacity style={styles.smallButton} onPress={() => setShareVisible(true)}>
            <Text style={styles.smallButtonText}>Show QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, styles.smallButtonOutline]} onPress={handleShare}>
            <Text style={styles.smallButtonOutlineText}>Share Link</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Danger Zone</Text>
        <Text style={styles.muted}>
          Randomizing your device ID resets your identity. Any stored time on the current ID is lost.
        </Text>
        <TouchableOpacity
          style={[styles.smallButton, styles.dangerButton]}
          onPress={confirmRandomizeId}
          disabled={resetting}
        >
          <Text style={styles.smallButtonText}>
            {resetting ? 'Resetting…' : 'Randomize Device ID'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>About</Text>
        <Text style={styles.value}>KeepEduroam v2.0.0</Text>
        <Text style={styles.muted}>Save sessions. Use sessions. Share sessions.</Text>
      </View>

      <TouchableOpacity style={styles.link} onPress={() => openLink(URLS.privacy)}>
        <Text style={styles.linkText}>📄 Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => openLink(URLS.terms)}>
        <Text style={styles.linkText}>📄 Terms of Service</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.link, styles.lastLink]} onPress={() => openLink(URLS.support)}>
        <Text style={styles.linkText}>💬 Support</Text>
      </TouchableOpacity>

      <Modal visible={shareVisible} transparent animationType="fade" onRequestClose={() => setShareVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Scan to get KeepEduroam</Text>
            <View style={styles.qrWrap}>
              <QRCode value={URLS.home} size={200} backgroundColor="#FFFFFF" color="#000000" />
            </View>
            <TouchableOpacity style={styles.smallButton} onPress={() => setShareVisible(false)}>
              <Text style={styles.smallButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (COLORS) =>
  StyleSheet.create({
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
    shareRow: {
      flexDirection: 'row',
      marginTop: 10,
      gap: 8,
    },
    smallButton: {
      flex: 1,
      backgroundColor: COLORS.accent,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    smallButtonText: {
      color: COLORS.primary,
      fontWeight: 'bold',
      fontSize: 13,
    },
    smallButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.accent,
    },
    smallButtonOutlineText: {
      color: COLORS.accent,
      fontWeight: 'bold',
      fontSize: 13,
    },
    dangerButton: {
      backgroundColor: COLORS.danger,
      marginTop: 10,
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
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(10, 14, 26, 0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrCard: {
      backgroundColor: COLORS.secondary,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    qrTitle: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    qrWrap: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
  });
