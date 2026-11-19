import Constants from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

const PROD_ORIGIN = 'https://www.villacomunalelecce.it';

function extractHttpOrigin(candidate) {
  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const withScheme = trimmed.match(/^([a-zA-Z0-9+.-]+):\/\/([^/?#]+)/);
  if (withScheme) {
    const scheme = withScheme[1].toLowerCase();
    const host = withScheme[2];
    if (!host || host === 'localhost' || host.startsWith('127.0.0.1') || host.startsWith('localhost:')) {
      return null;
    }
    const useHttps =
      scheme === 'https' ||
      scheme === 'exps' ||
      host.endsWith('.exp.direct') ||
      host.includes('.ngrok');
    return `${useHttps ? 'https' : 'http'}://${host}`;
  }

  const hostOnly = trimmed.split('/')[0];
  if (
    hostOnly &&
    hostOnly !== 'localhost' &&
    !hostOnly.startsWith('127.') &&
    !hostOnly.startsWith('localhost:')
  ) {
    const useHttps = hostOnly.endsWith('.exp.direct') || hostOnly.includes('.ngrok');
    return `${useHttps ? 'https' : 'http'}://${hostOnly}`;
  }

  return null;
}

function getScriptUrlFromRuntime() {
  try {
    const turbo = TurboModuleRegistry?.get?.('SourceCode');
    const url = turbo?.getConstants?.()?.scriptURL;
    if (url) return url;
  } catch {
    // ignore
  }
  return NativeModules?.SourceCode?.scriptURL || null;
}

function detectApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }

    const candidates = [
      getScriptUrlFromRuntime(),
      Constants?.experienceUrl,
      Constants?.expoConfig?.hostUri,
      Constants?.manifest2?.extra?.expoGo?.debuggerHost,
      Constants?.manifest?.debuggerHost,
      Constants?.linkingUri,
    ];

    for (const candidate of candidates) {
      const origin = extractHttpOrigin(candidate);
      if (origin) return origin;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000';
    }
    return 'http://localhost:4000';
  }

  return PROD_ORIGIN;
}

export const API_BASE_URL = detectApiBaseUrl();

export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const prefix = pathOrUrl.startsWith('/') ? '' : '/';
  return `${API_BASE_URL}${prefix}${pathOrUrl}`;
}

export async function apiGet(path, token = null) {
  const headers = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': '1',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Errore HTTP ${res.status}`);
  }
  return data;
}

export async function apiPost(path, body, token = null) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Errore HTTP ${res.status}`);
  }
  return data;
}

export async function fetchLecceWeather() {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=40.352&longitude=18.172&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome&forecast_days=1';
  const res = await fetch(url);
  if (!res.ok) throw new Error('meteo');
  const data = await res.json();
  const code = data.current.weather_code;
  let label = 'Variabile';
  if (code === 0) label = 'Sereno';
  else if (code === 1) label = 'Poco nuvoloso';
  else if (code === 2) label = 'Parz. nuvoloso';
  else if (code === 3) label = 'Coperto';
  else if (code === 45 || code === 48) label = 'Nebbia';
  else if (code >= 51 && code <= 67) label = 'Pioggia';
  else if (code >= 80 && code <= 82) label = 'Rovesci';
  else if (code >= 95) label = 'Temporale';
  return {
    temp: Math.round(data.current.temperature_2m),
    min: Math.round(data.daily.temperature_2m_min[0]),
    max: Math.round(data.daily.temperature_2m_max[0]),
    label,
  };
}
