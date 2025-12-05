import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateValueProposition = async (role: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the marketing AI for "Scedge", a futuristic AI-powered project scheduling and resource optimization app. 
      
      Write a single, punchy, impressive sentence (max 25 words) explaining specifically why Scedge is a game-changer for a "${role}".
      Focus on pain points like "conflict resolution", "timeline slippage", or "resource burnout" relevant to that role.
      Do not use hashtags. Be professional yet visionary.`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating value prop:", error);
    return "Optimize your workflows and predict bottlenecks before they happen with Scedge's adaptive AI core.";
  }
};
