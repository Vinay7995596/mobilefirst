const express = require('express');
const cors = require('cors'); // Import cors middleware
const app = express();
const port = 5000;
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

let db = null;

const initialiseDatabase = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "index.db"),
            driver: sqlite3.Database
        });

        await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT
        );`);

        app.listen(port, () => {
            console.log('server running on 5000');
        });
    } catch (e) {
        console.log(e, ': error in connection');
    }
};

initialiseDatabase();

// Middleware to parse JSON request bodies
app.use(express.json());
// Use cors middleware
app.use(cors());

// POST endpoint to add a new user
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await db.run(
            `INSERT INTO Users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, password]
        );
        res.status(201).json({ id: result.lastID, name, email, password });
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
