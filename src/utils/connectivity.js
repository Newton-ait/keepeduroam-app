// src/utils/connectivity.js
//
// Addresses: "when on wifi app shows store mode and the app should sense
// connectivity without internet connection then suggest usemode."
//
// The core problem this solves: being connected to a Wi-Fi *access
// point* (eduroam) doesn't mean that connection has real internet behind
// it — that's exactly the scenario this app exists for. So "on wifi" is
// not a reliable signal for which mode to suggest; actual reachability
// of our own backend is a much better one.
//
// This is a lightweight, dependency-free reachability check (no NetInfo
// — that's not currently a project dependency, and adding native-module
// dependencies has been a repeated source of build breakage in this
// project, so this intentionally avoids that route). It hits the
// existing health endpoint with a short timeout.
//
// Scope note: this file provides the underlying signal
// (suggestModeFromReachability) and a small polling hook
// (useConnectivitySuggestion). Deciding exactly where/how to surface the
// suggestion in the UI (a banner? an auto-switch with an undo? a toast?)
// is a product decision that needs a screen to live in — wire the hook's
// output into StoreMode/UseMode once that's decided.

import { useEffect, useState, useRef } from 'react';

const HEALTH_URL = 'https://keepeduroam.aitdevlabs.workers.dev/.well-known/health';
const CHECK_TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 30000;

export async function isBackendReachable() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const response = await fetch(HEALTH_URL, { signal: controller.signal });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// Given whether our backend is actually reachable right now, suggests
// which mode makes sense:
//   - reachable   -> 'store' (this device has real internet to share)
//   - unreachable -> 'use'   (this device likely only has a captive/
//                              gated connection and should draw on
//                              previously stored time instead)
export function suggestModeFromReachability(reachable) {
  return reachable ? 'store' : 'use';
}

// Polls reachability every POLL_INTERVAL_MS and exposes the current
// suggestion. Does not change the user's mode itself — callers decide
// what to do with `suggestedMode` (e.g. show a banner, prompt, or
// auto-switch only when no explicit user choice has been made yet).
export function useConnectivitySuggestion() {
  const [reachable, setReachable] = useState(null); // null = unknown yet
  const [suggestedMode, setSuggestedMode] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const check = async () => {
      const result = await isBackendReachable();
      if (!mountedRef.current) return;
      setReachable(result);
      setSuggestedMode(suggestModeFromReachability(result));
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return { reachable, suggestedMode };
}
