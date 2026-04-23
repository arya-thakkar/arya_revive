# 🌱 Freedom Journey — Backend API

A production-ready Node.js + Express backend for a motivational addiction recovery web application.
Powered by Supabase (PostgreSQL + Auth + Realtime), Google Gemini or Groq AI, and Resend/Gmail for email.

---

## 📁 Folder Structure

```
freedom-journey/
├── src/
│   ├── server.js                  # Entry point — starts HTTP server
│   ├── app.js                     # Express app — middleware + route mounting
│   │
│   ├── config/
│   │   └── supabase.js            # Supabase client (anon + service role)
│   │
│   ├── controllers/               # Request handlers (thin, delegate to services)
│   │   ├── auth.controller.js     # signup, login, OAuth, logout, forgot-password
│   │   ├── user.controller.js     # getProfile, updateProfile, deleteAccount
│   │   ├── addiction.controller.js # CRUD + relapse logging
│   │   ├── plan.controller.js     # AI 21-day plan generation + retrieval
│   │   ├── journal.controller.js  # Journal CRUD
│   │   ├── checkin.controller.js  # Daily check-ins + streak management
│   │   ├── urge.controller.js     # Urge logging + AI coping response
│   │   ├── dashboard.controller.js # Aggregated dashboard data
│   │   └── ai.controller.js       # Daily motivation, chat, reflection
│   │
│   ├── middleware/
│   │   ├── auth.js                # JWT verification via Supabase
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── notFound.js            # 404 handler
│   │   ├── rateLimiter.js         # express-rate-limit (general, auth, AI)
│   │   └── validate.js            # Joi schema validation
│   │
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── user.routes.js         # /api/users/*
│   │   ├── addiction.routes.js    # /api/addictions/*
│   │   ├── plan.routes.js         # /api/plans/*
│   │   ├── journal.routes.js      # /api/journal/*
│   │   ├── checkin.routes.js      # /api/checkins/*
│   │   ├── urge.routes.js         # /api/urges/*
│   │   ├── dashboard.routes.js    # /api/dashboard/*
│   │   └── ai.routes.js           # /api/ai/*
│   │
│   ├── services/
│   │   ├── ai.service.js          # Gemini + Groq unified AI interface
│   │   └── email.service.js       # Resend + Gmail SMTP + email templates
│   │
│   └── utils/
│       └── helpers.js             # asyncHandler, daysBetween, formatSavings
│
├── sql/
│   └── schema.sql                 # Full Supabase PostgreSQL schema + RLS policies
│
├── .env.example                   # Environment variable template
├── package.json
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9
- A **Supabase** project → [supabase.com](https://supabase.com)
- One of:
  - **Groq** API key (free) → [console.groq.com](https://console.groq.com)
  - **Google Gemini** API key → [aistudio.google.com](https://aistudio.google.com)
- One of:
  - **Resend** API key (recommended) → [resend.com](https://resend.com)
  - **Gmail** account + App Password

---

## 🚀 Installation & Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourname/freedom-journey-backend.git
cd freedom-journey-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Open .env and fill in all required values
```

**Required variables:**

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) |
| `AI_PROVIDER` | `groq` or `gemini` |
| `GROQ_API_KEY` | Groq API key (if using Groq) |
| `GEMINI_API_KEY` | Gemini API key (if using Gemini) |
| `EMAIL_PROVIDER` | `resend` or `gmail` |
| `RESEND_API_KEY` | Resend API key (if using Resend) |
| `GMAIL_USER` | Gmail address (if using Gmail) |
| `GMAIL_APP_PASSWORD` | Gmail App Password (if using Gmail) |
| `FRONTEND_URL` | Your frontend URL (for CORS + email links) |

### 3. Set Up Supabase Database

1. Go to your Supabase project → **SQL Editor**
2. Paste the entire contents of `sql/schema.sql`
3. Click **Run**

This creates all tables, indexes, RLS policies, and triggers.

