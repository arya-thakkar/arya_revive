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

    let motivationData;
    try {
      motivationData = await generateDailyMotivation({
        addiction_type: addiction.addiction_type,
        day_number: dayNumber,
        user_name: profile?.name,
        current_mood: req.query.mood || "neutral",
      });
    } catch (e) {
      console.error("Daily motivation AI error:", e.message);
      return res
        .status(502)
        .json({ error: "AI generation failed. Please try again." });
    }

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

    res.json({ motivation: saved || motivationData, cached: false });
  } catch (err) {
    next(err);
  }
}

async function chat(req, res, next) {
  try {
    const { message, addiction_type, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const systemPrompt = `You are a warm, knowledgeable addiction recovery coach named "Journey". 
You specialize in ${addiction_type || "behavioral"} addiction recovery.
Be empathetic, practical, and non-judgmental. Keep responses concise (under 200 words).
Do NOT start with "I" or "As an AI". Never give medical diagnoses.
${context ? `Context about the user: ${context}` : ""}`;

    const response = await generateText(message, {
      systemPrompt,
      maxTokens: 512,
      temperature: 0.8,
    });

    res.json({ response });
  } catch (err) {
    next(err);
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
