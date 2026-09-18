import fetch from 'node-fetch';

export async function getNormalizedSoil(lat = 24.095, lon = 90.325) {
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${encodeURIComponent(lon)}&lat=${encodeURIComponent(lat)}&property=phh2o&property=soc&property=clay&depth=0-5cm&value=mean`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`SoilGrids HTTP error! Status: ${response.status}`);
  const data = await response.json();

  const layers = data.properties?.layers || [];
  const phLayer = layers.find(l => l.name === 'phh2o')?.depths?.[0]?.values?.mean;
  const socLayer = layers.find(l => l.name === 'soc')?.depths?.[0]?.values?.mean;
  const clayLayer = layers.find(l => l.name === 'clay')?.depths?.[0]?.values?.mean;

  return {
    source: "ISRIC SoilGrids v2.0",
    dataCategory: "Modeled Soil Data (Not Live Sensor)",
    timestamp: new Date().toISOString(),
    location: { latitude: Number(lat), longitude: Number(lon) },
    properties: {
      ph: phLayer != null ? (phLayer / 10).toFixed(2) : "Data Unavailable",
      organicCarbon: socLayer != null ? (socLayer / 10).toFixed(2) : "Data Unavailable",
      clayContent: clayLayer != null ? (clayLayer / 10).toFixed(1) : "Data Unavailable"
    },
    limitations: "Global digital soil mapping data; values are modeled estimates rather than field sensor measurements."
  };
}