### 4. Enable Google OAuth (optional)

In Supabase Dashboard → **Authentication → Providers → Google**:
- Enable Google provider
- Add your Google OAuth Client ID and Secret
- Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register with email + password |
| POST | `/login` | Email + password login |
| POST | `/google` | Get Google OAuth redirect URL |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate session |
| POST | `/forgot-password` | Send reset email |

### Users — `/api/users` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/me` | Get own profile |
| PATCH | `/me` | Update profile / email opt-in |
| DELETE | `/me` | Delete account (anonymise) |

### Addictions — `/api/addictions` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all addictions |
| POST | `/` | Add addiction (max 3) |
| GET | `/:id` | Get one addiction |
| PATCH | `/:id` | Update addiction data |
| DELETE | `/:id` | Remove addiction |
| POST | `/:id/relapse` | Log relapse, reset streak |

### Plans — `/api/plans` 🔒
| Method | Path | Description |
|---|---|---|
| POST | `/generate/:addictionId` | Generate AI 21-day plan |
| GET | `/:addictionId` | Fetch existing plan |
| GET | `/:addictionId/day/:dayNumber` | Get single day details |

### Dashboard — `/api/dashboard` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/?addiction_id=uuid` | Full dashboard snapshot |
| GET | `/stats/weekly?addiction_id=uuid` | 7-day mood + urge chart data |

### AI — `/api/ai` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/daily-motivation/:addictionId` | Get or generate today's motivation |
| POST | `/chat` | Recovery support chat |
| POST | `/journal-reflection` | AI reflection on journal entry |

### Journal — `/api/journal` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/?addiction_id=uuid` | List journal entries (paginated) |
| POST | `/` | Create entry |
| PATCH | `/:id` | Update entry |
| DELETE | `/:id` | Delete entry |

### Check-ins — `/api/checkins` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/?addiction_id=uuid&month=YYYY-MM` | Get check-ins |
| POST | `/` | Log today's check-in (once/day) |

### Urges — `/api/urges` 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/?addiction_id=uuid` | Get urge history + stats |
| POST | `/` | Log urge, get AI coping message |

🔒 = Requires `Authorization: Bearer <token>` header

---

## 🔐 Authentication Flow

```
Frontend → POST /api/auth/signup or /login
         ← { session: { access_token, refresh_token }, user }

All subsequent requests:
Frontend → Headers: { Authorization: "Bearer <access_token>" }
         ← Protected resource

Token expired:
Frontend → POST /api/auth/refresh { refresh_token }
         ← { session: { new access_token } }
```

---

## 🤖 AI Rate Limits

AI endpoints are rate-limited to **30 requests/hour** per IP to manage costs.
General API endpoints: **100 requests/15 minutes**.
Auth endpoints: **10 requests/15 minutes**.

---

## 🛡️ Security Features

- **Helmet** — Sets secure HTTP headers
- **CORS** — Restricted to `FRONTEND_URL`
- **Rate limiting** — Three tiers (general, auth, AI)
- **Joi validation** — All request bodies validated and sanitised
- **Supabase RLS** — Row-level security so users only access their own data
- **Service role key** — Never exposed to client; used server-side only
- **Input size limits** — 10kb body limit

---

## 📧 Email Setup

### Option A: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key
4. Set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY=...`

### Option B: Gmail SMTP
1. Enable 2FA on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail"
4. Set `EMAIL_PROVIDER=gmail`, `GMAIL_USER=...`, `GMAIL_APP_PASSWORD=...`

---

## 🚀 Production Deployment

### Environment
```bash
NODE_ENV=production
PORT=5000
```

### Recommended Platforms
- **Railway** — `railway up`
- **Render** — Connect GitHub repo, add env vars
- **Fly.io** — `fly launch`
- **DigitalOcean App Platform**

### PM2 (VPS)
```bash
npm install -g pm2
pm2 start src/server.js --name freedom-journey
pm2 save && pm2 startup
```
