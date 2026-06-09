# CRM Backend Service

The **CRM Backend** is the core operational engine of the Xeno AI-Native Mini CRM project. 

It is built as a robust, decoupled Express application that manages all database interactions, asynchronous background job queuing, and communication with Google's Generative AI.

## 🎯 Purpose
Unlike traditional simple CRUD apps, this backend is built for scale. It handles generating dynamic Prisma queries from AI prompts, executing mass communication dispatches without blocking the main Node.js event loop, and processing high volumes of incoming webhook telemetry.

## 🏗 Architecture & Core Modules

### 1. The Database Layer (Prisma + PostgreSQL)
- All schema logic is strictly typed and managed via Prisma (`prisma/schema.prisma`).
- Includes comprehensive models for `Customer`, `Segment`, `Campaign`, `Communication`, `Event`, and `CampaignStats`.
- Provides atomic updates (e.g., upserting campaign delivery statistics as webhooks stream in).

### 2. The AI Service (`services/ai.service.ts`)
Acts as the central gateway to Google's Gemini API (utilizing `gemini-2.5-flash`). It exposes heavily typed, schema-enforced functions:
- **`generateSegmentFilter`**: Converts natural language into a valid Prisma JSON object.
- **`generateCampaignMessage`**: Generates personalized copy based on segment descriptions.
- **`recommendChannel`**: Evaluates segment data to recommend SMS, Email, or WhatsApp.
- **`generateCampaignInsight`**: Analyzes final delivery metrics to generate a 1-sentence executive summary.
- *Graceful Degradation*: Every AI function implements a safe `catch` block that returns predictable fallback data if the API rate-limits (503) or the key is missing.

### 3. The Queueing Engine (BullMQ + Redis)
To prevent the main API thread from locking up during mass dispatches or heavy webhook traffic, all heavy lifting is pushed to background workers:
- **`dispatch-queue`**: When a campaign launches, every single customer communication is queued here. A worker processes this queue and pushes requests to the external Channel Simulator.
- **`callback-queue`**: The Channel Simulator fires lifecycle webhooks (`DELIVERED`, `OPENED`, `FAILED`) to the CRM. The CRM immediately drops the webhook into this queue (returning a fast `200 OK`) and a worker updates the database asynchronously.
- **`insights-queue`**: Once a campaign completes, a job is queued here to trigger the AI analysis worker.
- **Bull Board**: A live UI to monitor queues is mounted at `/admin/queues`.

## 🚀 Tech Stack
- **Node.js** & **Express**
- **TypeScript**
- **PostgreSQL** (Database)
- **Prisma** (ORM)
- **Redis** & **BullMQ** (Job Queues)
- **Google Generative AI SDK**

## 📦 Setup & Installation

```bash
cd apps/crm
npm install
```

Configure your environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_crm?schema=public"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
GEMINI_API_KEY="your_google_api_key_here"
```

Initialize the database and seed it with dummy data:
```bash
npx prisma db push
npx prisma generate
npm run prisma:seed
```

## 🏃‍♂️ Running the Service

```bash
npm run dev
```

You should see:
```bash
> CRM running on 4000
```

You can view the active Redis queues at `http://localhost:4000/admin/queues`.
