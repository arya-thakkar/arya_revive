const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

let accessToken = '';
let addictionId = '';
let journalId = '';

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

let passed = 0;
let failed = 0;

async function req(method, path, body, authRequired = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (authRequired && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function test(name, passed_cond, detail = '') {
  if (passed_cond) {
    console.log(`  ${colors.green('✓')} ${name}`);
    passed++;
  } else {
    console.log(`  ${colors.red('✗')} ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log(colors.bold(colors.cyan('\n🌱 Freedom Journey API Smoke Tests\n')));
  console.log(`  Base URL: ${BASE_URL}\n`);

  console.log(colors.yellow('▶ Health'));
  const health = await req('GET', '/health');
  test('GET /health returns 200', health.status === 200);
  test('Response has status ok', health.data.status === 'ok');

  console.log(colors.yellow('\n▶ Auth'));

  const testEmail = `test_${Date.now()}@freedomtest.dev`;
  const testPassword = 'Test1234!secure';

  const signup = await req('POST', '/api/auth/signup', {
    email: testEmail,
    password: testPassword,
    name: 'Test User',
  });
  test('POST /api/auth/signup returns 201', signup.status === 201);
  test('Signup returns session', !!signup.data.session?.access_token);

  if (signup.data.session?.access_token) {
    accessToken = signup.data.session.access_token;
  }

  const login = await req('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  test('POST /api/auth/login returns 200', login.status === 200);
  test('Login returns access_token', !!login.data.session?.access_token);

  if (login.data.session?.access_token) {
    accessToken = login.data.session.access_token;
  }

  const badLogin = await req('POST', '/api/auth/login', {
    email: testEmail,
    password: 'wrongpassword',
  });
  test('Bad login returns 401', badLogin.status === 401);

  const forgot = await req('POST', '/api/auth/forgot-password', { email: testEmail });
  test('POST /api/auth/forgot-password returns 200', forgot.status === 200);

  console.log(colors.yellow('\n▶ User Profile'));

  const profile = await req('GET', '/api/users/me', null, true);
  test('GET /api/users/me returns 200', profile.status === 200);
  test('Profile has name', !!profile.data.profile?.name);

  const updateProfile = await req('PATCH', '/api/users/me', {
    name: 'Updated Test User',
    daily_email_opt_in: false,
    timezone: 'America/New_York',
  }, true);
  test('PATCH /api/users/me returns 200', updateProfile.status === 200);
  test('Name updated correctly', updateProfile.data.profile?.name === 'Updated Test User');

  console.log(colors.yellow('\n▶ Addictions'));

  const createAddiction = await req('POST', '/api/addictions', {
    addiction_type: 'gaming',
    daily_hours: 6,
    daily_spend: 15,
    why_quit: 'Wasting too much time and money',
    triggers: ['boredom', 'stress', 'late nights'],
    motivation_level: 7,
  }, true);
  test('POST /api/addictions returns 201', createAddiction.status === 201);
  test('Addiction has id', !!createAddiction.data.addiction?.id);

  if (createAddiction.data.addiction?.id) {
    addictionId = createAddiction.data.addiction.id;
  }

  const dupAddiction = await req('POST', '/api/addictions', {
    addiction_type: 'gaming',
    motivation_level: 5,
  }, true);
  test('Duplicate addiction type returns 409', dupAddiction.status === 409);

  const getAddictions = await req('GET', '/api/addictions', null, true);
  test('GET /api/addictions returns 200', getAddictions.status === 200);
  test('Returns array of addictions', Array.isArray(getAddictions.data.addictions));

  const getOne = await req('GET', `/api/addictions/${addictionId}`, null, true);
  test(`GET /api/addictions/:id returns 200`, getOne.status === 200);
  test('Correct addiction returned', getOne.data.addiction?.addiction_type === 'gaming');

  const patchAddiction = await req('PATCH', `/api/addictions/${addictionId}`, {
    motivation_level: 9,
    daily_hours: 4,
  }, true);
  test('PATCH /api/addictions/:id returns 200', patchAddiction.status === 200);

  console.log(colors.yellow('\n▶ Dashboard'));

  const dashboard = await req('GET', `/api/dashboard?addiction_id=${addictionId}`, null, true);
  test('GET /api/dashboard returns 200', dashboard.status === 200);
  test('Dashboard shows onboarded: true', dashboard.data.onboarded === true);
  test('Dashboard has stats', !!dashboard.data.stats);
  test('Dashboard has all_addictions', Array.isArray(dashboard.data.all_addictions));

  const weekly = await req('GET', `/api/dashboard/stats/weekly?addiction_id=${addictionId}`, null, true);
  test('GET /api/dashboard/stats/weekly returns 200', weekly.status === 200);

  console.log(colors.yellow('\n▶ Journal'));

  const createJournal = await req('POST', '/api/journal', {
    addiction_id: addictionId,
    title: 'Day 1 Reflections',
    content: 'Today was challenging but I resisted the urge to game. Feeling proud of myself.',
    mood: 7,
    tags: ['proud', 'challenging'],
  }, true);
  test('POST /api/journal returns 201', createJournal.status === 201);
  test('Journal entry has id', !!createJournal.data.entry?.id);

  if (createJournal.data.entry?.id) journalId = createJournal.data.entry.id;

  const getJournal = await req('GET', `/api/journal?addiction_id=${addictionId}`, null, true);
  test('GET /api/journal returns 200', getJournal.status === 200);
  test('Journal returns entries array', Array.isArray(getJournal.data.entries));

  const updateJournal = await req('PATCH', `/api/journal/${journalId}`, {
    mood: 8,
    content: 'Updated: feeling even better now!',
  }, true);
  test('PATCH /api/journal/:id returns 200', updateJournal.status === 200);

  console.log(colors.yellow('\n▶ Check-ins'));

  const checkin = await req('POST', '/api/checkins', {
    addiction_id: addictionId,
    mood: 7,
    energy: 6,
    slept_well: true,
    urge_level: 3,
    completed_task: true,
    note: 'Managed cravings well today',
  }, true);
  test('POST /api/checkins returns 201', checkin.status === 201);
  test('Check-in returns streak', typeof checkin.data.streak === 'number');

  const dupCheckin = await req('POST', '/api/checkins', {
    addiction_id: addictionId,
    mood: 5,
  }, true);
  test('Duplicate check-in returns 409', dupCheckin.status === 409);

  const getCheckins = await req('GET', `/api/checkins?addiction_id=${addictionId}`, null, true);
  test('GET /api/checkins returns 200', getCheckins.status === 200);

  console.log(colors.yellow('\n▶ Urge Logs'));

  const urge = await req('POST', '/api/urges', {
    addiction_id: addictionId,
    intensity: 7,
    trigger: 'stress at work',
    resisted: true,
    note: 'Went for a walk instead',
  }, true);
  test('POST /api/urges returns 201', urge.status === 201);
  test('Urge log has coping_message', !!urge.data.coping_message);

  const getUrges = await req('GET', `/api/urges?addiction_id=${addictionId}`, null, true);
  test('GET /api/urges returns 200', getUrges.status === 200);
  test('Urges has stats object', !!getUrges.data.stats);

  console.log(colors.yellow('\n▶ Relapse'));

  const relapse = await req('POST', `/api/addictions/${addictionId}/relapse`, {
    note: 'Had a tough night. Starting fresh tomorrow.',
  }, true);
  test('POST /api/addictions/:id/relapse returns 200', relapse.status === 200);
  test('Relapse returns previous_streak', typeof relapse.data.previous_streak === 'number');

  console.log(colors.yellow('\n▶ Validation'));

  const badSignup = await req('POST', '/api/auth/signup', { email: 'notanemail', password: '123' });
  test('Invalid signup body returns 400', badSignup.status === 400);
  test('Returns validation details', Array.isArray(badSignup.data.details));

  const badAddiction = await req('POST', '/api/addictions', {
    addiction_type: 'invalid_type',
  }, true);
  test('Invalid addiction type returns 400', badAddiction.status === 400);

  console.log(colors.yellow('\n▶ Auth Guards'));

  const unauth = await req('GET', '/api/users/me', null, false);
  test('Unauthenticated request returns 401', unauth.status === 401);

  const notFound = await req('GET', '/api/nonexistent-route');
  test('Unknown route returns 404', notFound.status === 404);

  if (journalId) {
    const delJournal = await req('DELETE', `/api/journal/${journalId}`, null, true);
    test('DELETE /api/journal/:id returns 200', delJournal.status === 200);
  }

  const total = passed + failed;
  console.log(colors.bold(`\n${'─'.repeat(45)}`));
  console.log(colors.bold(`  Results: ${colors.green(passed + ' passed')}, ${failed > 0 ? colors.red(failed + ' failed') : '0 failed'} / ${total} total`));
  if (failed === 0) {
    console.log(colors.green(colors.bold('  ✅ All tests passed! API is healthy.\n')));
  } else {
    console.log(colors.red(colors.bold(`  ❌ ${failed} test(s) failed. Check server logs.\n`)));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(colors.red('\n❌ Fatal error running tests:'), err.message);
  console.error('   Is the server running at', BASE_URL, '?\n');
  process.exit(1);
});
