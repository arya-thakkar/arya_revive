const { supabaseAdmin } = require('../config/supabase');
const { generate21DayPlan } = require('../services/ai.service');

async function generatePlan(req, res, next) {
  try {
    const { addictionId } = req.params;

    const { data: addiction, error: fetchError } = await supabaseAdmin
      .from('addictions')
      .select('*')
      .eq('id', addictionId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !addiction) {
      return res.status(404).json({ error: 'Addiction not found or unauthorized' });
    }

    let planData;
    try {
      planData = await generate21DayPlan(addiction);
    } catch (aiError) {
      console.error('AI plan generation failed:', aiError.message);
      return res.status(502).json({ error: 'AI service unavailable. Please try again.' });
    }

    const { data: plan, error: upsertError } = await supabaseAdmin
      .from('plans')
      .upsert(
        {
          addiction_id: addictionId,
          user_id: req.user.id,
          overview: planData.overview,
          milestones: planData.milestones,
          days: planData.days,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'addiction_id' }
      )
      .select()
      .single();

    if (upsertError) return res.status(400).json({ error: upsertError.message });

    res.status(201).json({ plan, message: 'Your personalized 21-day plan is ready!' });
  } catch (err) {
    next(err);
  }
}

async function getPlan(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('addiction_id', req.params.addictionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'No plan found. Generate one first.' });
    }

    res.json({ plan: data });
  } catch (err) {
    next(err);
  }
}

async function getPlanDay(req, res, next) {
  try {
    const dayNumber = parseInt(req.params.dayNumber);
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 21) {
      return res.status(400).json({ error: 'Day number must be between 1 and 21' });
    }

    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('days, milestones')
      .eq('addiction_id', req.params.addictionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Plan not found' });

    const dayData = data.days?.find((d) => d.day === dayNumber);
    if (!dayData) return res.status(404).json({ error: `Day ${dayNumber} not found in plan` });

    const milestone = data.milestones?.find((m) => m.day === dayNumber);

    res.json({ day: dayData, milestone: milestone || null });
  } catch (err) {
    next(err);
  }
}

module.exports = { generatePlan, getPlan, getPlanDay };
