import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiry = 0;

async function getCopernicusToken() {
  const clientId = process.env.CDSE_CLIENT_ID;
  const clientSecret = process.env.CDSE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const url = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    const res = await fetch(url, { method: 'POST', body: params });
    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + Math.max(60, (data.expires_in || 300) - 60) * 1000;
    return cachedToken;
  } catch {
    return null;
  }
}

export async function getSatelliteObservation(lat = 24.095, lon = 90.325) {
  const token = await getCopernicusToken();
  if (!token) {
    return {
      source: "Copernicus Data Space Ecosystem (Sentinel-2)",
      status: "CREDENTIALS_REQUIRED",
      message: "CDSE credentials are missing or authentication failed.",
      dataCategory: "Satellite Observation"
    };
  }

  return {
    source: "Copernicus Sentinel-2 L2A",
    status: "AUTHENTICATED",
    dataCategory: "Satellite Vegetation Observation",
    timestamp: new Date().toISOString(),
    location: { latitude: Number(lat), longitude: Number(lon) },
    indicator: "NDVI",
    formula: "NDVI = (B08 - B04) / (B08 + B04)",
    note: "Authentication is connected. A production NDVI value requires querying and processing Sentinel-2 imagery for the selected area/date."
  };
}