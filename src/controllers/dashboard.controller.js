const { supabaseAdmin } = require('../config/supabase');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    let { addiction_id } = req.query;

    const { data: allAddictions } = await supabaseAdmin
      .from('addictions')
      .select('id, addiction_type, streak_days, longest_streak, is_active, start_date')
      .eq('user_id', userId)
      .order('created_at');

    if (!allAddictions?.length) {
      return res.json({ onboarded: false, message: 'No addictions tracked yet.' });
    }

    if (!addiction_id) {
      addiction_id = allAddictions.find((a) => a.is_active)?.id || allAddictions[0].id;
    }

    const addiction = allAddictions.find((a) => a.id === addiction_id);
    if (!addiction) return res.status(404).json({ error: 'Addiction not found' });

    const [
      { data: plan },
      { data: recentCheckins },
      { data: recentJournal },
      { data: urges },
      { data: profile },
      { data: todayMotivation },
    ] = await Promise.all([
      supabaseAdmin.from('plans').select('overview, milestones, generated_at').eq('addiction_id', addiction_id).maybeSingle(),
      supabaseAdmin.from('checkins').select('*').eq('addiction_id', addiction_id).order('date', { ascending: false }).limit(7),
      supabaseAdmin.from('journal_entries').select('id, title, created_at, mood').eq('addiction_id', addiction_id).order('created_at', { ascending: false }).limit(3),
      supabaseAdmin.from('urge_logs').select('intensity, resisted, created_at').eq('addiction_id', addiction_id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('profiles').select('name, daily_email_opt_in').eq('id', userId).single(),
      supabaseAdmin.from('daily_motivations').select('*').eq('addiction_id', addiction_id).eq('date', new Date().toISOString().slice(0, 10)).maybeSingle(),
    ]);

    const daysSinceStart = Math.floor(
      (Date.now() - new Date(addiction.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentPlanDay = Math.min(daysSinceStart + 1, 21);

    const urgeResistanceRate = urges?.length
      ? Math.round((urges.filter((u) => u.resisted).length / urges.length) * 100)
      : 100;

    const avgMood = recentCheckins?.length
      ? (recentCheckins.reduce((sum, c) => sum + (c.mood || 0), 0) / recentCheckins.length).toFixed(1)
      : null;

    res.json({
      onboarded: true,
      user: profile,
      all_addictions: allAddictions,
      current_addiction: addiction,
      stats: {
        streak_days: addiction.streak_days,
        longest_streak: addiction.longest_streak,
        day_in_plan: currentPlanDay,
        days_since_start: daysSinceStart,
        urge_resistance_rate: urgeResistanceRate,
        avg_mood_7d: avgMood,
        total_urges_logged: urges?.length || 0,
      },
      plan: plan || null,
      today_motivation: todayMotivation || null,
      recent_checkins: recentCheckins || [],
      recent_journal: recentJournal || [],
      recent_urges: urges || [],
    });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyStats(req, res, next) {
  try {
    const { addiction_id } = req.query;
    if (!addiction_id) return res.status(400).json({ error: 'addiction_id required' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ data: checkins }, { data: urges }] = await Promise.all([
      supabaseAdmin
        .from('checkins')
        .select('date, mood, energy, urge_level, completed_task')
        .eq('addiction_id', addiction_id)
        .eq('user_id', req.user.id)
        .gte('date', sevenDaysAgo.toISOString().slice(0, 10))
        .order('date'),
      supabaseAdmin
        .from('urge_logs')
        .select('created_at, intensity, resisted')
        .eq('addiction_id', addiction_id)
        .eq('user_id', req.user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at'),
    ]);

    res.json({ checkins: checkins || [], urges: urges || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getWeeklyStats };
