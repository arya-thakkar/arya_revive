const { supabaseAdmin } = require('../config/supabase');
const { sendMilestoneEmail } = require('../services/email.service');

const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 60, 90];

async function createCheckin(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { addiction_id } = req.body;

    const { data: existing } = await supabaseAdmin
      .from('checkins')
      .select('id')
      .eq('addiction_id', addiction_id)
      .eq('user_id', req.user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing)
      return res.status(409).json({ error: 'Already checked in today. Come back tomorrow!' });

    const { data, error } = await supabaseAdmin
      .from('checkins')
      .insert({ user_id: req.user.id, date: today, ...req.body })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: addiction } = await supabaseAdmin
      .from('addictions')
      .select('streak_days, longest_streak, addiction_type')
      .eq('id', addiction_id)
      .single();

    const newStreak = (addiction?.streak_days || 0) + 1;
    const newLongest = Math.max(newStreak, addiction?.longest_streak || 0);

    await supabaseAdmin
      .from('addictions')
      .update({
        streak_days: newStreak,
        longest_streak: newLongest,
        updated_at: new Date().toISOString(),
      })
      .eq('id', addiction_id);

    if (MILESTONE_DAYS.includes(newStreak)) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, name, daily_email_opt_in')
        .eq('id', req.user.id)
        .maybeSingle();

      if (profile?.email) {
        sendMilestoneEmail({
          to: profile.email,
          name: profile.name,
          streakDays: newStreak,
          addictionType: addiction?.addiction_type,
        })
          .then(() => console.log(`[EMAIL] Milestone email sent — ${newStreak} days`))
          .catch((e) => console.error('[EMAIL] Milestone failed:', e.message));
      }
    }

    res.status(201).json({
      checkin: data,
      streak: newStreak,
      is_milestone: MILESTONE_DAYS.includes(newStreak),
      message: MILESTONE_DAYS.includes(newStreak)
        ? `🏆 ${newStreak} day milestone! Check your email for a celebration!`
        : 'Check-in recorded! Keep going! 🔥',
    });
  } catch (err) { next(err); }
}

async function getCheckins(req, res, next) {
  try {
    const { addiction_id, month } = req.query;

    let query = supabaseAdmin
      .from('checkins')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .limit(90);

    if (addiction_id) query = query.eq('addiction_id', addiction_id);
    if (month) query = query.gte('date', `${month}-01`).lte('date', `${month}-31`);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ checkins: data });
  } catch (err) { next(err); }
}

module.exports = { createCheckin, getCheckins };