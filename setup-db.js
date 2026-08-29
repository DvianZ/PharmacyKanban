/**
 * SIMRS Kanban - Database Setup Script
 * Jalankan: node setup-db.js
 * Script ini akan membuat database dan mengisi data dummy
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  console.log('🏥 SIMRS Kanban - Database Setup');
  console.log('================================\n');

  // Koneksi ke MySQL
  let conn;
  try {
    const config = process.env.MYSQL_URL || {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      multipleStatements: true
    };
    
    // Jika menggunakan URL, tambahkan multipleStatements
    if (typeof config === 'string') {
      conn = await mysql.createConnection(config + (config.includes('?') ? '&' : '?') + 'multipleStatements=true');
    } else {
      conn = await mysql.createConnection(config);
    }
    
    console.log('✅ Terhubung ke MySQL server');
  } catch (err) {
    console.error('❌ Tidak bisa terhubung ke MySQL:', err.message);
    console.error('\n📋 Pastikan:');
    console.error('   1. MySQL/MariaDB sudah terinstall dan berjalan');
    console.error('   2. Konfigurasi di .env sudah benar');
    console.error('   3. User dan password MySQL benar');
    process.exit(1);
  }

  try {
    // 1. Jalankan schema.sql
    console.log('\n📦 Membuat database dan tabel...');
    const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'simrs_kanban';
    
    try {
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    } catch (err) {
      console.log('⚠️ Melewati pembuatan DB (Biasanya di Cloud/Railway ini sudah otomatis).');
    }
    
    await conn.query(`USE \`${dbName}\`;`);
    
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    try {
      await conn.query(schema);
      console.log('✅ Schema berhasil dijalankan');
    } catch (schemaErr) {
      if (schemaErr.code === 'ER_DUP_KEYNAME' || schemaErr.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️ Schema sudah ada, melanjutkan ke seeding...');
      } else {
        throw schemaErr;
      }
    }

    // 2. Generate password hash yang benar untuk semua user
    console.log('\n🔐 Generating password hashes...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('✅ Password hash generated');

    // 3. Jalankan seed.sql
    console.log('\n🌱 Mengisi data dummy...');
    let seed = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf8');
    // Replace placeholder hash dengan hash yang baru di-generate
    seed = seed.replace(/\$2a\$10\$X7UrE3GnM3qMED\/V5Ke\.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam/g, passwordHash);
    await conn.query(seed);
    console.log('✅ Data dummy berhasil dimasukkan');

    console.log('\n================================');
    console.log('\n📋 Akun Demo:');
    console.log('   Admin      : admin / admin123');
    console.log('   Dokter     : dr.andi / admin123');
    console.log('   Dokter     : dr.sari / admin123');
    console.log('   Dokter     : dr.budi / admin123');
    console.log('   Apoteker   : apt.rina / admin123');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error saat setup:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  Data dummy sudah ada. Setup selesai!');
      process.exit(0);
    }
    process.exit(1);
  } finally {
    await conn.end();
  }
}

setupDatabase();
