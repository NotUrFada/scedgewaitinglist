import { GoogleGenAI } from "@google/genai";

// Lazy initialization - only create client when needed and API key is available
let aiClient: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI | null => {
  // Use import.meta.env for Vite (browser environment)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API key not set. AI features will use fallback responses.');
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  
  return aiClient;
};

export const generateValueProposition = async (role: string): Promise<string> => {
  const ai = getAIClient();
  
  // If no API key, return a fallback response
  if (!ai) {
    return `Scedge adapts to your workflow as a ${role}, optimizing resources and predicting bottlenecks before they happen.`;
  }
  
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
