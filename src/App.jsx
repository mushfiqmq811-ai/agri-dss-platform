import React, { useEffect, useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('en'); // Language Toggle State ('en' | 'bn')

  // Agricultural States
  const [crop, setCrop] = useState('Rice');
  const [stage, setStage] = useState('Tillering');
  const [cropDecision, setCropDecision] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Fetch Crop Decision Logic
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

  return (
    <div>
      {/* Top Header with Multilingual Switcher */}
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>
            {lang === 'en' ? 'Smart Agriculture Decision Support Engine' : 'স্মার্ট কৃষি সিদ্ধান্ত সহায়তা প্ল্যাটফর্ম'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
            {lang === 'en' ? 'AI + Data-Driven Precision Farming Platform' : 'এআই এবং ডাটা-চালিত আধুনিক কৃষি ব্যবস্থা'}
          </p>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {lang === 'en' ? 'বাংলা' : 'English'}
        </button>
      </header>

      {/* Navigation */}
      <nav style={{ background: '#111827', padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        <button style={{ background: activeTab === 'dashboard' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('dashboard')}>
          {lang === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}
        </button>
        <button style={{ background: activeTab === 'decision' ? '#16a34a' : 'transparent', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px' }} onClick={() => setActiveTab('decision')}>
          {lang === 'en' ? 'Crop & Fertilizer Engine' : 'ফসলের সার ও সেচ প্ল্যান'}
        </button>
      </nav>

      <main className="container">
        {activeTab === 'decision' && (
          <div>
            <h2>{lang === 'en' ? 'Smart Crop Management Engine' : 'স্মার্ট ফসল ব্যবস্থাপনা ইন্টেলিজেন্স'}</h2>
            
            {/* Controls */}
            <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Crop Type:</label>
                <select value={crop} onChange={e => setCrop(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px' }}>
                  <option value="Rice">Rice (ধান)</option>
                  <option value="Maize">Maize (ভুট্টা)</option>
                  <option value="Wheat">Wheat (গম)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 'bold' }}>Growth Stage:</label>
                <select value={stage} onChange={e => setStage(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px' }}>
                  <option value="Tillering">Tillering (কুশি অবস্থা)</option>
                  <option value="Panicle">Panicle Initiation (কাইচ থোড়)</option>
                  <option value="Flowering">Flowering (ফুল ফোটা)</option>
                </select>
              </div>
            </div>

            {/* Risk Alert Panel */}
            {cropDecision && cropDecision.riskAlert && (
              <div className="card" style={{ 
                borderLeft: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '5px solid #dc2626' : '5px solid #16a34a',
                background: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '#fef2f2' : '#f0fdf4'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: cropDecision.riskAlert.level === 'HIGH_FLOOD_RISK' ? '#991b1b' : '#166534' }}>
                  ⚠️ {cropDecision.riskAlert.title}
                </h3>
                <p>{cropDecision.riskAlert.message}</p>
              </div>
            )}

            {/* Fertilizer Plan */}
            {cropDecision && cropDecision.fertilizerPlan && (
              <div className="card">
                <h3>{lang === 'en' ? 'Targeted N-P-K Fertilizer Dosing' : 'সুনির্দিষ্ট সার প্রয়োগ নির্দেশিকা'}</h3>
                <p><strong>Focus Goal:</strong> {cropDecision.fertilizerPlan.focus}</p>
                <ul>
                  <li>Urea (ইউরিয়া): <strong>{cropDecision.fertilizerPlan.urea}</strong></li>
                  <li>TSP (টিএসপি): <strong>{cropDecision.fertilizerPlan.tsp}</strong></li>
                  <li>MoP (এমওপি): <strong>{cropDecision.fertilizerPlan.mop}</strong></li>
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
                   }
                  
