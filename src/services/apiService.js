const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { const body = await res.json(); message = body.message || body.error || message; } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const getHealthStatus = () => request(`${API_BASE}/api/health`);
export const getApiStatusCenter = () => request(`${API_BASE}/api/api-status`);
export const getWeatherData = (lat=24.095, lon=90.325) => request(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`);
export const getSoilData = (lat=24.095, lon=90.325) => request(`${API_BASE}/api/soil?lat=${lat}&lon=${lon}`);
export const getIotData = (channel='2987883') => request(`${API_BASE}/api/iot?channel=${channel}`);
export const getSatelliteData = (lat=24.095, lon=90.325) => request(`${API_BASE}/api/satellite?lat=${lat}&lon=${lon}`);

export const analyzeCropVision = (imageBase64, mimeType, cropType) =>
  request(`${API_BASE}/api/crop-doctor`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ imageBase64, mimeType, cropType })
  });

export const getIrrigationDecision = payload =>
  request(`${API_BASE}/api/irrigation-engine`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
