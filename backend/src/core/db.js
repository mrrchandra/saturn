const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let ca;
const caPath = path.join(__dirname, '../../ca.pem');

if (fs.existsSync(caPath)) {
    ca = fs.readFileSync(caPath, 'utf-8');
    console.log('Using local ca.pem for DB SSL');
} else if (process.env.DB_CA_PEM) {
    ca = process.env.DB_CA_PEM;
    console.log('Using DB_CA_PEM from environment for DB SSL');
} else {
    console.warn('⚠️ No CA provided, using rejectUnauthorized: false (insecure!)');
}

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    ssl: ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false },
});

// Test connection immediately
(async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Error connecting to DB', err.stack);
    }
})();

module.exports = pool; // can now directly use await pool.query(...)

