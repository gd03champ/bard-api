require('dotenv').config();
const express = require('express');
const fetch = require("node-fetch");

const app = express();
const port = 5000;


// Middleware to parse JSON request body
app.use(express.json());
// Load PSID cookie from environment variable
//const psidCookie = '__Secure-1PSID=' + process.env.PSID_COOKIE;

// Define the root route
app.get('/', (req, res) => {
  res.send("Hello");
});

// Define the route to ask a question
app.post('/ask', async (req, resp) => {
  try {

    console.log(req.body);
    const prompt = req.body.prompt;
    const psidCookie = '__Secure-1PSID=' + req.body.psidCookie;

    // Fetch the initial response from bard.google.com
    const bardRes = await fetch("https://bard.google.com/", {
      method: 'get',
      headers: {
        "Host": "bard.google.com",
        "X-Same-Domain": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Origin": "https://bard.google.com",
        "Referer": "https://bard.google.com",
        'Cookie': psidCookie
      },
    });

    const bardText = await bardRes.text();

    // Extract the SNlM0e value from the response
    const match = bardText.match(/"SNlM0e":"(.*?)"/);
    const snlM0e = match ? match[1] : null;

    // Send a request to BardChatUi endpoint to generate a response
    const response = await fetch("https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20230510.09_p1&_reqid=229189&rt=c", {
      method: 'post',
      headers: {
        "Host": "bard.google.com",
        "X-Same-Domain": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Origin": "https://bard.google.com",
        "Referer": "https://bard.google.com",
        'Cookie': psidCookie
      },
      body: "f.req=[null,\"[[\\\"" + prompt + "\\\"],null,[\\\"\\\",\\\"\\\",\\\"\\\"]]\"]&at=" + snlM0e
    });

    const lines = (await response.text()).split("\n");

    // Find the longest line from the response
    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), "");

    // Parse the JSON response and extract the answer
    const jsonResponse = JSON.parse(JSON.parse(longestLine)[0][2]);
    const answer = jsonResponse[0][0];

    resp.send(answer);
  } catch (err) {
    resp.send('Error: ' + err);
  }
});

// Define a route to check if the API is working
app.get('/', (req, resp) => {
  resp.send("This is an unofficila free API for Google Bard made by GD 👉 (gd03champ.web.app)");
});

// Start the server
app.listen(port, () => {
  console.log('Bard API app listening on port 5000!');
});