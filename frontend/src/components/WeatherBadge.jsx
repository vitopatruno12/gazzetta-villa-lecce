import { useEffect, useState } from 'react';

const FORECAST_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=40.352&longitude=18.172&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome&forecast_days=1';

function describe(code) {
  if (code === 0) return { label: 'Sereno', kind: 'clear' };
  if (code === 1) return { label: 'Poco nuvoloso', kind: 'clear' };
  if (code === 2) return { label: 'Parzialmente nuvoloso', kind: 'cloud' };
  if (code === 3) return { label: 'Coperto', kind: 'overcast' };
  if (code === 45 || code === 48) return { label: 'Nebbia', kind: 'fog' };
  if (code >= 51 && code <= 57) return { label: 'Pioggerella', kind: 'rain' };
  if (code >= 61 && code <= 67) return { label: 'Pioggia', kind: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Neve', kind: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Rovesci', kind: 'rain' };
  if (code === 85 || code === 86) return { label: 'Neve', kind: 'snow' };
  if (code >= 95) return { label: 'Temporale', kind: 'storm' };
  return { label: 'Variabile', kind: 'cloud' };
}

function WeatherIcon({ kind }) {
  if (kind === 'clear') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="5.5" fill="#e0a106" />
        <g stroke="#c4840a" strokeWidth="1.6" strokeLinecap="round">
          <path d="M16 3.8v3.2M16 25v3.2M3.8 16h3.2M25 16h3.2M7.2 7.2l2.3 2.3M22.5 22.5l2.3 2.3M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3" />
        </g>
      </svg>
    );
  }
  if (kind === 'rain' || kind === 'storm') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#8d97a3" d="M11.2 18.2h9.2a4.4 4.4 0 0 0 .4-8.8 5.6 5.6 0 0 0-10.8 1.6 3.6 3.6 0 0 0 1.2 7.2z" />
        <g stroke={kind === 'storm' ? '#c8102e' : '#3d6f9a'} strokeWidth="1.6" strokeLinecap="round">
          <path d="M12.2 21.2l-1.2 3.2M16.4 21.2l-1.2 3.2M20.6 21.2l-1.2 3.2" />
        </g>
      </svg>
    );
  }
  if (kind === 'snow') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#8d97a3" d="M11.2 17.2h9.2a4.4 4.4 0 0 0 .4-8.8 5.6 5.6 0 0 0-10.8 1.6 3.6 3.6 0 0 0 1.2 7.2z" />
        <g stroke="#d7e4ef" strokeWidth="1.4" strokeLinecap="round">
          <path d="M12 22.2v3.2M10.4 23.8h3.2M16 22.2v3.2M14.4 23.8h3.2M20 22.2v3.2M18.4 23.8h3.2" />
        </g>
      </svg>
    );
  }
  if (kind === 'fog') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <g stroke="#8a8174" strokeWidth="1.7" strokeLinecap="round">
          <path d="M7 12.5h18M6 16.5h20M8 20.5h16M10 24.5h12" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="#e0a106" />
      <path fill="#8d97a3" d="M12.5 19.2h9.4a4.2 4.2 0 0 0 .3-8.4 5.2 5.2 0 0 0-9.6 1.2 3.4 3.4 0 0 0-.1 7.2z" />
    </svg>
  );
}

export default function WeatherBadge() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(FORECAST_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('meteo');
        return response.json();
      })
      .then((data) => {
        const temp = Math.round(data.current.temperature_2m);
        const max = Math.round(data.daily.temperature_2m_max[0]);
        const min = Math.round(data.daily.temperature_2m_min[0]);
        setWeather({ temp, max, min, ...describe(data.current.weather_code) });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!weather) return null;

  return (
    <p
      className="masthead-weather"
      role="status"
      aria-label={`Meteo a Lecce: ${weather.temp} gradi, ${weather.label}, minima ${weather.min}, massima ${weather.max}`}
    >
      <span className="masthead-weather-temp">{weather.temp}°</span>
      <WeatherIcon kind={weather.kind} />
      <span className="masthead-weather-meta">
        <strong>Lecce</strong> - {weather.label} · min {weather.min}° max {weather.max}°
      </span>
    </p>
  );
}
