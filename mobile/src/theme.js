import { Platform } from 'react-native';

export const COLORS = {
  paper: '#ffffff',
  paperSoft: '#faf8f4',
  ink: '#1c1914',
  muted: '#6b6459',
  rule: '#c9b89a',
  red: '#c8102e',
  green: '#1a5132',
  blue: '#1a4f8b',
  goldBg: '#fff4d6',
  footerBg: '#1c1914',
  footerText: '#f4ead8',
};

export const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});

export const SANS = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'system-ui, sans-serif',
});
