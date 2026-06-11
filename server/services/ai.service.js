import { GoogleGenerativeAI } from "@google/generative-ai";
import { askGroq } from "../utils/groq.js";

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
};

/**
 * Send a prompt to Gemini API.
 */
const askGemini = async (systemPrompt, userMessage) => {
  const model = getGeminiModel();
  if (!model) {
    throw new Error("Gemini API key is not configured.");
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const text = result.response?.text?.() || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }
  return text.trim();
};

/**
 * Unified AI entry point: Gemini primary, Groq fallback.
 */
export const askAI = async (systemPrompt, userMessage) => {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
    try {
      console.log("[AI] Using Gemini...");
      return await askGemini(systemPrompt, userMessage);
    } catch (err) {
      console.warn("[AI] Gemini failed, falling back to Groq:", err.message);
    }
  }

  console.log("[AI] Using Groq...");
  const groqResult = await askGroq(systemPrompt, userMessage);
  if (!groqResult?.trim()) {
    throw new Error("AI returned an empty response.");
  }
  return groqResult.trim();
};

/**
 * Parse JSON from AI response, stripping markdown wrappers.
 */
export const parseAIJson = (responseText) => {
  const cleanJsonString = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanJsonString);
};
