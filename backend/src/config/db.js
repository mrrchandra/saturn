const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, '../../ca.pem')).toString(),
    },
};

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Database connected successfully');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
