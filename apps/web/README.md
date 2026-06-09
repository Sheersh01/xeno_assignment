# CRM Frontend Client

The **CRM Frontend** is the user-facing interface for the Xeno AI-Native Mini CRM project. 

It is built with **Next.js 16** (App Router) and serves as a highly interactive, heavily polished dashboard for marketers to build AI audiences, generate campaigns, and view live delivery telemetry.

## 🎯 Design Philosophy
We deliberately avoided standard "generic SaaS templates" or over-used Tailwind defaults. The application follows a **Premium, Dark-Mode First** design aesthetic heavily inspired by enterprise tools like Linear, Vercel, and Raycast.
- **Palette**: Deep charcoal backgrounds (`#0B0D0F`), elevated panels (`#111417`), subtle borders (`#1E2329`), and a sharp purple accent (`#8B5CF6`).
- **Typography**: Clean and confident, utilizing the `Inter` font.
- **UI Primitives**: All components (Buttons, Cards, Inputs, Dialogs) were built natively using Tailwind and Radix UI rather than dropping in a bulky pre-styled component library.

## 🏗 Core Screens & Architecture

1. **Dashboard (`/`)**: Aggregates high-level metrics and plots campaign funnels and delivery trends using custom-styled Recharts area and bar graphs.
2. **Customers Directory (`/customers`)**: A robust data table utilizing a Radix UI slide-over Dialog to view specific customer data, lifetime value (LTV), and recent order histories.
3. **AI Audience Builder (`/segments`)**: A sleek, chat-driven interface. Submitting natural language requests hits the backend's Gemini integration and returns a precise Prisma JSON query and an instant audience calculation.
4. **Campaign Wizard (`/campaigns/new`)**: A 5-step, interactive flow powered by **Zustand** global state. Users select a segment, prompt the AI to generate personalized marketing copy, let the AI recommend the best delivery channel, preview the payload, and dispatch it.
5. **Campaign Live Details (`/campaigns/[id]`)**: Features a **Live Delivery Pipeline**. Once a campaign is launched, the component polls the backend every 3 seconds, animating the Sent, Delivered, Opened, Clicked, and Failed counters in real-time as the background workers process webhooks. 
6. **Executive Analytics (`/analytics`)**: Aggregates AI Insights and plots delivery rates across all historic campaigns.

## 🚀 Tech Stack
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **State Management**: Zustand
- **API Client**: Axios (`lib/api.ts`)
- **Data Visualization**: Recharts

## 📦 Setup & Installation

```bash
cd apps/web
npm install
```

Configure your environment variable to point to the CRM Backend:
```env
# .env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 🏃‍♂️ Running the Client

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard.
