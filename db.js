const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = process.env.MYSQL_URL || {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'simrs_kanban',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

// Test koneksi saat startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database terhubung ke MySQL');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
    console.error('   Pastikan MySQL berjalan dan konfigurasi .env benar');
    console.error('   Jalankan: npm run setup-db untuk setup database');
    return false;
  }
}

module.exports = { pool, testConnection };
