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

  // Koneksi tanpa database untuk membuat database
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
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
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('✅ Schema berhasil dijalankan');

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
    console.log('🎉 Setup selesai! Database siap digunakan.');
    console.log('\n📋 Akun Demo:');
    console.log('   Admin      : admin / admin123');
    console.log('   Dokter     : dr.andi / admin123');
    console.log('   Dokter     : dr.sari / admin123');
    console.log('   Dokter     : dr.budi / admin123');
    console.log('   Farmasi    : apt.rina / admin123');
    console.log('   Kasir      : kasir01 / admin123');
    console.log('   Pendaftaran: daftar01 / admin123');
    console.log('   Perawat    : perawat01 / admin123');
    console.log('\n🚀 Jalankan server: npm start');

  } catch (err) {
    console.error('❌ Error saat setup:', err.message);
    if (err.message.includes('Duplicate')) {
      console.log('\n⚠️  Data sudah ada. Jika ingin reset, hapus database dulu:');
      console.log('   mysql -u root -e "DROP DATABASE simrs_kanban;"');
      console.log('   Lalu jalankan ulang: npm run setup-db');
    }
  } finally {
    await conn.end();
  }
}

setupDatabase();
