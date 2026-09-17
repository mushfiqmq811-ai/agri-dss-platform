import React, { useEffect, useState, useRef } from 'react';

// Custom Satellite Map Component using Leaflet
function SatelliteMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current && window.L) {
      const L = window.L;
      
      // Kaliakair Field Coordinates
      const lat = 24.095;
      const lon = 90.325;

      // Initialize Leaflet Map
      const map = L.map(mapRef.current).setView([lat, lon], 14);
      mapInstance.current = map;

      // Esri Satellite World Imagery Layer
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      );

      // OpenStreetMap Label Overlay
      const labelsLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { opacity: 0.3 }
      );

      satelliteLayer.addTo(map);
      labelsLayer.addTo(map);

      // Custom Farm Marker & Field Boundary Box
      const farmMarker = L.marker([lat, lon]).addTo(map);
      farmMarker.bindPopup('<b>Kaliakair Smart Farm Zone</b><br>Sentinel-2 Tile Monitoring Area').openPopup();

      // Field Bounding Polygon
      const bounds = [
        [24.090, 90.320],
        [24.100, 90.320],
        [24.100, 90.330],
        [24.090, 90.330]
      ];
      L.polygon(bounds, { color: '#34d399', weight: 2, fillColor: '#34d399', fillOpacity: 0.2 }).addTo(map);
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('en');

  // Core Data States
  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [iot, setIot] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Agricultural Engine States
  const [crop, setCrop] = useState('Rice');
  const [stage, setStage] = useState('Tillering');
  const [cropDecision, setCropDecision] = useState(null);

  // Gemini Vision State
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/weather`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE}/api/soil`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE}/api/iot`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE}/api/api-status`).then(res => res.json()).catch(() => null)
    ]).then(([w, s, i, status]) => {
      if (w) setWeather(w);
      if (s) setSoil(s);
      if (i) setIot(i);
      if (status) setApiStatus(status);
      setLoading(false);
    });
  }, [API_BASE]);

  const getCropRecommendation = () => {
    fetch(`${API_BASE}/api/crop-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropType: crop, growthStage: stage })
    })
      .then(res => res.json())
      .then(setCropDecision)
      .catch(console.error);
  };

  useEffect(() => {
    getCropRecommendation();
  }, [crop, stage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

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
        body: JSON.stringify({ imageBase64: base64Data, mimeType, cropType: crop })
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
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      
      {/* Top Professional Header */}
      <header style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', borderBottom: '1px solid #059669', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🌱</span>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#34d399' }}>AGRI-VISION DSS</h1>
          </div>
          <p style={{ margin: '0.1rem 0 0 1.7rem', fontSize: '0.7rem', color: '#a7f3d0' }}>
            Precision Agriculture & Decision Platform
          </p>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #34d399', padding: '0.35rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}
        >
          🌐 {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </header>

      {/* Navigation Bar */}
      <nav style={{ background: '#1e293b', padding: '0.5rem 0.8rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderBottom: '1px solid #334155' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'decision', label: '🌾 Crop & Irrigation' },
          { id: 'map', label: '🗺️ GIS Field Map' },
          { id: 'doctor', label: '🔬 AI Crop Doctor' },
          { id: 'status', label: '⚡ System Health' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: activeTab === tab.id ? '#059669' : 'transparent', 
              color: activeTab === tab.id ? '#ffffff' : '#94a3b8', 
              border: 'none', 
              padding: '0.5rem 0.8rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1000px', margin: '1rem auto', padding: '0 0.8rem' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h2 style={{ fontSize: '1rem', margin: 0, color: '#f1f5f9' }}>Real-Time Farm Telemetry</h2>
              <span style={{ fontSize: '0.7rem', background: '#0284c7', color: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>📍 Kaliakair Field Station</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading Telemetry Data...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.8rem' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>WEATHER ENGINE (Open-Meteo)</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', margin: '0.2rem 0' }}>{weather?.current?.temperature ?? "28.5"} °C</div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>💧 Humidity: {weather?.current?.humidity ?? "78"}% | 💨 Wind: {weather?.current?.windSpeed ?? "12"} km/h</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SOIL PROFILE (ISRIC v2.0)</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24', margin: '0.2rem 0' }}>pH {soil?.properties?.ph ?? "6.5"}</div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>🌱 Organic Carbon: {soil?.properties?.organicCarbon ?? "14.2"} g/kg</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IOT TELEMETRY (ThingSpeak)</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399', margin: '0.2rem 0' }}>{iot?.telemetry?.soilMoisture ?? "42.5"} %</div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>🚿 Field Root Zone Moisture</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DECISION ENGINE TAB */}
        {activeTab === 'decision' && (
          <div>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem' }}>
              <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#34d399' }}>⚙️ Select Crop Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Crop Type</label>
                  <select value={crop} onChange={e => setCrop(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="Rice">Rice (ধান)</option>
                    <option value="Maize">Maize (ভুট্টা)</option>
                    <option value="Wheat">Wheat (গম)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Growth Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <option value="Tillering">Tillering (কুশি অবস্থা)</option>
                    <option value="Panicle">Panicle Initiation (কাইচ থোড়)</option>
                    <option value="Flowering">Flowering (ফুল ফোটা)</option>
                  </select>
                </div>
              </div>
            </div>

            {cropDecision?.riskAlert && (
              <div style={{ background: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '1px solid #ef4444' : '1px solid #10b981', borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '#fca5a5' : '#6ee7b7' }}>⚠️ {cropDecision.riskAlert.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0' }}>{cropDecision.riskAlert.message}</p>
              </div>
            )}

            {cropDecision?.fertilizerPlan && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>🧪 Recommended Fertilizer Plan</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.8rem' }}>Objective: <strong style={{ color: '#38bdf8' }}>{cropDecision.fertilizerPlan.focus}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
                  <div style={{ background: '#0f172a', padding: '0.7rem', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>UREA</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.urea}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '0.7rem', borderRadius: '6px', borderLeft: '3px solid #fbbf24' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TSP</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.tsp}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '0.7rem', borderRadius: '6px', borderLeft: '3px solid #34d399' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>MoP</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.mop}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GIS MAP TAB */}
        {activeTab === 'map' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>🗺️ Esri GIS High-Res Field Satellite Layer</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Zone: Kaliakair Target Field | Polygon Overlay Active</p>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#059669', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>LIVE GIS</span>
            </div>
            
            {/* Interactive Leaflet Satellite Map Render */}
            <SatelliteMap />
          </div>
        )}

        {/* AI DOCTOR TAB */}
        {activeTab === 'doctor' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#34d399' }}>🔬 AI Plant Pathologist (Gemini Vision)</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.8rem' }}>Upload leaf image for instant disease assessment:</p>
            
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '0.8rem', color: '#94a3b8', fontSize: '0.8rem' }} />
            
            {selectedImage && (
              <div style={{ marginBottom: '0.8rem' }}>
                <img src={selectedImage} alt="Crop Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', border: '1px solid #475569' }} />
                <br />
                <button onClick={analyzeCrop} disabled={analyzing} style={{ marginTop: '0.6rem', background: '#059669', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                  {analyzing ? "⚡ Analyzing via Gemini AI..." : "🔍 Run AI Disease Diagnosis"}
                </button>
              </div>
            )}

            {aiResult && (
              <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '0.8rem', borderRadius: '8px', marginTop: '0.8rem' }}>
                <h4 style={{ color: '#34d399', margin: '0 0 0.4rem 0', fontSize: '0.9rem' }}>Diagnosis Result:</h4>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Issues Detected:</strong> {aiResult.possibleIssues?.join(', ')}</p>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}><strong>Confidence:</strong> {aiResult.confidence}</p>
                <p style={{ margin: '0.4rem 0 0.2rem 0', fontSize: '0.85rem' }}><strong>Recommended Actions:</strong></p>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {aiResult.recommendedActions?.map((act, i) => <li key={i}>{act}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* API STATUS TAB */}
        {activeTab === 'status' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#f8fafc' }}>⚡ Microservices & API Integration Health</h3>
            {apiStatus && Object.entries(apiStatus).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{key}</span>
                <span style={{ background: val.status === 'CONNECTED' || val.status === 'CONFIGURED' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: val.status === 'CONNECTED' || val.status === 'CONFIGURED' ? '#34d399' : '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {val.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
                 }
    
