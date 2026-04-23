const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
}

/** Standard client - respects Row Level Security */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/** Admin client - bypasses RLS, use only on server */
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Startup validation for Keys
if (SUPABASE_ANON_KEY === SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('\n⚠️  [CONFIG WARNING] SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are identical!');
  console.warn('   This will cause admin functions (like forgot password links) to fail.');
  console.warn('   Please ensure you have the correct Service Role key from your Supabase dashboard.\n');
}

module.exports = { supabase, supabaseAdmin };
