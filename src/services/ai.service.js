const AI_PROVIDER = "groq";

/**
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */



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

const SHLOKS = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
    author: "Bhagavad Gita 2.47",
    challenge: "Focus on your effort today, not the long-term goal. Just get through the next hour.",
    message: "Recovery is your duty. Do not worry about the 21 days yet; focus on the right action right now."
  },
  {
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    text: "While contemplating on the objects of the senses, one develops attachment to them. From attachment, desire is born, and from desire, anger arises.",
    author: "Bhagavad Gita 2.62",
    challenge: "Observe your thoughts. When an urge arises, label it as 'just a thought' and let it pass.",
    message: "The cycle of addiction begins in the mind. By observing the desire, you break its power over you."
  },
  {
    sanskrit: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्। ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥",
    text: "From whatever causes the restless and unsteady mind wanders away, from that let him restrain it and bring it back under the control of the Self alone.",
    author: "Bhagavad Gita 6.26",
    challenge: "Whenever your mind wanders to your addiction, gently bring it back to your breath.",
    message: "A wandering mind is normal. The strength is in bringing it back, again and again."
  },
  {
    sanskrit: "शक्नोतीहैव यः सोढुं प्राक्शरीरविमोक्षणात्। कामक्रोधोद्भवं वेगं स युक्तः स सुखी नरः॥",
    text: "He who is able to withstand the force of lust and anger even here before he is liberated from the body, he is a yogi, he is a happy man.",
    author: "Bhagavad Gita 5.23",
    challenge: "When an urge hits, wait 10 minutes before acting. Watch the 'wave' of the urge pass.",
    message: "Happiness comes from mastering the urges of the body, not from fulfilling them."
  }
];

async function generateWithGemini(
  prompt,
  { maxTokens, temperature, systemPrompt },
) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  });

  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text().trim();
    return text;
  } catch (err) {
    console.error('[GEMINI ERROR]', err.message);
    throw err;
  }
}

async function generateText(prompt, options = {}) {
  const { maxTokens = 1024, temperature = 0.8, systemPrompt = "" } = options;
  
  try {
    // 1. Try Groq (Preferred for Llama 3 natural voice)
    if (AI_PROVIDER === "groq" && process.env.GROQ_API_KEY) {
      return await generateWithGroq(prompt, { maxTokens, temperature, systemPrompt });
    }
    
    // 2. Try Gemini (Secondary)
    if (process.env.GEMINI_API_KEY) {
      return await generateWithGemini(prompt, { maxTokens, temperature, systemPrompt });
    }
    
    throw new Error('No AI API keys found in .env');
  } catch (err) {
    console.error('[RAI AI ERROR]', err.message);
    
    // If it's a short message (chat), use our mentoring fallback
    if (prompt.length < 1000) {
      return "I'm RAI, your companion on this journey. I'm currently reflecting deeply (technical connection pause), but I want you to remember this: 'You are not your thoughts; you are the one observing them.' Stay steady, take a deep breath, and let's talk more in a minute. What was the best part of your day so far?";
    }
    
    throw err;
  }
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

  const systemPrompt = `You are "Dr. RAI", the Chief Medical Officer of an Elite Recovery Center. 
Your specialty is Human Optimization and Neuro-Restoration. 

You MUST generate a 21-day "Master Protocol". 
Every single day's "task" field MUST contain a detailed "12-POINT CLINICAL SOP".
Structure:
1. MORNING (07:00): [Unique Bio-Hack/Ritual]
2. NUTRITION: [Unique Breakfast Recipe with steps]
3. HYDRATION: [Unique electrolyte/detox drink]
4. VITALITY: [Unique Physical Exercise with reps/sets/instructions]
5. DIGITAL: [Unique screen-time audit]
6. THE MISSION: [A unique, high-intensity recovery challenge]
7. LUNCH: [Unique Lunch Recipe with steps]
8. DEEP WORK: [Specific learning or cognitive task]
9. DINNER: [Unique Dinner Recipe with steps]
10. ENVIRONMENT: [Specific physical space optimization]
11. GRATITUDE: [Unique reflection question]
12. NIGHT: [Unique sleep hygiene ritual]

CRITICAL RULES:
- ABSOLUTELY NO REPETITION. Every meal, every exercise, and every ritual must be different for all 21 days.
- Be professional, specific, and instructional.
- Always respond in valid JSON.`;

  const prompt = `COMMAND: Construct the 21-Day Clinical SOP for ${addiction_type} recovery.
USER CONTEXT:
- Waste: ${daily_hours}h/day | $${daily_spend}/day
- Triggers: ${triggers?.join(", ")}
- Goal: "${why_quit}"

Ensure the protocol scales in difficulty from Day 1 to Day 21.`;

  try {
    const raw = await generateText(prompt, {
      systemPrompt,
      maxTokens: 4096,
      temperature: 0.9, // Higher variety
    });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Plan AI error, using High-Intensity Local Protocol');
    // High-quality local protocol instead of a boring one
    const { generatePlan: generateLocalPlan } = require('./rai.engine');
    return generateLocalPlan(addictionData);
  }
}

/**
 * @param {object} context
 * @returns {Promise<object>}
 */

async function generateDailyMotivation(context) {
  const { addiction_type, day_number, user_name, current_mood } = context;

  const systemPrompt = `You are "RAI", a wise and warm recovery coach. You provide daily wisdom. Respond only with valid JSON.`;

  const prompt = `Generate a personalized daily motivation package for ${user_name || "a user"} on day ${day_number} of their ${addiction_type} recovery journey. Their current mood: ${current_mood || "neutral"}.

Return a JSON object:
{
  "quote": { 
    "text": "The English translation of a relevant verse", 
    "author": "The Source [Chapter:Verse]",
    "sanskrit": "The original Sanskrit verse"
  },
  "message": "2-3 sentence personalized message connecting this wisdom to their ${addiction_type} recovery today.",
  "recommendations": {
    "youtube": { "title": "video title", "search_query": "youtube search query", "reason": "why this helps" },
    "article": { "title": "article topic", "search_query": "google search query", "reason": "why this helps" },
    "podcast": { "title": "podcast suggestion", "search_query": "search query", "reason": "why this helps" },
    "song": { "title": "song title", "artist": "artist name", "reason": "why this helps" }
  },
  "challenge": "one small challenge for today",
  "reflection_prompt": "evening journaling question"
}`;

  try {
    const raw = await generateText(prompt, {
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.9,
    });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('Motivation AI failed, using hardcoded shlok');
    const shlok = SHLOKS[Math.floor(Math.random() * SHLOKS.length)];
    return {
      quote: { text: shlok.text, author: shlok.author, sanskrit: shlok.sanskrit },
      message: shlok.message,
      challenge: shlok.challenge,
      reflection_prompt: "What was the most challenging part of today, and how did you handle it?",
      recommendations: {
        youtube: { title: "Guided Meditation for Focus", search_query: "guided meditation for addiction recovery", reason: "Helps calm the nervous system." },
        song: { title: "Peaceful Flute Music", artist: "Meditation Music", reason: "Good for deep focus." }
      }
    };
  }
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
