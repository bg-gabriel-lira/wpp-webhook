// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

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
app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  // req.body is now a Buffer containing the raw body
  console.log('Raw body:', req.body.toString('utf8'));
  res.send('OK');
});

app.post('/', express.raw({ type: '*/*' }), (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);

  console.log(`HEADERS: ${req.headers.toString('utf8')}`);
  console.log(`BODY: ${req.body.toString('utf8')}`);
  
  //console.log(`HEADERS: ${JSON.stringify(req.headers, null, 2)}`)
  //console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
