const { supabaseAdmin } = require("../config/supabase");
const {
  generateDailyMotivation,
  generateText,
} = require("../services/ai.service");
const { sendDailyMotivationEmail } = require("../services/email.service");

async function getDailyMotivation(req, res, next) {
  try {
    const { addictionId } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const { data: cached } = await supabaseAdmin
      .from("daily_motivations")
      .select("*")
      .eq("addiction_id", addictionId)
      .eq("user_id", req.user.id)
      .eq("date", today)
      .maybeSingle();

    if (cached) return res.json({ motivation: cached, cached: true });

    const [{ data: addiction }, { data: profile }] = await Promise.all([
      supabaseAdmin
        .from("addictions")
        .select("addiction_type, streak_days, start_date")
        .eq("id", addictionId)
        .eq("user_id", req.user.id)
        .single(),
      supabaseAdmin
        .from("profiles")
        .select("name, daily_email_opt_in, email")
        .eq("id", req.user.id)
        .single(),
    ]);

    if (!addiction)
      return res.status(404).json({ error: "Addiction not found" });

    const dayNumber =
      Math.floor(
        (Date.now() - new Date(addiction.start_date).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    // Use our internal RAI Engine logic
    const { getMotivation } = require("../services/rai.engine");
    const motivationData = getMotivation(dayNumber, req.query.mood || "neutral");
    
    // AI is now optional/enrichment, but we use RAI engine for reliability
    console.log('[RAI ENGINE] Motivation generated for day:', dayNumber);

    const { data: saved, error: saveError } = await supabaseAdmin
      .from("daily_motivations")
      .insert({
        addiction_id: addictionId,
        user_id: req.user.id,
        date: today,
        day_number: dayNumber,
        ...motivationData,
      })
      .select()
      .single();

    if (saveError) console.error("Save motivation error:", saveError.message);

    if (profile?.daily_email_opt_in && profile?.email) {
      sendDailyMotivationEmail({
        to: profile.email,
        name: profile.name,
        motivation: { ...motivationData, day_number: dayNumber },
      }).catch((e) => console.error("Daily email error:", e.message));
    }

    // Merge saved data with new engine data to ensure library and stories are present
    const finalMotivation = {
      ...(saved || {}),
      ...motivationData,
      day_number: dayNumber
    };

    res.json({ motivation: finalMotivation, cached: !!saved });
  } catch (err) {
    next(err);
  }
}

async function chat(req, res, next) {
  try {
    const { message, addiction_type } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. RAI Rule-Based Engine (Instant Responses)
    const lowerMsg = message.toLowerCase();
    
    // Emergency Trigger
    if (lowerMsg.includes('urge') || lowerMsg.includes('help') || lowerMsg.includes('craving')) {
      return res.json({
        response: "RAI ALERT: I hear you. This urge is just a temporary wave in the ocean of your mind. STOP what you are doing. Stand up. Take 5 deep breaths (inhale 4s, hold 7s, exhale 8s). Move to a different room immediately. You are the master of this body, not the desire. Stay strong for just the next 10 minutes."
      });
    }

    // Wisdom Trigger
    if (lowerMsg.includes('gita') || lowerMsg.includes('shlok') || lowerMsg.includes('wisdom')) {
      const { SHLOKS } = require('../services/rai.engine');
      const shlok = SHLOKS[Math.floor(Math.random() * SHLOKS.length)];
      return res.json({
        response: `As the Bhagavad Gita teaches us: "${shlok.text}" (${shlok.author}). This means that your power lies in your action, not the attachment to the result. Focus on your duty today.`
      });
    }

    // 2. AI Voice (Groq/Llama 3) for natural conversation
    const systemPrompt = `You are "RAI", a wise, cool, and deeply compassionate recovery mentor. 
You are grounded in the spiritual wisdom of the Bhagavad Gita and the science of behavioral psychology.
The user is struggling with ${addiction_type || 'addiction'}. 

Your Personality:
- You speak like a supportive elder brother or a legendary coach (like Marcus Aurelius or a wise Monk).
- You are NOT a generic AI. You have a soul.
- You use words like "Steady", "Mastery", "Discipline", and "Breath".
- You give long, thoughtful, and high-quality responses when the user shares deep feelings.
- When the user is struggling, give them a specific psychological tool (like 'Urge Surfing' or 'The 10-Minute Rule').
- Always end with a powerful, personalized sentence that builds their internal fire.

Current User Message: "${message}"
Respond as RAI.`;

    const response = await generateText(message, {
      systemPrompt,
      maxTokens: 1024,
      temperature: 0.85,
    });

    res.json({ response });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "RAI is reflecting. Please try again in a moment." });
  }
}

async function journalReflection(req, res, next) {
  try {
    const { entry_content, addiction_type } = req.body;

    if (!entry_content)
      return res.status(400).json({ error: "entry_content required" });

    const prompt = `A person in ${addiction_type || "addiction"} recovery wrote this journal entry:

"${entry_content}"

Write a 2-3 paragraph compassionate reflection that:
1. Acknowledges their feelings and validates their experience
2. Identifies a strength or positive pattern you notice
3. Offers one gentle, actionable insight for their journey

Be warm and personal. Do not be preachy.`;

    const reflection = await generateText(prompt, {
      maxTokens: 400,
      temperature: 0.75,
    });

    res.json({ reflection });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDailyMotivation, chat, journalReflection };
