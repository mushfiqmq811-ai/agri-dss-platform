import { GoogleGenAI } from '@google/genai';

export async function analyzeCropDisease({ imageBase64, mimeType, cropType, weatherContext }) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      status: "NOT_CONFIGURED",
      error: "GEMINI_API_KEY environment variable is missing on backend server.",
      message: "Configure GEMINI_API_KEY in server/.env to enable AI Crop Doctor."
    };
  }
  if (!imageBase64 || !mimeType) {
    throw new Error("Image data and MIME type are required.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const systemPrompt = `You are a scientific agricultural pathologist. Analyze the provided leaf image and context.
Do not claim certainty from an image alone. Output ONLY valid JSON:
{
  "crop": "${cropType || 'Unspecified'}",
  "possibleIssues": ["Possible condition 1"],
  "confidence": "Low | Moderate | High",
  "observations": ["Observed visual symptom 1"],
  "recommendedActions": ["Recommended action 1"],
  "why": ["Scientific reason 1"],
  "limitations": ["Visual diagnosis is preliminary; field or laboratory verification may be required."]
}
Avoid prescribing hazardous chemicals or giving unsafe application instructions.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: systemPrompt + (weatherContext ? `\nWeather context: ${JSON.stringify(weatherContext)}` : '') },
        { inlineData: { data: imageBase64, mimeType } }
      ]
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse structured JSON from AI response.");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    return { status: "ERROR", error: "AI Processing Failed", message: err.message };
  }
}