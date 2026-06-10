# CRM Frontend Client

The **CRM Frontend** is the user-facing interface for the Xeno AI-Native Mini CRM project. 

It is built with **Next.js 16** (App Router) and serves as a highly interactive, heavily polished dashboard for marketers to build AI audiences, generate campaigns, and view live delivery telemetry.

## 🎯 Design Philosophy
We deliberately avoided standard "generic SaaS templates" or over-used Tailwind defaults. The application follows a **Premium, Minimalist** design aesthetic heavily inspired by enterprise developer tools like Vercel and Next.js.
- **Palette**: Pure black backgrounds (`#000000`), monochrome high-contrast text (`#EDEDED` vs `#000`), and subtle glassy borders (`border-white/10`) with `white/[0.02]` linear gradients instead of flat boxes.
- **Interactivity**: Fluid glowing hover states (`shadow-[0_8px_30px_rgba(255,255,255,0.04)]`) and fully monochromatic Recharts components that elegantly react to user presence.
- **Typography**: Clean, tightly tracked (`tracking-tight`), utilizing the `Inter` font for a strict, editorial feel.
- **UI Primitives**: All components (Buttons, Cards, Inputs, Dialogs) were built natively using Tailwind and Radix UI rather than dropping in a bulky pre-styled component library.

## 🏗 Core Screens & Architecture

1. **Dashboard (`/`)**: Aggregates high-level metrics and plots campaign funnels and delivery trends using custom-styled Recharts area and bar graphs.
2. **Customers Directory (`/customers`)**: A robust data table utilizing a Radix UI slide-over Dialog to view specific customer data, lifetime value (LTV), and recent order histories.
3. **AI Audience Builder (`/segments`)**: A sleek, chat-driven interface. Submitting natural language requests hits the backend's Gemini integration and returns a precise Prisma JSON query and an instant audience calculation.
4. **Campaign Wizard (`/campaigns/new`)**: A 5-step interactive flow. Users select an audience segment, and the AI automatically generates 3 distinct A/B testing variants (Urgency, Value, Casual). Users review the AI's channel recommendation before launching the experiment.
5. **Campaign Live Details (`/campaigns/[id]`)**: Features a **Live Delivery Pipeline** and a dedicated **Live A/B Testing** grid. While the 15-second experiment runs, it updates the variant scores in real-time. Once the winner is selected, the page displays a trophy banner with the Gemini-generated insight on why it won. It also detects "REPLIED" events in the live feed.
6. **Executive Analytics (`/analytics`)**: Aggregates AI Insights and plots delivery rates across all historic campaigns.

## 🚀 Tech Stack
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **State Management**: Zustand
- **API Client**: Axios (`lib/api.ts`)
- **Data Visualization**: Recharts

## 🛠 Recent Optimizations & Features
- **A/B Testing UI Integration**: Redesigned the Campaign Details dashboard to gracefully handle the complex `isTestingPhase` state, rendering live split-test statistics before transitioning to a "Winner Selected" insight view.
- **Debounced Search with Caching**: The `/customers` directory now utilizes a custom `useDebounce` hook to delay backend search queries by 300ms, coupled with a `Map` cache to instantly render previously searched queries without redundant network calls.
- **Live Polling Fix**: Resolved an issue in the `/campaigns/[id]` Live Activity Feed where real-time stats would briefly reset to 0 by perfectly mapping the polling schema to the initial SSR state.
- **Next.js Premium UI Aesthetics**: Refactored the entire frontend to use a dark monochrome color palette, subtle glassmorphism (`bg-gradient-to-b from-white/[0.02]`), negative letter-spacing typography, and dynamic glow interactions that perfectly mirror modern developer-first tooling.

## ☁️ Production Deployment (Vercel)

This frontend is configured for instant deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Select **Next.js** as the Framework Preset.
3. Set the **Root Directory** to `apps/web`.
4. Under Environment Variables, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed CRM Backend URL (e.g., `https://<your-crm-backend>.onrender.com`).

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
