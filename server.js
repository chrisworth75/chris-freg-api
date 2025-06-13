// Import express module
const express = require('express');
const path = require('path');
const cors = require('cors');


// Create an express app
const app = express();
app.use(cors()); // Allow all origins — for dev only

app.get('/fees', (req, res) => {
    // Send the HTML file as a response
    console.log('we got a request for fees');
    const filePath = path.join(__dirname, 'responses/fees.json');
    res.sendFile(filePath);
});

app.get('/fee/:code', (req, res) => {
    // Send the HTML file as a response
    const code = req.params.code;
    console.log(`we got a request for fee ${code}`);
    const filePath = path.join(__dirname, 'responses/fee.json');
    res.sendFile(filePath);
});

// Set the app to listen on port 3000
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
