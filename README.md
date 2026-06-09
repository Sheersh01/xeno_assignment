# AI-Native Mini CRM

> Built for Xeno Engineering take-home assignment.

---

## Problem Statement

Marketing teams need to reach the right customers at the right time — but building precise audience segments and writing personalized campaign copy is slow, manual, and requires engineering support.

This CRM solves that by letting marketers describe audiences and goals in plain English. AI translates intent into exact queries, generates copy, recommends channels, and surfaces insights — all backed by a resilient async delivery pipeline that mirrors real-world communication infrastructure.

---

## Architecture

```
Marketer
   │
   ▼
┌──────────────────────────────┐
│   Frontend  (Next.js :3000)  │
│   Zustand · Recharts · UI    │
└──────────┬───────────────────┘
           │ REST
           ▼
┌──────────────────────────────┐
│  CRM Backend  (Express :4000)│
│  Prisma · PostgreSQL         │
│  Gemini (AI features)        │
└──────────┬───────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
dispatch-      insights-
queue          queue
(BullMQ)       (BullMQ)
     │
     ▼
┌──────────────────────────────┐
│  Channel Simulator  (:4001)  │
│  Mock Twilio/SendGrid        │
│  Fires: SENT/DELIVERED/      │
│         OPENED/FAILED        │
└──────────┬───────────────────┘
           │ Webhook POST
           ▼
      callback-queue
        (BullMQ)
           │
           ▼
    Campaign Stats
    (PostgreSQL)
           │
           ▼
    AI Insights
    (Gemini → insights-queue)
```

**Bull Board** for queue monitoring: `http://localhost:4000/admin/queues`

---

## AI Features

| Feature | How it works |
|---|---|
| **Natural Language Segments** | Marketer types a plain-English description (e.g. *"Customers who spent more than ₹5000 and haven't purchased in 60 days"*). Gemini translates this into a structured Prisma JSON filter. Audience size renders in real-time. |
| **Autonomous A/B Testing** | Campaign wizard asks Gemini for 3 distinct message variants (Urgency, Value, Casual). The system dynamically samples 15% of the audience, evaluates engagement via a delayed BullMQ worker, asks Gemini to explain *why* the winner won, and auto-dispatches the remainder. |
| **Sentiment Intelligence** | Incoming mock customer replies are analyzed by Gemini. If classified as an "OPT_OUT" or angry response, the customer's global `dnd` flag is toggled on, blocking future campaigns automatically. |
| **Channel Recommendation** | Based on campaign objective, Gemini recommends best delivery channel (Email / SMS / WhatsApp / RCS). |
| **Campaign Insights** | After campaign completes, an async `insights-queue` worker feeds final delivery + engagement stats to Gemini. Returns a 1–2 sentence executive summary shown on the analytics page. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zustand, Recharts, Lucide |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache / Queue | Redis + BullMQ |
| AI | Google Gemini 1.5 Flash |
| Dev Tooling | tsx, Bull Board |

---

## Tradeoffs & Design Decisions

**Controlled JSON generation over text-to-SQL.**
Gemini outputs a structured Prisma filter object, not raw SQL. This keeps audience resolution deterministic and safe — no risk of injection, no unpredictable query shapes, easier to validate and debug. The tradeoff is reduced flexibility; complex nested logic may need prompt refinement, but correctness wins over expressiveness here.

**BullMQ for async dispatch and webhook processing.**
Campaign sends are fire-and-forget from the API's perspective. BullMQ handles the dispatch worker, exponential backoff on failures, and the callback worker that processes incoming webhooks — exactly how production systems like Twilio integrations are built. This keeps the main event loop clean and makes the system resilient to Channel Simulator latency or failures.

**Simulated delivery engine instead of real providers.**
For assignment scope, the Channel Simulator mimics the behavior of a real messaging provider (random SENT/DELIVERED/OPENED/FAILED events with realistic timing). This lets the full async pipeline — dispatch → webhook → stats update → AI insights — be demonstrated end-to-end without API keys or cost. Replacing it with real Twilio/SendGrid requires only swapping the dispatch worker's HTTP target.

**Polling over WebSockets for real-time dashboard.**
The campaign details page polls every 3 seconds instead of maintaining a persistent WebSocket connection. Simpler to implement and sufficient for this use case — campaigns complete in seconds during demo. For production with thousands of concurrent users, WebSockets or SSE would be the right call.

**Graceful AI degradation.**
Every Gemini call is wrapped in try/catch with a predictable fallback object. The app never crashes on missing API keys or quota errors — it just surfaces safe defaults. This is a hard requirement for any AI-integrated system in production.

---

## Recent Optimizations & Features

- **Autonomous A/B Testing (USP)**: Completely refactored the core execution engine to support 3-variant split testing using delayed BullMQ queues (`ab-test-queue`). Evaluates responses mathematically before falling back to AI solely for analytical insight, saving costs while delivering a highly intelligent feature.
- **Global DND via AI Sentiment**: Simulated webhook replies are intercepted, classified by Gemini (`OPT_OUT`, `QUESTION`, `POSITIVE`), and automatically trigger compliance logic (`Customer.dnd`), bridging the gap between passive delivery telemetry and active conversational intelligence.
- **Scalable Customer Search**: Moved from client-side array filtering to a robust server-side database search using Prisma's `contains` filter. The frontend now features a custom `useDebounce` hook (300ms) and local memory caching (`Map`) to prevent unnecessary network requests.
- **Campaign Payload Optimization**: Fixed an `AxiosError: Network Error` crash that occurred when loading large campaigns. The `getCampaignById` endpoint now paginates nested communications (`take: 15`), drastically reducing the JSON payload size and preventing Node.js Out-Of-Memory errors.
- **Live Stats Polling Fix**: Fixed a bug where the Live Activity Feed stats would reset to `0` after the initial page load by aligning the backend API response keys (`sentCount`, `deliveredCount`) with the frontend state expectations.

---

## Setup

### Prerequisites

- Node.js v18+
- PostgreSQL
- Redis (`docker run --name redis -p 6379:6379 -d redis`)

### Environment

`apps/crm/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_crm?schema=public"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
GEMINI_API_KEY="your_google_gemini_api_key"
```

`apps/web/.env`
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Install

```bash
cd apps/crm && npm install
cd ../channel-simulator && npm install
cd ../web && npm install
```

### Database

```bash
cd apps/crm
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

---

## Running

Three terminals, run concurrently:

```bash
# Terminal 1
cd apps/channel-simulator && npm run dev
# → http://localhost:4001

# Terminal 2
cd apps/crm && npm run dev
# → http://localhost:4000
# → Bull Board: http://localhost:4000/admin/queues

# Terminal 3
cd apps/web && npm run dev
# → http://localhost:3000
```