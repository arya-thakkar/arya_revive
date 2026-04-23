const { supabaseAdmin } = require("../config/supabase");
const {
  sendMilestoneEmail,
  sendRelapseEmail,
} = require("../services/email.service");

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 60, 90];

async function getAddictions(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("addictions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ addictions: data });
  } catch (err) {
    next(err);
  }
}

async function createAddiction(req, res, next) {
  try {
    const userId = req.user.id;

    const { count } = await supabaseAdmin
      .from("addictions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count >= 3) {
      return res
        .status(400)
        .json({
          error: "Maximum of 3 addictions allowed. Remove one to add another.",
        });
    }

    const { data: existing } = await supabaseAdmin
      .from("addictions")
      .select("id")
      .eq("user_id", userId)
      .eq("addiction_type", req.body.addiction_type)
      .single();

    if (existing) {
      return res
        .status(409)
        .json({
          error: `You already have a ${req.body.addiction_type} addiction tracked.`,
        });
    }

    const { data, error } = await supabaseAdmin
      .from("addictions")
      .insert({
        user_id: userId,
        ...req.body,
        start_date: new Date().toISOString(),
        is_active: true,
        streak_days: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[ADDICTION CREATE ERROR] Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res
      .status(201)
      .json({
        addiction: data,
        message: "Addiction added. Your 21-day plan will be generated.",
      });
  } catch (err) {
    next(err);
  }
}

async function getAddiction(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("addictions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Addiction not found" });

    res.json({ addiction: data });
  } catch (err) {
    next(err);
  }
}

async function updateAddiction(req, res, next) {
  try {
    const allowed = [
      "last_use",
      "daily_spend",
      "daily_hours",
      "why_quit",
      "triggers",
      "motivation_level",
      "is_active",
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k)),
    );

    const { data, error } = await supabaseAdmin
      .from("addictions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Addiction not found" });

    res.json({ addiction: data });
  } catch (err) {
    next(err);
  }
}

async function deleteAddiction(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from("addictions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Addiction removed from tracking." });
  } catch (err) {
    next(err);
  }
}

async function logRelapse(req, res, next) {
  try {
    const { note } = req.body;

    const { data: addiction, error: fetchError } = await supabaseAdmin
      .from("addictions")
      .select("streak_days, longest_streak")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (fetchError || !addiction)
      return res.status(404).json({ error: "Addiction not found" });

    const newLongest = Math.max(
      addiction.streak_days,
      addiction.longest_streak,
    );

    await supabaseAdmin
      .from("addictions")
      .update({
        streak_days: 0,
        longest_streak: newLongest,
        last_use: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id);

    await supabaseAdmin.from("relapses").insert({
      addiction_id: req.params.id,
      user_id: req.user.id,
      streak_at_relapse: addiction.streak_days,
      note: note || null,
    });

    res.json({
      message:
        "Relapse logged. Remember: setbacks are part of the journey. Your streak resets but your progress doesn't.",
      previous_streak: addiction.streak_days,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAddictions,
  createAddiction,
  getAddiction,
  updateAddiction,
  deleteAddiction,
  logRelapse,
};
