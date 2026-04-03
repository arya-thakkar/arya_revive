const { supabaseAdmin } = require('../config/supabase');
const { generateUrgeResponse } = require('../services/ai.service');

async function logUrge(req, res, next) {
  try {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const { data, error } = await supabaseAdmin
      .from('urge_logs')
      .insert({
        user_id: req.user.id,
        ...req.body,
        time_of_day: timeOfDay,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: addiction } = await supabaseAdmin
      .from('addictions')
      .select('addiction_type')
      .eq('id', req.body.addiction_id)
      .single();

    let aiResponse = null;
    try {
      aiResponse = await generateUrgeResponse({
        addiction_type: addiction?.addiction_type || 'addiction',
        intensity: req.body.intensity,
        trigger: req.body.trigger,
        time_of_day: timeOfDay,
      });
    } catch (e) {
      console.error('Urge AI response failed:', e.message);
    }

    res.status(201).json({
      urge_log: data,
      coping_message: aiResponse || 'Take a deep breath. This urge will pass. You are stronger than this moment.',
    });
  } catch (err) {
    next(err);
  }
}

async function getUrges(req, res, next) {
  try {
    const { addiction_id, limit = 30 } = req.query;

    let query = supabaseAdmin
      .from('urge_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (addiction_id) query = query.eq('addiction_id', addiction_id);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const total = data?.length || 0;
    const resisted = data?.filter((u) => u.resisted).length || 0;

    res.json({
      urges: data,
      stats: {
        total,
        resisted,
        gave_in: total - resisted,
        resistance_rate: total ? Math.round((resisted / total) * 100) : 100,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { logUrge, getUrges };
