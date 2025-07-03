// Import express module
const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db'); // adjust path if needed



// Create an express app
const app = express();
app.use(cors()); // Allow all origins — for dev only
app.use(express.json()); // Parse JSON bodies


app.get('/fees', async (req, res) => {
    // Send the HTML file as a response
    // console.log('we got a request for fees');
    // const filePath = path.join(__dirname, 'responses/fees.json');
    // res.sendFile(filePath);
    try {
        const result = await pool.query('SELECT * FROM fees ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }


});

app.get('/fee/:code', (req, res) => {
    // Send the HTML file as a response
    const code = req.params.code;
    console.log(`we got a request for fee ${code}`);
    const filePath = path.join(__dirname, 'responses/fee.json');
    res.sendFile(filePath);
});

app.post('/fee', (req, res) => {
    const { code, value, description } = req.body;

    // Basic validation
    if (typeof code !== 'string' || typeof value !== 'number' || typeof description !== 'string') {
        return res.status(400).json({ error: 'Invalid Fee object format.' });
    }

    console.log('Received Fee:', { code, value, description });

    res.status(200).json({ message: 'Fee received successfully.' });
});

// Set the app to listen on port 3000
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
