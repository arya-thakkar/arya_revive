const { supabaseAdmin } = require('../config/supabase');

async function getEntries(req, res, next) {
  try {
    const { addiction_id, limit = 20, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (addiction_id) query = query.eq('addiction_id', addiction_id);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ entries: data, total: count, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    next(err);
  }
}

async function createEntry(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({ user_id: req.user.id, ...req.body })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ entry: data });
  } catch (err) {
    next(err);
  }
}

async function updateEntry(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry: data });
  } catch (err) {
    next(err);
  }
}

async function deleteEntry(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('journal_entries')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEntries, createEntry, updateEntry, deleteEntry };
