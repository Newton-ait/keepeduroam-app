// src/components/ConnectionScreen.js
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useConnectivitySuggestion } from '../utils/connectivity';
import { StoreMode } from './StoreMode';
import { UseMode } from './UseMode';

/**
 * Merges the old separate "Store" and "Use" tabs into a single
 * auto-detected screen. Which one the user sees is decided entirely by
 * real backend reachability (see utils/connectivity.js) — not a manual
 * toggle. The old per-screen `useFocusEffect(() => switchMode(...))`
 * calls in StoreMode/UseMode have been removed; this component is now
 * the single place that decides and sets the active mode.
 */
export function ConnectionScreen(props) {
  const { mode, switchMode } = useApp();
  const { suggestedMode } = useConnectivitySuggestion();

  useEffect(() => {
    if (suggestedMode && suggestedMode !== mode) {
      switchMode(suggestedMode);
    }
  }, [suggestedMode]);

  return mode === 'store' ? <StoreMode {...props} /> : <UseMode {...props} />;
}
