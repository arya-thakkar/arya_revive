require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function checkDB() {
  console.log('--- Database Check ---');
  
  // Check Profiles
  const { data: profiles, error: pError } = await supabaseAdmin.from('profiles').select('*');
  if (pError) console.error('Profiles Error:', pError.message);
  else console.log('Total Profiles:', profiles?.length || 0);

  // Check Addictions
  const { data: addictions, error: aError } = await supabaseAdmin.from('addictions').select('*');
  if (aError) console.error('Addictions Error:', aError.message);
  else console.log('Total Addictions:', addictions?.length || 0);

  if (profiles && profiles.length > 0) {
    console.log('Emails in DB:', profiles.map(p => p.email).join(', '));
  }
}

checkDB();
