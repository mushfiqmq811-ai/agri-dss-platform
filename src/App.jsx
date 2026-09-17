import React, { useEffect, useState } from 'react';

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
      fetch(`${API_BASE}/api/weather`).then(res => res.json()).catch(err => null),
      fetch(`${API_BASE}/api/soil`).then(res => res.json()).catch(err => null),
      fetch(`${API_BASE}/api/iot`).then(res => res.json()).catch(err => null),
      fetch(`${API_BASE}/api/api-status`).then(res => res.json()).catch(err => null)
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
      <header style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', borderBottom: '1px solid #059669', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌱</span>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#34d399' }}>
              {lang === 'en' ? 'AGRI-VISION DSS' : 'অ্যাগ্রি-ভিশন ডিএসএস'}
            </h1>
          </div>
          <p style={{ margin: '0.2rem 0 0 2rem', fontSize: '0.75rem', color: '#a7f3d0', opacity: 0.9 }}>
            {lang === 'en' ? 'Data-Driven Precision Agriculture & AI Decision Platform' : 'ডাটা-চালিত আধুনিক কৃষি ও এআই সিদ্ধান্ত প্ল্যাটফর্ম'}
          </p>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #34d399', padding: '0.4rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}
        >
          🌐 {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </header>

      {/* Navigation Bar */}
      <nav style={{ background: '#1e293b', padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid #334155' }}>
        {[
          { id: 'dashboard', label: lang === 'en' ? '📊 Dashboard' : '📊 ড্যাশবোর্ড' },
          { id: 'decision', label: lang === 'en' ? '🌾 Crop & Irrigation' : '🌾 ফসল ও সেচ' },
          { id: 'map', label: lang === 'en' ? '🗺️ GIS Field Map' : '🗺️ জিআইএস ম্যাপ' },
          { id: 'doctor', label: lang === 'en' ? '🔬 AI Crop Doctor' : '🔬 এআই ফসল ডাক্তার' },
          { id: 'status', label: lang === 'en' ? '⚡ System Health' : '⚡ সিস্টেম হেলথ' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: activeTab === tab.id ? '#059669' : 'transparent', 
              color: activeTab === tab.id ? '#ffffff' : '#94a3b8', 
              border: 'none', 
              padding: '0.55rem 1rem', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#f1f5f9', fontWeight: '700' }}>
                {lang === 'en' ? 'Real-Time Farm Telemetry' : 'রিয়েল-টাইম ফার্ম ডাটা'}
              </h2>
              <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                📍 Kaliakair Field Station
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <p>⚡ Fetching live telemetry from Open-Meteo, SoilGrids & ThingSpeak...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                
                {/* Weather Card */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <span>WEATHER ENGINE</span>
                    <span style={{ color: '#38bdf8' }}>{weather?.source || 'Open-Meteo'}</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f8fafc', margin: '0.2rem 0' }}>
                    {weather?.current?.temperature ?? "28.5"} °C
                  </div>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>💧 Humidity: <strong style={{ color: '#f8fafc' }}>{weather?.current?.humidity ?? "78"}%</strong></div>
                    <div>💨 Wind: <strong style={{ color: '#f8fafc' }}>{weather?.current?.windSpeed ?? "12"} km/h</strong></div>
                  </div>
                </div>

                {/* Soil Card */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <span>SOIL PROFILE</span>
                    <span style={{ color: '#fbbf24' }}>ISRIC v2.0</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fbbf24', margin: '0.2rem 0' }}>
                    pH {soil?.properties?.ph ?? "6.5"}
                  </div>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    🌱 Organic Carbon: <strong style={{ color: '#f8fafc' }}>{soil?.properties?.organicCarbon ?? "14.2"} g/kg</strong>
                  </div>
                </div>

                {/* IoT Sensor Card */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <span>IOT TELEMETRY</span>
                    <span style={{ color: '#34d399' }}>ThingSpeak</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#34d399', margin: '0.2rem 0' }}>
                    {iot?.telemetry?.soilMoisture ?? "42.5"} %
                  </div>
                  <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    🚿 Field Root Zone Moisture
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* DECISION ENGINE TAB */}
        {activeTab === 'decision' && (
          <div>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#34d399' }}>⚙️ Select Crop Specifications</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Crop Type</label>
                  <select value={crop} onChange={e => setCrop(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}>
                    <option value="Rice">Rice (ধান)</option>
                    <option value="Maize">Maize (ভুট্টা)</option>
                    <option value="Wheat">Wheat (গম)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Growth Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}>
                    <option value="Tillering">Tillering (কুশি অবস্থা)</option>
                    <option value="Panicle">Panicle Initiation (কাইচ থোড়)</option>
                    <option value="Flowering">Flowering (ফুল ফোটা)</option>
                  </select>
                </div>
              </div>
            </div>

            {cropDecision?.riskAlert && (
              <div style={{ 
                background: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                border: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '1px solid #ef4444' : '1px solid #10b981',
                borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem'
              }}>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '#fca5a5' : '#6ee7b7' }}>
                  ⚠️ {cropDecision.riskAlert.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0' }}>{cropDecision.riskAlert.message}</p>
              </div>
            )}

            {cropDecision?.fertilizerPlan && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem' }}>
                <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', color: '#f8fafc' }}>🧪 Recommended Fertilizer Plan</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Objective: <strong style={{ color: '#38bdf8' }}>{cropDecision.fertilizerPlan.focus}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                  <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>UREA</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.urea}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid #fbbf24' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TSP</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.tsp}</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid #34d399' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MoP</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{cropDecision.fertilizerPlan.mop}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GIS MAP TAB */}
        {activeTab === 'map' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#f8fafc' }}>🗺️ Spatial Field Map & Boundary</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>Coordinate: 24.095° N, 90.325° E (Kaliakair Zone)</p>
            <div style={{ width: '100%', height: '360px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #475569' }}>
              <iframe 
                title="Field Map"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=90.305%2C24.075%2C90.345%2C24.115&amp;layer=mapnik&amp;marker=24.095%2C90.325"
              ></iframe>
            </div>
          </div>
        )}

        {/* AI DOCTOR TAB */}
        {activeTab === 'doctor' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#34d399' }}>🔬 AI Plant Pathologist (Gemini Vision)</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Upload a photo of damaged crop leaf for AI diagnosis:</p>
            
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
            
            {selectedImage && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={selectedImage} alt="Crop Preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', border: '1px solid #475569' }} />
                <br />
                <button onClick={analyzeCrop} disabled={analyzing} style={{ marginTop: '0.8rem', background: '#059669', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  {analyzing ? "⚡ Analyzing via Gemini AI..." : "🔍 Run AI Disease Diagnosis"}
                </button>
              </div>
            )}

            {aiResult && (
              <div style={{ background: '#0f172a', border: '1px solid #334155', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                {aiResult.status === "CREDENTIALS_REQUIRED" ? (
                  <p style={{ color: '#fbbf24', margin: 0 }}>⚠️ Gemini API Key missing in environment settings.</p>
                ) : (
                  <div>
                    <h4 style={{ color: '#34d399', margin: '0 0 0.5rem 0' }}>Diagnosis Result:</h4>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}><strong>Issues Detected:</strong> {aiResult.possibleIssues?.join(', ')}</p>
                    <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}><strong>Confidence:</strong> {aiResult.confidence}</p>
                    <p style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '0.9rem' }}><strong>Recommended Actions:</strong></p>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {aiResult.recommendedActions?.map((act, i) => <li key={i}>{act}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* API STATUS TAB */}
        {activeTab === 'status' && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#f8fafc' }}>⚡ Microservices & API Integration Health</h3>
            {apiStatus && Object.entries(apiStatus).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{key}</span>
                <span style={{ background: val.status === 'CONNECTED' || val.status === 'CONFIGURED' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: val.status === 'CONNECTED' || val.status === 'CONFIGURED' ? '#34d399' : '#fbbf24', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
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
        
