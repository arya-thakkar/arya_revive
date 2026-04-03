const AI_PROVIDER = process.env.AI_PROVIDER || "groq";

/**
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */

async function generateText(prompt, options = {}) {
  const { maxTokens = 1024, temperature = 0.8, systemPrompt = "" } = options;

  if (AI_PROVIDER === "gemini") {
    return generateWithGemini(prompt, { maxTokens, temperature, systemPrompt });
  }
  return generateWithGroq(prompt, { maxTokens, temperature, systemPrompt });
}

async function generateWithGroq(
  prompt,
  { maxTokens, temperature, systemPrompt },
) {
  const Groq = require("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

async function generateWithGemini(
  prompt,
  { maxTokens, temperature, systemPrompt },
) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  });

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const result = await model.generateContent(fullPrompt);
  return result.response.text().trim();
}

/**
 * @param {object} addictionData
 * @returns {Promise<object>}
 */

async function generate21DayPlan(addictionData) {
  const {
    addiction_type,
    last_use,
    daily_spend,
    daily_hours,
    why_quit,
    triggers,
    motivation_level,
  } = addictionData;

  const systemPrompt = `You are a compassionate addiction recovery coach with expertise in behavioral psychology. 
Generate actionable, empathetic, science-backed recovery plans. Always respond with valid JSON only.`;

  const prompt = `Create a detailed 21-day addiction recovery plan for someone dealing with ${addiction_type} addiction.

User Profile:
- Last use: ${last_use || "recent"}
- Daily time spent: ${daily_hours || 0} hours
- Daily money spent: $${daily_spend || 0}
- Reason to quit: "${why_quit || "personal growth"}"
- Triggers: ${triggers?.join(", ") || "not specified"}
- Motivation level (1-10): ${motivation_level || 5}

Generate a JSON object with this exact structure:
{
  "overview": "2-3 sentence summary of the plan approach",
  "milestones": [
    { "day": 7, "title": "milestone name", "description": "what to expect" },
    { "day": 14, "title": "...", "description": "..." },
    { "day": 21, "title": "...", "description": "..." }
  ],
  "days": [
    {
      "day": 1,
      "theme": "day theme",
      "task": "specific daily task",
      "affirmation": "personalized affirmation",
      "tip": "coping tip for their specific triggers",
      "emergency_strategy": "what to do if urge hits"
    }
  ]
}

Include all 21 days. Make each day unique, progressive, and tailored to the specific addiction type.`;

  const raw = await generateText(prompt, {
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.7,
  });

  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

/**
 * @param {object} context
 * @returns {Promise<object>}
 */

async function generateDailyMotivation(context) {
  const { addiction_type, day_number, user_name, current_mood } = context;

  const systemPrompt = `You are a warm, encouraging recovery coach. Respond only with valid JSON.`;

  const prompt = `Generate a personalized daily motivation package for ${user_name || "a user"} on day ${day_number} of their ${addiction_type} recovery journey. Their current mood: ${current_mood || "neutral"}.

Return a JSON object:
{
  "quote": { "text": "...", "author": "..." },
  "message": "2-3 sentence personalized message for this specific day and addiction",
  "recommendations": {
    "youtube": { "title": "video title suggestion", "search_query": "youtube search query to find it", "reason": "why this helps" },
    "article": { "title": "article topic", "search_query": "google search query", "reason": "why this helps" },
    "podcast": { "title": "podcast/episode suggestion", "search_query": "search query", "reason": "why this helps" },
    "song": { "title": "song title", "artist": "artist name", "reason": "why this helps mood" }
  },
  "challenge": "one small challenge for today",
  "reflection_prompt": "evening journaling question"
}`;

  const raw = await generateText(prompt, {
    systemPrompt,
    maxTokens: 1024,
    temperature: 0.9,
  });
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

/**
 * @param {object} context
 * @returns {Promise<string>}
 */

async function generateUrgeResponse(context) {
  const { addiction_type, intensity, trigger, time_of_day } = context;

  const prompt = `A person is fighting a ${addiction_type} urge right now.
Intensity: ${intensity}/10, Trigger: ${trigger || "unspecified"}, Time: ${time_of_day || "unknown"}.

Write a 3-4 paragraph compassionate, grounding response that:
1. Validates their struggle without judgment
2. Gives an immediate 60-second breathing/grounding technique
3. Provides a specific distraction activity
4. Ends with a powerful short affirmation

Be warm, direct, and urgent. Do NOT start with "I" or "As an AI".`;

  return generateText(prompt, { maxTokens: 512, temperature: 0.75 });
}

module.exports = {
  generateText,
  generate21DayPlan,
  generateDailyMotivation,
  generateUrgeResponse,
};
