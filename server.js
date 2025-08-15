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

app.get('/fee/:code', async (req, res) => {
    const code = req.params.code;

    try {
        const query = 'SELECT * FROM fees WHERE code = $1';
        const { rows } = await pool.query(query, [code]);

        if (rows.length === 0) {
            return res.status(404).json({ error: `Fee with code '${code}' not found.` });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching fee:', err);
        res.status(500).json({ error: 'Failed to fetch fee' });
    }
});
app.post('/fee', async (req, res) => {
    const {
        code,
        value,
        description,
        status,
        start_date,
        end_date,
        type,
        service,
        jurisdiction1,
        jurisdiction2,
    } = req.body;

    // Validate required fields
    if (
        typeof code !== 'string' ||
        typeof value !== 'number' ||
        typeof description !== 'string' ||
        typeof status !== 'string'
    ) {
        console.log('returning 400 - bad request');
        return res.status(400).json({ error: 'code, value, description, and status are required and must be valid types.' });
    }

    // Allowed enum values
    const allowedTypes = ['fixed', 'ranged'];
    const allowedServices = ['kylie', 'jason'];
    const allowedJurisdictions1 = ['bonnie', 'clyde'];
    const allowedJurisdictions2 = ['tom', 'jerry'];

    // Validate enums if provided
    if (type && !allowedTypes.includes(type)) {
        console.log('returning 400 - bad request');
        return res.status(400).json({ error: `Invalid type. Allowed: ${allowedTypes.join(', ')}` });
    }
    if (service && !allowedServices.includes(service)) {
        console.log('returning 400 - bad request');
        return res.status(400).json({ error: `Invalid service. Allowed: ${allowedServices.join(', ')}` });
    }
    if (jurisdiction1 && !allowedJurisdictions1.includes(jurisdiction1)) {
        console.log('returning 400 - bad request');
        return res.status(400).json({ error: `Invalid jurisdiction1. Allowed: ${allowedJurisdictions1.join(', ')}` });
    }
    if (jurisdiction2 && !allowedJurisdictions2.includes(jurisdiction2)) {
        console.log('returning 400 - bad request');
        return res.status(400).json({ error: `Invalid jurisdiction2. Allowed: ${allowedJurisdictions2.join(', ')}` });
    }

    // Helper to get today at noon local time
    function todayAtNoon() {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        return d;
    }

    // Default dates
    const startDateVal = start_date ? new Date(start_date) : todayAtNoon();
    const endDateVal = end_date ? new Date(end_date) : new Date(startDateVal.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Default type and service and jurisdictions
    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const typeVal = type || randomChoice(allowedTypes);
    const serviceVal = service || randomChoice(allowedServices);
    const jurisdiction1Val = jurisdiction1 || randomChoice(allowedJurisdictions1);
    const jurisdiction2Val = jurisdiction2 || randomChoice(allowedJurisdictions2);

    try {
        const query = `
      INSERT INTO fees (
        code, value, description, status, start_date, end_date,
        type, service, jurisdiction1, jurisdiction2
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

        const values = [
            code,
            value,
            description,
            status,
            startDateVal,
            endDateVal,
            typeVal,
            serviceVal,
            jurisdiction1Val,
            jurisdiction2Val,
        ];

        const { rows } = await pool.query(query, values);
        console.log('returning 201 - fee created');
        res.status(201).json({ fee: rows[0] });
    } catch (err) {
        // Postgres unique violation error code is '23505'
        if (err.code === '23505') {
            console.log('returning 409 - conflict');
            return res.status(409).json({ error: 'Fee with this code already exists.' });
        }
        console.log('returning 500 - error');
        console.error('Error inserting fee:', err);
        res.status(500).json({ error: 'Failed to insert fee' });
    }
});

app.post('/reset-db', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE fees RESTART IDENTITY CASCADE;');
        console.log('Fees table truncated');
        res.status(200).send('Fees table cleared');
    } catch (err) {
        console.error('Error truncating fees table:', err);
        res.status(500).send('Failed to clear fees table');
    }
});


// Set the app to listen on port 3000
app.listen(8081, () => {
    console.log('Server running on http://localhost:8081');
});
