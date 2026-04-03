const { supabaseAdmin } = require('../config/supabase');

async function getProfile(req, res, next) {
  try {
    console.log('[GET PROFILE] Looking for user id:', req.user.id);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle(); 

    console.log('[GET PROFILE] Result:', { data, error });

    if (error) {
      console.error('[GET PROFILE] Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      console.log('[GET PROFILE] No profile found for id:', req.user.id);

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: req.user.id,
          email: req.user.email,
          name: req.user.user_metadata?.name || req.user.email.split('@')[0],
          daily_email_opt_in: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('[GET PROFILE] Auto-create failed:', insertError);
        return res.status(404).json({
          error: 'Profile not found and could not be created',
          details: insertError.message,
        });
      }

      console.log('[GET PROFILE] Auto-created profile:', newProfile);
      return res.json({ profile: newProfile, auto_created: true });
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'avatar_url', 'daily_email_opt_in', 'timezone', 'bio'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ profile: data, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    await supabaseAdmin
      .from('profiles')
      .update({
        name: 'Deleted User',
        email: `deleted_${req.user.id}@deleted.com`,
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', req.user.id);

    await supabaseAdmin.auth.admin.deleteUser(req.user.id);

    res.json({ message: 'Account deleted. Your data has been anonymised.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, deleteAccount };
