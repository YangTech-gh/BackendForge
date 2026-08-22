<div align="center">

# Backend Forge

**From API Builders to AI-Native Systems Architects**

Interactive backend architecture, distributed systems, and AI engineering platform with hands-on labs, AI mentor, and verified certificates.

[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://github.com/YangTech-gh/BackendForge/deployments)

</div>

---

## Features

- **16 Course Tracks** - From fundamentals to AI-native systems architecture
- **34 Interactive Labs** - Hands-on coding with real-world scenarios
- **AI Mentor** - Gemini-powered code review and architecture guidance
- **Verified Certificates** - Public verification endpoint
- **Stripe Integration** - Pro tier with lifetime access ($199)
- **16 Starter Kits** - Production-ready templates for every track
- **Teardown Articles** - Deep dives into Stripe, Vercel, and Cloudflare
- **Workshops** - Live community sessions with industry speakers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Supabase Edge Functions (Deno) |
| Database | PostgreSQL via Supabase (17 tables, 35 indexes) |
| Auth | Google OAuth via Supabase Auth |
| Payments | Stripe Checkout + Webhooks |
| AI | Google Gemini API (2.5 Flash) |
| Animations | Motion (Framer Motion successor) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (recommended) or npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local backend)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for payment testing)

### 1. Clone & Install

```bash
git clone https://github.com/YangTech-gh/BackendForge.git
cd BackendForge
bun install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Start Local Backend

```bash
supabase start
```

### 4. Seed Database

```bash
supabase db reset
```

### 5. Start Frontend

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
backend-forge/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── InteractiveLab/       # Code editor + AI mentor
│   │   ├── DashboardView.tsx     # User progress dashboard
│   │   ├── LandingPage.tsx       # Marketing page
│   │   └── ...
│   ├── context/                  # React contexts (Auth, Toast)
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities (supabase client, API)
│   └── constants/                # Pricing config
├── supabase/                     # Backend
│   ├── functions/                # 16 Edge Functions
│   ├── migrations/               # 8 SQL migrations (001-008)
│   ├── seed*.sql                 # Database seeds
│   └── config.toml               # Supabase config
├── starter-kits/                 # 16 production-ready templates
│   ├── track-1-api-blueprint/
│   ├── track-2-node-ts/
│   └── ...
└── *.md                          # Documentation
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Edge Functions](EDGE_FUNCTIONS.md) | All 16 Edge Functions - auth, rate limits, schemas |
| [Database Schema](TABLES.md) | 17 tables, 35 indexes, column definitions |
| [RLS Policies](RLS.md) | Row Level Security architecture |
| [Stripe Integration](STRIPE.md) | Payment flow and webhook handling |
| [Integrations](INTEGRATIONS.md) | Supabase, Stripe, and Gemini setup |
| [Migration Audit](CHANGES.md) | Frontend-to-backend migration checklist |

---

## Edge Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `stripe-checkout` | Create Stripe Checkout Session | Yes |
| `stripe-webhook` | Process Stripe events | No (Stripe sig) |
| `stripe-portal` | Billing portal redirect | Yes |
| `request-refund` | Process refunds | Yes |
| `ai-system-review` | AI architecture evaluation | Yes |
| `ai-lab-evaluator` | AI code review | Yes |
| `ai-ask-tutor` | AI tutor Q&A | Yes |
| `get-courses` | Fetch tracks and labs | Yes |
| `get-lab` | Fetch single lab | Yes |
| `submit-lab-completion` | Mark lab complete + XP | Yes |
| `get-user-progress` | Dashboard progress data | Yes |
| `upgrade-pro` | Redirect to Stripe Checkout | Yes |
| `verify-certificate` | Public certificate verification | No |
| `get-user-profile` | User profile data | Yes |
| `get-teardowns` | Teardown articles | Yes |
| `get-starter-kits` | Starter kit templates | Yes |
| `get-workshops` | Workshop events | Yes |
| `book-coaching-session` | Book coaching call | Yes |
| `save-starter-kit` | Save kit to profile | Yes |

---

## Security

- **4-Layer Defense:** JWT Auth > Edge Function Logic > RLS Policies > DB Constraints
- **RLS on all 17 tables** - No data accessible without explicit policy
- **Service role bypasses RLS** - Edge Functions use service role for business logic
- **Stripe webhook verification** - Signature validation on all payment events
- **Rate limiting** - Per-user limits on all sensitive endpoints
- **Audit logging** - All mutations logged to `audit_log` table

See [RLS.md](RLS.md) for complete security architecture.

---

## API Keys

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Backend (Supabase Secrets)

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_PRO_LIFETIME=price_xxx
supabase secrets set APP_URL=https://your-app.com
supabase secrets set GEMINI_API_KEY=your-key
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Build for production |
| `bun run lint` | TypeScript type check |
| `bun run seed` | Reset and seed database |

---

## License

MIT
