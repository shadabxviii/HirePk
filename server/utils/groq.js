import Groq from "groq-sdk";

// Initialize groq-sdk lazily to prevent server crashes if the API key is not present immediately at start.
let groq = null;

const getGroqInstance = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
      console.warn("WARNING: GROQ_API_KEY is not set or has placeholder value.");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

/**
 * Sends a chat completion prompt to the Groq API
 * @param {string} systemPrompt System message behavior configuration
 * @param {string} userMessage User's query/prompt
 * @returns {Promise<string>} Content response from model
 */
export const askGroq = async (systemPrompt, userMessage) => {
  try {
    const groqClient = getGroqInstance();
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "llama3-8b-8192",
      temperature: 0.5, // slightly lower temp for more consistent/factual outputs
      max_tokens: 1500,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq Completion Error:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
};
