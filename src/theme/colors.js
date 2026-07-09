// DARK_COLORS is the app's original (and still default) palette. Every
// screen file continues to `import COLORS from '../theme/colors'` and
// gets this dark palette automatically — that part is unchanged.
export const DARK_COLORS = {
  primary: '#0A0E1A',
  secondary: '#1A2035',
  accent: '#4ECDC4',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  text: '#ECF0F1',
  textMuted: '#95A5A6',
  card: '#1A2035',
  border: '#2D3748',
  gold: '#FFD700',
};

// New light counterpart, used when the Settings "Dark Mode" switch is
// turned off. NOTE: only SettingsScreen.js currently reads this via
// getColors(darkMode) — the rest of the app's screens still import the
// static `COLORS` default (dark) directly. Making the switch change
// colors app-wide would mean converting every screen from
// `import COLORS from '../theme/colors'` to a theme hook; that's a
// larger, more mechanical follow-up beyond this pass (it touches every
// component file, several of which — HomeScreen.js, SessionTimer.js,
// TimeDisplay.js, LoadingScreen.js — weren't in scope here). This change
// at least makes the switch persist a real preference and actually
// affect something, rather than doing nothing at all as before.
export const LIGHT_COLORS = {
  primary: '#F5F6FA',
  secondary: '#FFFFFF',
  accent: '#0FA89C',
  success: '#27AE60',
  warning: '#E67E22',
  danger: '#C0392B',
  text: '#1A2035',
  textMuted: '#5C6B7A',
  card: '#FFFFFF',
  border: '#D9DFE5',
  gold: '#C9971E',
};

export function getColors(isDark) {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}

export const GRADIENTS = {
  primary: ['#0A0E1A', '#1A2035'],
  accent: ['#4ECDC4', '#2ECC71'],
  warning: ['#F39C12', '#E67E22'],
};

// Backward-compatible default export — unchanged behavior for every file
// that isn't SettingsScreen.js.
export const COLORS = DARK_COLORS;
export default COLORS;
