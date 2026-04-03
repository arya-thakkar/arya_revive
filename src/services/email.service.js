const nodemailer = require('nodemailer');

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Freedom Journey <no-reply@freedomjourney.app>';

function getTransporter() {
  if (EMAIL_PROVIDER === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const result = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text: text || subject,
  });
  console.log(`[EMAIL] Sent "${subject}" to ${to}`);
  return result;
}

function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      font-size: 16px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 560px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #16a34a;
      margin-bottom: 40px;
    }
    .logo span { color: #1a1a1a; }
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    p {
      color: #444;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.7;
    }
    .btn {
      display: inline-block;
      background: #16a34a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      margin: 8px 0 24px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e5e5;
      margin: 32px 0;
    }
    .info-box {
      background: #f9f9f9;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-box p { margin: 0; color: #444; font-size: 14px; }
    .quote {
      border-left: 3px solid #16a34a;
      padding: 12px 20px;
      margin: 24px 0;
      color: #555;
      font-style: italic;
    }
    .quote span {
      display: block;
      margin-top: 8px;
      font-style: normal;
      font-size: 13px;
      color: #888;
    }
    .stat-row {
      display: flex;
      gap: 12px;
      margin: 20px 0;
    }
    .stat {
      flex: 1;
      background: #f9f9f9;
      border-radius: 6px;
      padding: 14px;
      text-align: center;
    }
    .stat .num {
      font-size: 26px;
      font-weight: 700;
      color: #16a34a;
    }
    .stat .label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
    }
    .footer p {
      font-size: 12px;
      color: #aaa;
      margin: 0;
    }
    .footer a { color: #aaa; }
    .small { font-size: 13px; color: #888; }
    .green { color: #16a34a; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">Freedom<span>Journey</span></div>
    ${content}
    <div class="footer">
      <p>Freedom Journey &nbsp;·&nbsp; <a href="${process.env.FRONTEND_URL}/settings">Manage preferences</a> &nbsp;·&nbsp; <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function sendWelcomeEmail({ to, name }) {
  const html = baseTemplate(`
    <h1>Welcome, ${name} 👋</h1>
    <p>You just took a huge step. Signing up for Freedom Journey takes real courage — and that courage is proof you have what it takes to change.</p>
    <p>Here's what's waiting for you:</p>
    <div class="info-box">
      <p>📋 &nbsp;<strong>Personalized 21-Day Plan</strong> — AI-crafted daily tasks for your recovery</p>
    </div>
    <div class="info-box">
      <p>💪 &nbsp;<strong>Daily Motivation</strong> — Quotes, challenges, and curated resources every morning</p>
    </div>
    <div class="info-box">
      <p>📖 &nbsp;<strong>Journal & Check-ins</strong> — Track your mood, streaks, and progress daily</p>
    </div>
    <div class="quote">
      "The secret of getting ahead is getting started."
      <span>— Mark Twain</span>
    </div>
    <p>Your first step: set up your addiction profile and let our AI build your personal 21-day plan.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Start My Journey</a>
    <p class="small">Every single day of resistance is a victory worth celebrating. We're proud of you already.</p>
  `);

  return sendEmail({
    to,
    subject: `Welcome to Freedom Journey, ${name} 🌱`,
    html,
    text: `Welcome ${name}! Your recovery journey starts now. Visit ${process.env.FRONTEND_URL}/dashboard to begin.`,
  });
}

async function sendVerificationEmail({ to, name, verificationUrl }) {
  const html = baseTemplate(`
    <h1>Verify your email</h1>
    <p>Hi ${name}, please verify your email address to activate your Freedom Journey account.</p>
    <p>This link expires in <strong>24 hours</strong>.</p>
    <a href="${verificationUrl}" class="btn">Verify Email</a>
    <hr class="divider">
    <p class="small">If the button doesn't work, copy and paste this link into your browser:</p>
    <p class="small" style="word-break:break-all; color: #16a34a;">${verificationUrl}</p>
    <p class="small" style="margin-top:16px;">If you didn't create this account, you can safely ignore this email.</p>
  `);

  return sendEmail({
    to,
    subject: `Verify your Freedom Journey email`,
    html,
    text: `Hi ${name}, verify your email here: ${verificationUrl}`,
  });
}

async function sendLoginNotificationEmail({ to, name, loginTime, ipAddress }) {
  const html = baseTemplate(`
    <h1>New login detected</h1>
    <p>Hi ${name}, we noticed a new sign-in to your Freedom Journey account.</p>
    <div class="info-box">
      <p>🕐 &nbsp;<strong>Time:</strong> ${loginTime || 'Just now'}</p>
      <p style="margin-top:8px;">📍 &nbsp;<strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
      <p style="margin-top:8px;">🖥️ &nbsp;<strong>Device:</strong> Web Browser</p>
    </div>
    <p>If this was you — great, welcome back! Keep going with your recovery journey. 💪</p>
    <p>If this <strong>wasn't you</strong>, reset your password immediately.</p>
    <a href="${process.env.FRONTEND_URL}/reset-password" class="btn">Reset Password</a>
  `);

  return sendEmail({
    to,
    subject: `New login to your Freedom Journey account`,
    html,
    text: `Hi ${name}, new login detected at ${loginTime} from ${ipAddress}. If this wasn't you, reset your password.`,
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const html = baseTemplate(`
    <h1>Reset your password</h1>
    <p>Hi ${name}, we received a request to reset your Freedom Journey password.</p>
    <p>Click below to create a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <hr class="divider">
    <p class="small">If the button doesn't work, copy and paste this link:</p>
    <p class="small" style="word-break:break-all; color: #16a34a;">${resetUrl}</p>
    <p class="small" style="margin-top:16px;">If you didn't request this, ignore this email. Your password won't change.</p>
  `);

  return sendEmail({
    to,
    subject: `Reset your Freedom Journey password`,
    html,
    text: `Hi ${name}, reset your password here: ${resetUrl} — link expires in 1 hour.`,
  });
}

async function sendDailyMotivationEmail({ to, name, motivation, streakDays, addictionType }) {
  const { quote, message, challenge, recommendations, reflection_prompt, day_number } = motivation;

  const html = baseTemplate(`
    <h1>Day ${day_number || '?'} — Good morning, ${name} ☀️</h1>

    <div class="stat-row">
      <div class="stat">
        <div class="num">${streakDays || 0}</div>
        <div class="label">Day Streak 🔥</div>
      </div>
      <div class="stat">
        <div class="num">${day_number || 1}</div>
        <div class="label">Plan Day</div>
      </div>
      <div class="stat">
        <div class="num">${Math.max(0, 21 - (day_number || 1))}</div>
        <div class="label">Days Left</div>
      </div>
    </div>

    ${quote ? `
    <div class="quote">
      "${quote.text}"
      <span>— ${quote.author || 'Unknown'}</span>
    </div>` : ''}

    <p>${message || 'Keep going. You are doing better than you think.'}</p>

    ${challenge ? `
    <div class="info-box">
      <p><strong>🎯 Today's Challenge</strong></p>
      <p style="margin-top:8px;">${challenge}</p>
    </div>` : ''}

    ${recommendations ? `
    <hr class="divider">
    <p><strong>Curated for you today</strong></p>
    ${recommendations.youtube ? `<div class="info-box"><p>🎬 &nbsp;<strong>Watch:</strong> ${recommendations.youtube.title}</p></div>` : ''}
    ${recommendations.song ? `<div class="info-box"><p>🎵 &nbsp;<strong>Listen:</strong> ${recommendations.song.title} by ${recommendations.song.artist}</p></div>` : ''}
    ${recommendations.podcast ? `<div class="info-box"><p>🎙️ &nbsp;<strong>Podcast:</strong> ${recommendations.podcast.title}</p></div>` : ''}
    ` : ''}

    ${reflection_prompt ? `
    <hr class="divider">
    <div class="info-box">
      <p><strong>📖 Tonight's journal prompt</strong></p>
      <p style="margin-top:8px;">${reflection_prompt}</p>
    </div>` : ''}

    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Open Dashboard</a>
    <p class="small">You are stronger than your urges. We believe in you.</p>
  `);

  return sendEmail({
    to,
    subject: `Day ${day_number} — Your daily motivation is here`,
    html,
    text: `Good morning ${name}! Day ${day_number} of your journey. "${quote?.text}" — ${quote?.author}. Today's challenge: ${challenge}`,
  });
}

async function sendMilestoneEmail({ to, name, streakDays, addictionType }) {
  const milestones = {
    1:  { emoji: '🌱', title: 'First day complete!', msg: 'One full day down. The hardest day is already behind you.' },
    3:  { emoji: '✅', title: '3 days strong!', msg: 'Three days of freedom. Your brain is already beginning to heal.' },
    7:  { emoji: '🔥', title: 'One full week!', msg: 'A whole week! Your willpower is becoming your superpower.' },
    14: { emoji: '⚡', title: 'Two weeks free!', msg: 'Two weeks! You have broken through the initial habit loop.' },
    21: { emoji: '🏆', title: '21 days — habit broken!', msg: 'You did it. Science says it takes 21 days to break a habit. You are free.' },
    30: { emoji: '👑', title: '30 days — one full month!', msg: 'A full month of freedom. You are an inspiration.' },
    60: { emoji: '💎', title: '60 days — incredible!', msg: 'Two months strong. You have completely rewired your brain.' },
    90: { emoji: '🌟', title: '90 days — you made it!', msg: 'Three months. This is no longer a streak — this is your new life.' },
  };

  const m = milestones[streakDays] || {
    emoji: '💪',
    title: `${streakDays} days free!`,
    msg: `${streakDays} days of freedom. Every single day counts.`,
  };

  const html = baseTemplate(`
    <h1>${m.emoji} ${m.title}</h1>
    <p style="font-size:17px;">${m.msg}</p>

    <div class="stat-row">
      <div class="stat">
        <div class="num">${streakDays}</div>
        <div class="label">Days Free</div>
      </div>
      <div class="stat">
        <div class="num">${streakDays * 24}</div>
        <div class="label">Hours Strong</div>
      </div>
    </div>

    <div class="quote">
      "It does not matter how slowly you go as long as you do not stop."
      <span>— Confucius</span>
    </div>

    <p>You are proving every day that you are stronger than your ${addictionType || 'addiction'}. Keep going — the best days are ahead of you.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View My Progress</a>
  `);

  return sendEmail({
    to,
    subject: `${m.emoji} ${streakDays} day milestone — Freedom Journey`,
    html,
    text: `${m.title} — ${m.msg} Keep going, ${name}!`,
  });
}

async function sendRelapseEmail({ to, name, previousStreak, addictionType }) {
  const html = baseTemplate(`
    <h1>We're still here for you, ${name}</h1>
    <p>A relapse doesn't erase your progress. You had <span class="green">${previousStreak} days of real strength</span> — that counts and always will.</p>
    <p>Every person who has achieved long-term recovery has faced setbacks. What separates those who make it is simple: they get back up.</p>

    <div class="quote">
      "Our greatest glory is not in never falling, but in rising every time we fall."
      <span>— Confucius</span>
    </div>

    <div class="info-box">
      <p><strong>What to do right now</strong></p>
      <p style="margin-top:10px;">1. Take 3 deep breaths — you are safe</p>
      <p style="margin-top:6px;">2. Write in your journal — no judgment</p>
      <p style="margin-top:6px;">3. Identify what triggered this moment</p>
      <p style="margin-top:6px;">4. Start fresh — right now, this very moment</p>
    </div>

    <p>Your ${addictionType || 'recovery'} journey is <span class="green">not over</span>. It's just continuing. We reset the streak, not the progress.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Start Fresh Now</a>
    <p class="small">We're with you every step of the way. 💚</p>
  `);

  return sendEmail({
    to,
    subject: `We're still with you, ${name} 💚`,
    html,
    text: `${name}, a relapse doesn't erase your ${previousStreak} days of progress. Get back up — we're with you.`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
  sendDailyMotivationEmail,
  sendMilestoneEmail,
  sendRelapseEmail,
};