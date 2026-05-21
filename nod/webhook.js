javascript
const crypto = require('crypto');

module.exports = (logger) => {
  const router = require('express').Router();
 router.post('/github', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Verify webhook signature (optional)
    if (process.env.WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
      const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
      if (signature !== digest) {
        logger.warn('Invalid GitHub webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    logger.info(`Received GitHub event: ${event}`);

    // Handle different event types
    switch (event) {
      case 'push':
        logger.info(`Push to ${payload.repository?.full_name} by ${payload.pusher?.name}`);
        // Trigger deployment script here
        break;
      case 'pull_request':
        logger.info(`PR ${payload.pull_request?.title} ${payload.action}`);
        break;
      default:
        logger.info(`Unhandled event: ${event}`);
    }

    res.json({ received: true, event });
  });
