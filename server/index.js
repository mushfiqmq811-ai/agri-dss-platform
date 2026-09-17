import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Open-Meteo Weather Proxy Endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat || 24.095;
    const lon = req.query.lon || 90.325;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FDhaka`;
    
    const response = await fetch(url);
    const data = await response.json();

    res.json({
      source: "Open-Meteo API",
      timestamp: new Date().toISOString(),
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m
      },
      forecast: data.daily
    });
  } catch (err) {
    res.status(502).json({ error: "Weather API Unavailable", message: err.message });
  }
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", service: "Smart Agriculture DSS Backend", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
      
