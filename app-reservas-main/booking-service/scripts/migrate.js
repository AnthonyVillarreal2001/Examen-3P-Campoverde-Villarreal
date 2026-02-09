const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const defaultSqlPath = path.join(__dirname, '..', 'migrations', '001_init.sql');
const sqlPath = process.env.MIGRATION_FILE || defaultSqlPath;

async function run() {
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const client = new Client({
        connectionString: process.env.POSTGRES_URL,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'bookingdb',
        user: process.env.POSTGRES_USER || 'booking',
        password: process.env.POSTGRES_PASSWORD || 'booking'
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
        await client.query(sql);
        console.log('Migration applied successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

run();
