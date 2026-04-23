const { supabase, supabaseAdmin } = require('../config/supabase');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
} = require('../services/email.service');

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'email, password, and name are required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });

    if (authError) {
      console.error('[SIGNUP] Supabase error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }
    if (!authData?.user) {
      console.error('[SIGNUP] Unknown error: No user returned');
      return res.status(400).json({ error: 'Signup failed. Try again.' });
    }

    const user = authData.user;

    // Retry profile creation if it fails due to Supabase auth propagation delay
    let profileError = null;
    for (let i = 0; i < 3; i++) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id, 
          email: user.email, 
          name: name.trim(),
          daily_email_opt_in: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      
      if (!error) {
        profileError = null;
        break;
      }
      profileError = error;
      await new Promise(r => setTimeout(r, 500)); // Wait 500ms before retry
    }

    if (profileError) {
      console.error('[SIGNUP] Profile creation failed after retries:', profileError.message);
      // We still allow signup to complete, but log the error
    }

    sendWelcomeEmail({ to: email, name })
      .catch((e) => console.error('[EMAIL] Welcome failed:', e.message));

    res.status(201).json({
      message: 'Account created!',
      user: { id: user.id, email: user.email, name },
      session: authData.session,
    });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    const user = data.user;
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('name, daily_email_opt_in').eq('id', user.id).maybeSingle();

    sendLoginNotificationEmail({
      to: email,
      name: profile?.name || 'User',
      loginTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ipAddress: req.headers['x-forwarded-for'] || req.ip || 'Unknown',
    }).catch((e) => console.error('[EMAIL] Login notification failed:', e.message));

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: profile?.name || user.user_metadata?.name },
      session: data.session,
    });
  } catch (err) { next(err); }
}

async function googleOAuth(req, res, next) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ url: data.url });
  } catch (err) { next(err); }
}

async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token is required' });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: error.message });
    res.json({ session: data.session });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    await userClient.auth.setSession({
      access_token: req.token,
      refresh_token: req.body.refresh_token || '',
    });

    await userClient.auth.signOut();

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[LOGOUT] Error:', err.message);
    res.json({ message: 'Logged out successfully' });
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('name').eq('email', email).maybeSingle();

    if (!profile)
      return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery', email,
      options: { redirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
    });

    if (error) {
      console.error('[FORGOT PASSWORD] Supabase link generation failed:', error.message);
      // Even if admin link fails, we tell the user it was sent for security/obfuscation
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    if (!data?.properties?.action_link) {
      console.warn('[FORGOT PASSWORD] No action_link generated by Supabase. Using fallback URL (token reset will fail)');
    }

    const resetUrl = data?.properties?.action_link ||
      `${process.env.FRONTEND_URL}/reset-password`;

    sendPasswordResetEmail({ to: email, name: profile.name || 'User', resetUrl })
      .then(() => console.log(`[EMAIL] Password reset sent to ${email}`))
      .catch((e) => console.error('[EMAIL] Reset email failed:', e.message));

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // We must use a fresh client to ensure the token from req.token is correctly applied
    const { createClient } = require('@supabase/supabase-js');
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    await userClient.auth.setSession({
      access_token: req.token,
      refresh_token: req.body.refresh_token || '',
    });

    const { error } = await userClient.auth.updateUser({ password: new_password });
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) { next(err); }
}

async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const { error } = await supabase.auth.resend({
      type: 'signup', email,
      options: { emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback` },
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Verification email resent.' });
  } catch (err) { next(err); }
}

module.exports = { signup, login, googleOAuth, refreshToken, logout, forgotPassword, resetPassword, resendVerification };