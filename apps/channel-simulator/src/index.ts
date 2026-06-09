import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const CRM_WEBHOOK_URL = 'http://localhost:4000/webhook/events';

app.post('/send', (req, res) => {
  const { communicationId, customerId, channel, message } = req.body;
  
  if (!communicationId) {
    return res.status(400).json({ error: 'communicationId is required' });
  }

  // Acknowledge receipt immediately
  res.status(202).json({ status: 'accepted' });

  // Simulate external provider processing asynchronously
  setTimeout(() => {
    const isFailed = Math.random() < 0.05; // 5% chance FAILED
    
    if (isFailed) {
      fireWebhook(communicationId, 'FAILED');
      return; // Stop flow
    }

    // 95% DELIVERED
    fireWebhook(communicationId, 'DELIVERED');

    setTimeout(() => {
      const isOpened = Math.random() < 0.40; // 40% of delivered => OPENED
      
      if (isOpened) {
        fireWebhook(communicationId, 'OPENED');

        setTimeout(() => {
          const isClicked = Math.random() < 0.15; // 15% of opened => CLICKED
          
          if (isClicked) {
            fireWebhook(communicationId, 'CLICKED');
          }
        }, 3000); // 3 seconds later
      }
    }, 2000); // 2 seconds later
  }, 1000); // 1 second later
});

async function fireWebhook(communicationId: string, eventType: string) {
  try {
    await axios.post(CRM_WEBHOOK_URL, { communicationId, eventType });
    console.log(`[Simulator] Fired webhook: ${eventType} for comm ${communicationId}`);
  } catch (error) {
    console.error(`[Simulator] Failed to fire webhook for comm ${communicationId}:`, error.message);
  }
}

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Channel Simulator running on port ${PORT}`);
});
