import React, { useEffect, useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [iot, setIot] = useState(null);
  const [decision, setDecision] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE}/api/weather`).then(res => res.json()).then(setWeather).catch(console.error);
    fetch(`${API_BASE}/api/soil`).then(res => res.json()).then(setSoil).catch(console.error);
    fetch(`${API_BASE}/api/iot`).then(res => res.json()).then(setIot).catch(console.error);
    fetch(`${API_BASE}/api/irrigation`).then(res => res.json()).then(setDecision).catch(console.error);
    fetch(`${API_BASE}/api/api-status`).then(res => res.json()).then(setApiStatus).catch(console.error);
  }, [API_BASE]);

  return (
    <div>
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Smart Agriculture Decision Support System</h1>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Built for Bangladesh. Designed for the World.</p>
      </header>

      {/* Navigation Bar */}
      <nav style={{ background: '#111827', padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <button 
          style={{ background: activeTab === 'dashboard' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          style={{ background: activeTab === 'farmer' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => setActiveTab('farmer')}
        >
          Farmer Mode
        </button>
        <button 
          style={{ background: activeTab === 'status' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => setActiveTab('status')}
        >
          API Status
        </button>
      </nav>

      <main className="container">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h2>Real-Data DSS Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              
              <div className="card">
                <h3>Weather Intelligence</h3>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {weather?.source || "Loading..."}
                </span>
                <div className="metric-val">{weather?.current?.temperature ?? "--"} °C</div>
                <p>Humidity: <strong>{weather?.current?.humidity ?? "--"}%</strong></p>
                <p>Wind Speed: <strong>{weather?.current?.windSpeed ?? "--"} km/h</strong></p>
              </div>

              <div className="card">
                <h3>Soil Intelligence</h3>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {soil?.source || "Loading..."}
                </span>
                <div className="metric-val">pH {soil?.properties?.ph ?? "--"}</div>
                <p>Organic Carbon: <strong>{soil?.properties?.organicCarbon ?? "--"} g/kg</strong></p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Data Type: Modeled Spatial</p>
              </div>

              <div className="card">
                <h3>IoT Telemetry</h3>
                <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {iot?.sourceType || "Loading..."}
                </span>
                <div className="metric-val">{iot?.telemetry?.soilMoisture ?? "--"} %</div>
                <p>Soil Moisture Level</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Source: {iot?.source}</p>
              </div>

            </div>
          </div>
        )}

        {/* FARMER MODE TAB */}
        {activeTab === 'farmer' && (
          <div>
            <h2>Farmer Mode: What Should I Do Today?</h2>
            {decision ? (
              <div className="card" style={{ borderLeft: '5px solid #16a34a', background: '#f0fdf4' }}>
                <h3 style={{ margin: 0, color: '#166534' }}>1. {decision.status}</h3>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{decision.recommendation}</p>
                
                <p><strong>Why this decision?</strong></p>
                <ul>
                  {decision.why?.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>

                <p><strong>Data Evidence:</strong></p>
                <ul>
                  {decision.evidence?.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>
            ) : (
              <p>Analyzing farm metrics...</p>
            )}
          </div>
        )}

        {/* API STATUS TAB */}
        {activeTab === 'status' && (
          <div>
            <h2>System API Integration Status</h2>
            <div className="card">
              {apiStatus ? Object.entries(apiStatus).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: 'bold' }}>{key}</span>
                  <div>
                    <span style={{ marginRight: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>{val.type}</span>
                    <span style={{ background: val.status === 'CONNECTED' ? '#dcfce7' : '#fef3c7', color: val.status === 'CONNECTED' ? '#166534' : '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {val.status}
                    </span>
                  </div>
                </div>
              )) : <p>Checking API Status...</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
                  }
                         
