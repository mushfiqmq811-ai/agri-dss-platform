import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getNormalizedWeather } from './adapters/weatherAdapter.js';
import { getNormalizedSoil } from './adapters/soilAdapter.js';
import { getNormalizedIoT } from './adapters/iotAdapter.js';
import { analyzeCropDisease } from './adapters/aiAdapter.js';
import { getSatelliteObservation } from './adapters/satelliteAdapter.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get('/api/api-status', (req, res) => {
  res.json({
    openMeteo: { status: "CONNECTED", type: "Live Forecast API" },
    soilGrids: { status: "CONNECTED", type: "Modeled Data API" },
    thingSpeak: { status: "CONNECTED", type: "External Public Feed" },
    copernicusSentinel: {
      status: process.env.CDSE_CLIENT_ID && process.env.CDSE_CLIENT_SECRET ? "CONFIGURED" : "CREDENTIALS_REQUIRED",
      type: "Satellite Observation"
    },
    geminiAI: {
      status: process.env.GEMINI_API_KEY ? "CONFIGURED" : "NOT_CONFIGURED",
      type: "Vision Diagnosis Model"
    }
  });
});

app.get('/api/weather', async (req, res) => {
  try { res.json(await getNormalizedWeather(req.query.lat ?? 24.095, req.query.lon ?? 90.325)); }
  catch (err) { res.status(503).json({ error: "Weather Data Unavailable", message: err.message }); }
});

app.get('/api/soil', async (req, res) => {
  try { res.json(await getNormalizedSoil(req.query.lat ?? 24.095, req.query.lon ?? 90.325)); }
  catch (err) { res.status(503).json({ error: "Soil Data Unavailable", message: err.message }); }
});

app.get('/api/iot', async (req, res) => {
  try { res.json(await getNormalizedIoT(req.query.channel ?? '2987883')); }
  catch (err) { res.status(503).json({ error: "IoT Feed Unavailable", message: err.message }); }
});

app.post('/api/crop-doctor', async (req, res) => {
  try { res.json(await analyzeCropDisease(req.body)); }
  catch (err) { res.status(500).json({ error: "Crop Doctor Failed", message: err.message }); }
});

app.get('/api/satellite', async (req, res) => {
  try { res.json(await getSatelliteObservation(req.query.lat ?? 24.095, req.query.lon ?? 90.325)); }
  catch (err) { res.status(503).json({ error: "Satellite Data Unavailable", message: err.message }); }
});

app.post('/api/irrigation-engine', (req, res) => {
  const { soilMoisture, rainProbability, forecastPrecip, cropType = "crop", stage = "current" } = req.body;
  const sm = Number(soilMoisture);
  const rp = Number(rainProbability);
  const fp = Number(forecastPrecip);
  let recommendation = "INSUFFICIENT_DATA";
  const factors = [];

  if ([sm, rp, fp].every(Number.isFinite)) {
    if (rp > 50 || fp > 5) {
      recommendation = "IRRIGATION_DELAYED";
      factors.push(`Forecast rainfall is significant (${fp} mm) with probability ${rp}%.`);
      factors.push("Delaying irrigation may reduce unnecessary water use.");
    } else if (sm < 35) {
      recommendation = "IRRIGATION_RECOMMENDED";
      factors.push(`Reported soil moisture (${sm}%) is below the configured 35% advisory threshold for ${cropType} at ${stage} stage.`);
    } else {
      recommendation = "IRRIGATION_NOT_REQUIRED";
      factors.push(`Reported root-zone soil moisture (${sm}%) is above the configured advisory threshold.`);
    }
  }

  res.json({ recommendation, factors, timestamp: new Date().toISOString(), advisoryNote: "Thresholds are simplified decision-support rules and should be calibrated for crop, soil and local field conditions." });
});

app.listen(PORT, () => console.log(`Smart Agri DSS Backend running on http://localhost:${PORT}`));