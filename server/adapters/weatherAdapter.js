import fetch from 'node-fetch';

export async function getNormalizedWeather(lat = 24.095, lon = 90.325) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&timezone=Asia%2FDhaka`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo HTTP error! Status: ${response.status}`);
  const data = await response.json();

  return {
    source: "Open-Meteo Weather API",
    dataCategory: "Forecast / Model Data",
    timestamp: new Date().toISOString(),
    location: { latitude: Number(lat), longitude: Number(lon), timezone: data.timezone },
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      rain: data.current.rain,
      windSpeed: data.current.wind_speed_10m
    },
    dailyForecast: data.daily.time.map((time, idx) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[idx],
      minTemp: data.daily.temperature_2m_min[idx],
      precipitationSum: data.daily.precipitation_sum[idx],
      et0: data.daily.et0_fao_evapotranspiration[idx]
    }))
  };
}