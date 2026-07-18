// src/components/PrivacyGate.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import COLORS from '../theme/colors';

const DOCS = {
  privacy: { label: 'Privacy Policy', url: 'https://keepeduroam.web.app/privacy.html' },
  terms: { label: 'Terms of Service', url: 'https://keepeduroam.web.app/terms.html' },
};

/**
 * First-launch gate: shows the actual hosted Privacy Policy and Terms of
 * Service, embedded in a WebView (toggle between the two), and requires
 * ticking "I agree" to both before the app is usable. Separate from (and
 * in addition to) the AdMob UMP consent flow in App.js — that one covers
 * ads/ad-data consent only; this covers the app's own data practices and
 * terms, which the store's policies expect users to affirmatively
 * accept on their own.
 *
 * Rendered by App.js's Root component whenever `privacyAccepted` is
 * false; once both boxes are ticked and Continue is pressed, AppContext
 * persists that via savePrivacyAccepted() so this never shows again on
 * this device.
 */
export function PrivacyGate({ onAccept }) {
  const [activeDoc, setActiveDoc] = useState('privacy');
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  const canContinue = privacyChecked && termsChecked;

  const switchDoc = (doc) => {
    if (doc === activeDoc) return;
    setLoading(true);
    setActiveDoc(doc);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Before you get started</Text>
        <Text style={styles.subtitle}>Please review our Privacy Policy and Terms of Service</Text>
      </View>

      <View style={styles.tabRow}>
        {Object.entries(DOCS).map(([key, doc]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeDoc === key && styles.tabActive]}
            onPress={() => switchDoc(key)}
          >
            <Text style={[styles.tabText, activeDoc === key && styles.tabTextActive]}>
              {doc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.webviewWrap}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
        <WebView
          key={activeDoc}
          source={{ uri: DOCS[activeDoc].url }}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
        />
      </View>

      <TouchableOpacity style={styles.checkRow} onPress={() => setPrivacyChecked((prev) => !prev)}>
        <Ionicons
          name={privacyChecked ? 'checkbox' : 'square-outline'}
          size={22}
          color={privacyChecked ? COLORS.accent : COLORS.textMuted}
        />
        <Text style={styles.checkText}>I have read and agree to the Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkRow} onPress={() => setTermsChecked((prev) => !prev)}>
        <Ionicons
          name={termsChecked ? 'checkbox' : 'square-outline'}
          size={22}
          color={termsChecked ? COLORS.accent : COLORS.textMuted}
        />
        <Text style={styles.checkText}>I have read and agree to the Terms of Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
        onPress={onAccept}
        disabled={!canContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.accent,
  },
  webviewWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  checkText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
