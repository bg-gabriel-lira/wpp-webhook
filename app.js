// Import Express.js
const express = require('express');
const crypto = require('crypto');

// Create an Express app
const app = express();


// Middleware to parse JSON bodies
//app.use(express.json());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const APP_SECRET = 'a1c03d68de0e094fa80e5948899d1073';

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
 
  if (!signature) {
    return res.status(401).send('Signature missing');
  }
 
  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET)
    .update(req.rawBody)
    .digest('hex');
 
  if (signature !== expectedSignature) {
    return res.status(403).send('Invalid signature');
  }
 
  // Process the webhook payload
  const payload = req.body;
  console.log('Webhook payload:', payload);
  console.log("BOIDY: ", JSON.stringify(req.body));
 
  res.status(200).send('Webhook received successfully');
});

app.post('/webhook', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);

  console.log("HEADERS:", req.headers.toString('utf8'));
  console.log("BODY: ", req.body.toString('utf8'));
  
  //console.log(`HEADERS: ${JSON.stringify(req.headers, null, 2)}`)
  //console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
