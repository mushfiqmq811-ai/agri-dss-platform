import React, { useEffect, useState } from 'react';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Render Backend URL (Replace with your actual backend URL)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE}/api/weather`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Fetch Error:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  return (
    <div>
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Smart Agriculture Decision Support System</h1>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Built for Bangladesh. Designed for the World.</p>
      </header>

      <main className="container">
        <h2>Live Real-Data Dashboard</h2>
        
        <div className="card">
          <h3>Weather Intelligence</h3>
          {loading ? (
            <p>Fetching real-time weather from Open-Meteo...</p>
          ) : weather && weather.current ? (
            <div>
              <p>Source: <strong>{weather.source}</strong></p>
              <div className="metric-val">{weather.current.temperature} °C</div>
              <p>Humidity: <strong>{weather.current.humidity}%</strong></p>
              <p>Wind Speed: <strong>{weather.current.windSpeed} km/h</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last Updated: {weather.timestamp}</p>
            </div>
          ) : (
            <p style={{ color: '#dc2626' }}>Weather Data Unavailable (Check API connection)</p>
          )}
        </div>
      </main>
    </div>
  );
      }
              
