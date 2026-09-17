import React, { useEffect, useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [iot, setIot] = useState(null);
  const [decision, setDecision] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  // Gemini Vision State
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_BASE}/api/weather`).then(res => res.json()).then(setWeather).catch(console.error);
    fetch(`${API_BASE}/api/soil`).then(res => res.json()).then(setSoil).catch(console.error);
    fetch(`${API_BASE}/api/iot`).then(res => res.json()).then(setIot).catch(console.error);
    fetch(`${API_BASE}/api/irrigation`).then(res => res.json()).then(setDecision).catch(console.error);
    fetch(`${API_BASE}/api/api-status`).then(res => res.json()).then(setApiStatus).catch(console.error);
  }, [API_BASE]);

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Crop Doctor
  const analyzeCrop = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setAiResult(null);

    const base64Data = selectedImage.split(',')[1];
    const mimeType = selectedImage.split(';')[0].split(':')[1];

    try {
      const res = await fetch(`${API_BASE}/api/crop-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType, cropType: "Paddy/Rice" })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Smart Agriculture Decision Support System</h1>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Built for Bangladesh. Designed for the World.</p>
      </header>

      {/* Navigation */}
      <nav style={{ background: '#111827', padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <button style={{ background: activeTab === 'dashboard' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button style={{ background: activeTab === 'farmer' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('farmer')}>Farmer Mode</button>
        <button style={{ background: activeTab === 'doctor' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('doctor')}>AI Crop Doctor</button>
        <button style={{ background: activeTab === 'status' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('status')}>API Status</button>
      </nav>

      <main className="container">
        {activeTab === 'dashboard' && (
          <div>
            <h2>Real-Data DSS Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="card">
                <h3>Weather Intelligence</h3>
                <div className="metric-val">{weather?.current?.temperature ?? "--"} °C</div>
                <p>Humidity: <strong>{weather?.current?.humidity ?? "--"}%</strong></p>
              </div>
              <div className="card">
                <h3>Soil Intelligence</h3>
                <div className="metric-val">pH {soil?.properties?.ph ?? "--"}</div>
                <p>Organic Carbon: <strong>{soil?.properties?.organicCarbon ?? "--"} g/kg</strong></p>
              </div>
              <div className="card">
                <h3>IoT Telemetry</h3>
                <div className="metric-val">{iot?.telemetry?.soilMoisture ?? "--"} %</div>
                <p>Soil Moisture Level</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'farmer' && (
          <div>
            <h2>Farmer Mode</h2>
            {decision && (
              <div className="card" style={{ borderLeft: '5px solid #16a34a', background: '#f0fdf4' }}>
                <h3>{decision.status}</h3>
                <p><strong>{decision.recommendation}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* AI CROP DOCTOR TAB */}
        {activeTab === 'doctor' && (
          <div>
            <h2>AI Crop Doctor (Gemini Vision)</h2>
            <div className="card">
              <p>Upload a leaf image to analyze plant disease using Gemini Vision AI:</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '1rem' }} />
              
              {selectedImage && (
                <div style={{ marginBottom: '1rem' }}>
                  <img src={selectedImage} alt="Crop Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                  <br />
                  <button onClick={analyzeCrop} disabled={analyzing} style={{ marginTop: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    {analyzing ? "Analyzing Image..." : "Analyze Disease"}
                  </button>
                </div>
              )}

              {aiResult && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
                  {aiResult.status === "CREDENTIALS_REQUIRED" ? (
                    <p style={{ color: '#b45309' }}><strong>Note:</strong> Gemini API Key is missing in Render Environment Variables. Add <code>GEMINI_API_KEY</code> to enable live AI vision diagnostics.</p>
                  ) : (
                    <div>
                      <h4 style={{ color: '#166534', margin: '0 0 0.5rem 0' }}>Diagnosis Result:</h4>
                      <p><strong>Issues Detected:</strong> {aiResult.possibleIssues?.join(', ')}</p>
                      <p><strong>Confidence:</strong> {aiResult.confidence}</p>
                      <p><strong>Recommended Actions:</strong></p>
                      <ul>{aiResult.recommendedActions?.map((act, i) => <li key={i}>{act}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div>
            <h2>System API Integration Status</h2>
            <div className="card">
              {apiStatus && Object.entries(apiStatus).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span><strong>{key}</strong></span>
                  <span style={{ background: val.status === 'CONNECTED' || val.status === 'CONFIGURED' ? '#dcfce7' : '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{val.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
        }
                  
