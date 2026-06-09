# Channel Simulator Service

The **Channel Simulator** is an independent, mock third-party delivery engine microservice built for the Xeno AI-Native Mini CRM project.

## 🎯 Purpose
In a real-world CRM architecture, the CRM does not deliver messages itself. It relies on external vendors like Twilio (for SMS/WhatsApp), SendGrid (for Email), or Google (for RCS). 

The Channel Simulator mimics the behavior of these external vendors. When the CRM's dispatch worker needs to send a communication, it makes an HTTP POST request to this simulator instead of a real vendor. The simulator accepts the payload and then asynchronously fires webhooks back to the CRM to simulate the message's delivery lifecycle.

## 🏗 Architecture & Flow
1. **Receive Dispatch**: The simulator exposes a `POST /api/send` endpoint. The CRM calls this with the `communicationId` and `channel` (e.g., EMAIL, SMS).
2. **Accept Request**: The simulator immediately responds with a `200 OK` or `202 Accepted`, mimicking a non-blocking vendor API.
3. **Simulate Lifecycle via Webhooks**: In the background, the simulator sequentially hits the CRM's callback webhook URL (`http://localhost:4000/callbacks/webhook`) with status updates.
   - It always sends a `SENT` status.
   - 90% of the time, it sends a `DELIVERED` status.
   - 10% of the time, it sends a `FAILED` status.
   - It randomly simulates `OPENED`, `CLICKED`, and `PURCHASED` statuses to generate realistic dashboard telemetry.
   - It occasionally simulates a `REPLIED` status containing mock user text (e.g., "Stop texting me" or "Looks great") to trigger backend sentiment engines.
   - It introduces random `setTimeout` delays between each webhook call to realistically simulate network latency and human interaction times.

## 🚀 Tech Stack
- **Node.js**
- **Express**
- **TypeScript**
- **Axios** (for firing webhooks back to the CRM)

## 🛠 Recent Optimizations & Features
- **Simulated Conversational Webhooks**: Added randomized logic to fire `REPLIED` webhooks shortly after a `DELIVERED` status. This passes a mocked text payload (such as "Unsubscribe me") over the wire to test the CRM's new Sentiment Analysis compliance engines.
- **Resilient Webhook Flow**: Verified that the simulated randomized webhook intervals (delivering `SENT`, `OPENED`, `FAILED` payloads) correctly integrate with the CRM backend's updated polling schema without desyncing Live Activity Feeds.

## 📦 Setup & Installation
Since this is part of the larger monorepo, its dependencies are isolated.

```bash
cd apps/channel-simulator
npm install
```

## 🏃‍♂️ Running the Service
The simulator runs on port `4001` by default to avoid port collision with the main CRM backend (which runs on port `4000`).

```bash
npm run dev
```

You should see:
```bash
> Channel Simulator running on port 4001
```

When a campaign is launched from the frontend, you will see real-time console logs in this terminal indicating which webhooks are being fired back to the CRM:
```bash
[Simulator] Fired webhook: SENT for comm cmq6o0drm0002vywwxfiyux62
[Simulator] Fired webhook: DELIVERED for comm cmq6o0drm0002vywwxfiyux62
[Simulator] Fired webhook: OPENED for comm cmq6o0drm0002vywwxfiyux62
```
