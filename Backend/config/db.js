// MySQL connection: settings from .env, pool, and schema setup.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const cfg = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: +process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};
const DB_NAME = process.env.DB_NAME || 'bobbys_repair';
if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) throw new Error('DB_NAME may only contain letters, numbers and underscore.');

const DB_DIR = path.join(__dirname, '..', '..', 'database');   // 1_*.sql, 2_*.sql ... run in number order
let pool;

async function init() {
  const boot = await mysql.createConnection(cfg);
  await boot.query('CREATE DATABASE IF NOT EXISTS `' + DB_NAME + '` CHARACTER SET utf8mb4');
  await boot.end();
  pool = mysql.createPool(Object.assign({}, cfg, {
    database: DB_NAME, connectionLimit: 10, decimalNumbers: true, multipleStatements: true
  }));
  const files = fs.readdirSync(DB_DIR).filter(f => /\.sql$/.test(f)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  for (const f of files) await pool.query(fs.readFileSync(path.join(DB_DIR, f), 'utf8'));
  return pool;
}
const q = (sql, params) => pool.query(sql, params);
const getPool = () => pool;

module.exports = { init, q, getPool, DB_NAME };
