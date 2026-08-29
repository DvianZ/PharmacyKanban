/**
 * =====================================================
 * SIMRS Kanban - Server Utama
 * Sistem Informasi Manajemen Rumah Sakit Modern
 * =====================================================
 */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'simrs-kanban-secret';

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

// Role check middleware
function roleCheck(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    next();
  };
}

// =====================================================
// AUTH ROUTES
// =====================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND aktif = 1', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Username atau password salah' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Username atau password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, nama: user.nama, role: user.role },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, nama: user.nama, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// =====================================================
// DASHBOARD ROUTES
// =====================================================
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [[{totalPasienHariIni}]] = await pool.query(
      'SELECT COUNT(*) as totalPasienHariIni FROM registrasi WHERE tgl_registrasi = ?', [today]
    );
    const [[{totalPasien}]] = await pool.query('SELECT COUNT(*) as totalPasien FROM pasien');
    const [[{resepAntre}]] = await pool.query(
      "SELECT COUNT(*) as resepAntre FROM resep_obat WHERE status = 'antre' AND tgl_peresepan = ?", [today]
    );
    const [[{resepDiracik}]] = await pool.query(
      "SELECT COUNT(*) as resepDiracik FROM resep_obat WHERE status = 'diracik' AND tgl_peresepan = ?", [today]
    );
    const [[{kamarTerisi}]] = await pool.query(
      "SELECT COUNT(*) as kamarTerisi FROM kamar WHERE status = 'ISI'"
    );
    const [[{totalKamar}]] = await pool.query('SELECT COUNT(*) as totalKamar FROM kamar');
    const [[{pendapatanHariIni}]] = await pool.query(
      "SELECT COALESCE(SUM(total_biaya), 0) as pendapatanHariIni FROM billing WHERE tgl_byr = ? AND status = 'Sudah'", [today]
    );

    // Tren kunjungan 7 hari terakhir
    const [tren] = await pool.query(`
      SELECT DATE_FORMAT(tgl_registrasi, '%Y-%m-%d') as tanggal, COUNT(*) as jumlah
      FROM registrasi
      WHERE tgl_registrasi >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY tgl_registrasi
      ORDER BY tgl_registrasi
    `);

    // Distribusi per poli hari ini
    const [perPoli] = await pool.query(`
      SELECT p.nm_poli, COUNT(*) as jumlah
      FROM registrasi r
      JOIN poliklinik p ON r.kd_poli = p.kd_poli
      WHERE r.tgl_registrasi = ?
      GROUP BY r.kd_poli, p.nm_poli
    `, [today]);

    res.json({
      totalPasienHariIni,
      totalPasien,
      resepAntre,
      resepDiracik,
      kamarTerisi,
      totalKamar,
      pendapatanHariIni,
      tren,
      perPoli
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// PASIEN ROUTES
// =====================================================
app.get('/api/pasien', authMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT p.*, pj.png_jawab FROM pasien p LEFT JOIN penjab pj ON p.kd_pj = pj.kd_pj';
    let countQuery = 'SELECT COUNT(*) as total FROM pasien';
    const params = [];

    if (search) {
      const searchClause = ' WHERE p.nm_pasien LIKE ? OR p.no_rkm_medis LIKE ? OR p.no_ktp LIKE ?';
      query += searchClause;
      countQuery += searchClause.replace(/p\./g, '');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(countQuery, params);
    query += ' ORDER BY p.tgl_daftar DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [...params, parseInt(limit), parseInt(offset)]);

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get pasien error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/pasien/:no_rkm_medis', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, pj.png_jawab FROM pasien p LEFT JOIN penjab pj ON p.kd_pj = pj.kd_pj WHERE p.no_rkm_medis = ?',
      [req.params.no_rkm_medis]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pasien tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/pasien', authMiddleware, async (req, res) => {
  try {
    // Auto-generate no_rkm_medis
    const [[{ maxRM }]] = await pool.query("SELECT MAX(no_rkm_medis) as maxRM FROM pasien");
    let nextNum = 1;
    if (maxRM) {
      nextNum = parseInt(maxRM.replace('RM', '')) + 1;
    }
    const no_rkm_medis = 'RM' + String(nextNum).padStart(6, '0');

    const { nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah, no_tlp, pekerjaan, stts_nikah, agama, no_peserta, kd_pj } = req.body;

    await pool.query(
      `INSERT INTO pasien (no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah, no_tlp, pekerjaan, stts_nikah, agama, tgl_daftar, no_peserta, kd_pj)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah || '-', no_tlp, pekerjaan, stts_nikah, agama, no_peserta, kd_pj || 'U']
    );

    res.status(201).json({ no_rkm_medis, message: 'Pasien berhasil didaftarkan' });
  } catch (err) {
    console.error('Create pasien error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// MASTER DATA ROUTES
// =====================================================
app.get('/api/poliklinik', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM poliklinik WHERE aktif = 1 ORDER BY nm_poli');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/dokter', authMiddleware, async (req, res) => {
  try {
    const { kd_poli } = req.query;
    let query = `SELECT d.*, s.nm_sps FROM dokter d LEFT JOIN spesialis s ON d.kd_sps = s.kd_sps WHERE d.status = '1'`;
    const params = [];
    // Filter dokter berdasarkan poli (mapping sederhana berdasarkan spesialisasi)
    if (kd_poli) {
      // Untuk demo, kita return semua dokter; di production bisa di-filter dari tabel jadwal
    }
    query += ' ORDER BY d.nm_dokter';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/penjab', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM penjab WHERE aktif = 1');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/penyakit', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM penyakit';
    const params = [];
    if (search) {
      query += ' WHERE kd_penyakit LIKE ? OR nm_penyakit LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY kd_penyakit LIMIT 50';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/tindakan', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jns_perawatan WHERE status = 'Ralan' ORDER BY nm_perawatan");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// REGISTRASI ROUTES
// =====================================================
app.get('/api/registrasi', authMiddleware, async (req, res) => {
  try {
    const { tanggal, status } = req.query;
    const tgl = tanggal || new Date().toISOString().split('T')[0];
    let query = `
      SELECT r.*, p.nm_pasien, p.jk, p.tgl_lahir, p.alamat, p.no_tlp,
             d.nm_dokter, pl.nm_poli, pj.png_jawab
      FROM registrasi r
      JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
      JOIN dokter d ON r.kd_dokter = d.kd_dokter
      JOIN poliklinik pl ON r.kd_poli = pl.kd_poli
      JOIN penjab pj ON r.kd_pj = pj.kd_pj
      WHERE r.tgl_registrasi = ?
    `;
    const params = [tgl];

    if (status) {
      query += ' AND r.status_poli = ?';
      params.push(status);
    }
    query += ' ORDER BY r.jam_registrasi';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get registrasi error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/registrasi', authMiddleware, async (req, res) => {
  try {
    const { no_rkm_medis, kd_dokter, kd_poli, kd_pj } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Generate no_rawat: YYYY/MM/DD/XXX
    const dateStr = today.replace(/-/g, '/');
    const [[{ maxReg }]] = await pool.query(
      "SELECT MAX(CAST(SUBSTRING_INDEX(no_rawat, '/', -1) AS UNSIGNED)) as maxReg FROM registrasi WHERE tgl_registrasi = ?",
      [today]
    );
    const nextReg = String((maxReg || 0) + 1).padStart(3, '0');
    const no_rawat = `${dateStr}/${nextReg}`;

    // Generate no_reg per poli per dokter
    const [[{ maxNoReg }]] = await pool.query(
      "SELECT MAX(CAST(no_reg AS UNSIGNED)) as maxNoReg FROM registrasi WHERE tgl_registrasi = ? AND kd_poli = ?",
      [today, kd_poli]
    );
    const no_reg = String((maxNoReg || 0) + 1).padStart(3, '0');

    await pool.query(
      `INSERT INTO registrasi (no_rawat, no_rkm_medis, tgl_registrasi, jam_registrasi, kd_dokter, no_reg, kd_poli, stts, status_lanjut, kd_pj, status_bayar, status_poli)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Belum', 'Ralan', ?, 'Belum', 'Belum')`,
      [no_rawat, no_rkm_medis, today, now, kd_dokter, no_reg, kd_poli, kd_pj || 'U']
    );

    res.status(201).json({ no_rawat, no_reg, message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('Create registrasi error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// RAWAT JALAN ROUTES
// =====================================================
app.get('/api/rawat-jalan', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { kd_dokter } = req.query;
    let query = `
      SELECT r.*, p.nm_pasien, p.jk, p.tgl_lahir, p.no_tlp, p.alamat,
             d.nm_dokter, pl.nm_poli, pj.png_jawab,
             pr.subjek, pr.objek, pr.asesmen, pr.plan, pr.tensi, pr.suhu_tubuh, pr.nadi
      FROM registrasi r
      JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
      JOIN dokter d ON r.kd_dokter = d.kd_dokter
      JOIN poliklinik pl ON r.kd_poli = pl.kd_poli
      JOIN penjab pj ON r.kd_pj = pj.kd_pj
      LEFT JOIN pemeriksaan_ralan pr ON r.no_rawat = pr.no_rawat
      WHERE r.tgl_registrasi = ? AND r.status_lanjut = 'Ralan'
    `;
    const params = [today];

    if (kd_dokter) {
      query += ' AND r.kd_dokter = ?';
      params.push(kd_dokter);
    }
    query += ' ORDER BY r.jam_registrasi';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get rawat jalan error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simpan SOAP pemeriksaan
app.post('/api/rawat-jalan/soap', authMiddleware, async (req, res) => {
  try {
    const { no_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, kesadaran, subjek, objek, asesmen, plan } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check if already exists
    const [existing] = await pool.query('SELECT id FROM pemeriksaan_ralan WHERE no_rawat = ?', [no_rawat]);
    if (existing.length > 0) {
      await pool.query(
        `UPDATE pemeriksaan_ralan SET suhu_tubuh=?, tensi=?, nadi=?, respirasi=?, tinggi=?, berat=?, spo2=?, kesadaran=?, subjek=?, objek=?, asesmen=?, plan=? WHERE no_rawat=?`,
        [suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, kesadaran, subjek, objek, asesmen, plan, no_rawat]
      );
    } else {
      await pool.query(
        `INSERT INTO pemeriksaan_ralan (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, kesadaran, subjek, objek, asesmen, plan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [no_rawat, today, now, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, kesadaran, subjek, objek, asesmen, plan]
      );
    }

    // Update status poli
    await pool.query("UPDATE registrasi SET status_poli = 'Sudah', stts = 'Sudah' WHERE no_rawat = ?", [no_rawat]);

    res.json({ message: 'SOAP berhasil disimpan' });
  } catch (err) {
    console.error('Save SOAP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simpan diagnosa
app.post('/api/rawat-jalan/diagnosa', authMiddleware, async (req, res) => {
  try {
    const { no_rawat, diagnosa } = req.body; // diagnosa = [{kd_penyakit, prioritas}]
    // Hapus diagnosa lama
    await pool.query('DELETE FROM diagnosa_pasien WHERE no_rawat = ?', [no_rawat]);
    // Insert diagnosa baru
    for (const d of diagnosa) {
      await pool.query(
        "INSERT INTO diagnosa_pasien (no_rawat, kd_penyakit, status, prioritas) VALUES (?, ?, 'Ralan', ?)",
        [no_rawat, d.kd_penyakit, d.prioritas || 1]
      );
    }
    res.json({ message: 'Diagnosa berhasil disimpan' });
  } catch (err) {
    console.error('Save diagnosa error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Buat resep dari rawat jalan
app.post('/api/rawat-jalan/resep', authMiddleware, async (req, res) => {
  try {
    const { no_rawat, kd_dokter, items } = req.body; // items = [{kd_obat, jml, aturan_pakai}]
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Generate no_resep
    const dateStr = today.replace(/-/g, '');
    const [[{ maxResep }]] = await pool.query(
      "SELECT COUNT(*) as maxResep FROM resep_obat WHERE tgl_peresepan = ?", [today]
    );
    const no_resep = `RSP-${dateStr}-${String((maxResep || 0) + 1).padStart(3, '0')}`;

    await pool.query(
      "INSERT INTO resep_obat (no_resep, tgl_peresepan, jam, no_rawat, kd_dokter, status) VALUES (?, ?, ?, ?, ?, 'antre')",
      [no_resep, today, now, no_rawat, kd_dokter]
    );

    for (const item of items) {
      await pool.query(
        'INSERT INTO detail_resep (no_resep, kd_obat, jml, aturan_pakai) VALUES (?, ?, ?, ?)',
        [no_resep, item.kd_obat, item.jml, item.aturan_pakai]
      );
    }

    res.status(201).json({ no_resep, message: 'Resep berhasil dibuat' });
  } catch (err) {
    console.error('Create resep error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// FARMASI ROUTES
// =====================================================
app.get('/api/farmasi/antrian', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(`
      SELECT ro.*, r.no_rkm_medis, p.nm_pasien, d.nm_dokter,
             pl.nm_poli
      FROM resep_obat ro
      JOIN registrasi r ON ro.no_rawat = r.no_rawat
      JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
      JOIN dokter d ON ro.kd_dokter = d.kd_dokter
      JOIN poliklinik pl ON r.kd_poli = pl.kd_poli
      WHERE ro.tgl_peresepan = ?
      ORDER BY ro.jam
    `, [today]);

    // Ambil detail obat per resep
    for (let resep of rows) {
      const [details] = await pool.query(`
        SELECT dr.*, db.nm_obat, db.satuan, db.harga_ralan, db.stok
        FROM detail_resep dr
        JOIN databarang db ON dr.kd_obat = db.kd_obat
        WHERE dr.no_resep = ?
      `, [resep.no_resep]);
      resep.items = details;
    }

    res.json(rows);
  } catch (err) {
    console.error('Get farmasi antrian error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/farmasi/status', authMiddleware, async (req, res) => {
  try {
    const { no_resep, status } = req.body;
    const updateData = { status };
    let query = 'UPDATE resep_obat SET status = ?';
    const params = [status];

    if (status === 'selesai') {
      const now = new Date();
      query += ', tgl_penyerahan = ?, jam_penyerahan = ?';
      params.push(now.toISOString().split('T')[0], now.toTimeString().split(' ')[0]);

      // Kurangi stok obat
      const [details] = await pool.query('SELECT kd_obat, jml FROM detail_resep WHERE no_resep = ?', [no_resep]);
      for (const d of details) {
        await pool.query('UPDATE databarang SET stok = stok - ? WHERE kd_obat = ? AND stok >= ?', [d.jml, d.kd_obat, d.jml]);
      }
    }

    query += ' WHERE no_resep = ?';
    params.push(no_resep);
    await pool.query(query, params);

    res.json({ message: 'Status resep berhasil diperbarui' });
  } catch (err) {
    console.error('Update farmasi status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/farmasi/stok', authMiddleware, async (req, res) => {
  try {
    const { search, kategori, low_stock } = req.query;
    let query = 'SELECT * FROM databarang WHERE aktif = 1';
    const params = [];

    if (search) {
      query += ' AND (nm_obat LIKE ? OR kd_obat LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (kategori) {
      query += ' AND kategori = ?';
      params.push(kategori);
    }
    if (low_stock === 'true') {
      query += ' AND stok <= stok_minimum';
    }

    query += ' ORDER BY nm_obat';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// BILLING ROUTES
// =====================================================
app.get('/api/billing', authMiddleware, async (req, res) => {
  try {
    const { tanggal, status } = req.query;
    const tgl = tanggal || new Date().toISOString().split('T')[0];
    let query = `
      SELECT b.*, p.nm_pasien, r.no_rkm_medis, pj.png_jawab
      FROM billing b
      JOIN registrasi r ON b.no_rawat = r.no_rawat
      JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
      JOIN penjab pj ON r.kd_pj = pj.kd_pj
      WHERE b.tgl_byr = ?
    `;
    const params = [tgl];
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    query += ' ORDER BY b.jam_byr DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/billing/pasien/:no_rawat', authMiddleware, async (req, res) => {
  try {
    const { no_rawat } = req.params;
    // Get registration info
    const [regRows] = await pool.query(`
      SELECT r.*, p.nm_pasien, p.no_rkm_medis, d.nm_dokter, pl.nm_poli, pj.png_jawab,
             pl.registrasi as biaya_registrasi
      FROM registrasi r
      JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
      JOIN dokter d ON r.kd_dokter = d.kd_dokter
      JOIN poliklinik pl ON r.kd_poli = pl.kd_poli
      JOIN penjab pj ON r.kd_pj = pj.kd_pj
      WHERE r.no_rawat = ?
    `, [no_rawat]);

    if (regRows.length === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });

    // Get tindakan
    const [tindakan] = await pool.query(`
      SELECT rj.*, jp.nm_perawatan
      FROM rawat_jl_dr rj
      JOIN jns_perawatan jp ON rj.kd_jenis_prw = jp.kd_jenis_prw
      WHERE rj.no_rawat = ?
    `, [no_rawat]);

    // Get resep obat
    const [resep] = await pool.query(`
      SELECT dr.*, db.nm_obat, db.satuan, db.harga_ralan, (dr.jml * db.harga_ralan) as subtotal
      FROM resep_obat ro
      JOIN detail_resep dr ON ro.no_resep = dr.no_resep
      JOIN databarang db ON dr.kd_obat = db.kd_obat
      WHERE ro.no_rawat = ?
    `, [no_rawat]);

    // Get existing billing
    const [bills] = await pool.query('SELECT * FROM billing WHERE no_rawat = ?', [no_rawat]);

    res.json({
      registrasi: regRows[0],
      tindakan,
      resep,
      billing: bills
    });
  } catch (err) {
    console.error('Get billing pasien error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/billing/bayar', authMiddleware, async (req, res) => {
  try {
    const { no_rawat, items } = req.body; // items = [{nm_perawatan, kategori, biaya, jumlah, total_biaya}]
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Generate nota
    const [[{ maxNota }]] = await pool.query("SELECT COUNT(*) as maxNota FROM billing WHERE tgl_byr = ?", [today]);

    for (let i = 0; i < items.length; i++) {
      const notaNum = (maxNota || 0) + i + 1;
      const no_nota = `NTA-${today.replace(/-/g, '')}-${String(notaNum).padStart(3, '0')}`;
      const item = items[i];
      await pool.query(
        `INSERT INTO billing (no_nota, no_rawat, tgl_byr, jam_byr, nm_perawatan, kategori, biaya, jumlah, total_biaya, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sudah')`,
        [no_nota, no_rawat, today, now, item.nm_perawatan, item.kategori, item.biaya, item.jumlah || 1, item.total_biaya]
      );
    }

    // Update status bayar registrasi
    await pool.query("UPDATE registrasi SET status_bayar = 'Sudah' WHERE no_rawat = ?", [no_rawat]);

    res.json({ message: 'Pembayaran berhasil dicatat' });
  } catch (err) {
    console.error('Billing bayar error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// OBAT / INVENTORY ROUTES
// =====================================================
app.get('/api/obat', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM databarang WHERE aktif = 1 AND kategori = 'Obat'";
    const params = [];
    if (search) {
      query += ' AND (nm_obat LIKE ? OR kd_obat LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY nm_obat LIMIT 50';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================================================
// SPA FALLBACK - serve index.html for all non-API routes
// =====================================================
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// =====================================================
// START SERVER
// =====================================================
async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('\n⚠️  Server tetap berjalan tanpa database.');
    console.warn('   Jalankan: npm run setup-db untuk setup MySQL\n');
  }

  app.listen(PORT, () => {
    console.log(`\n🏥 SIMRS Kanban berjalan di http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log('   Mode: Development\n');
  });
}

startServer();