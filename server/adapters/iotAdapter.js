import fetch from 'node-fetch';

export async function getNormalizedIoT(channelId = '2987883') {
  const url = `https://api.thingspeak.com/channels/${encodeURIComponent(channelId)}/feeds.json?results=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ThingSpeak HTTP error! Status: ${response.status}`);
  const data = await response.json();
  const lastFeed = data.feeds?.[0] || {};

  return {
    source: `ThingSpeak Public Feed (Channel ${channelId})`,
    sourceType: "External Public Feed",
    ownership: "External Development / Demo Feed (Not Project Owned)",
    timestamp: lastFeed.created_at || new Date().toISOString(),
    telemetry: {
      soilMoisture: lastFeed.field1 != null ? Number(lastFeed.field1) : null,
      temperature: lastFeed.field2 != null ? Number(lastFeed.field2) : null,
      humidity: lastFeed.field3 != null ? Number(lastFeed.field3) : null
    }
  };
}