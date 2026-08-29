-- =====================================================
-- SIMRS Kanban - Database Schema
-- Terinspirasi dari struktur SIMRS Khanza
-- Kompatibel MySQL 5.7+ / MariaDB 10.3+
-- =====================================================

-- Database disetup dari environment (bisa simrs_kanban atau railway db)

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role ENUM('admin','dokter','perawat','farmasi','kasir','pendaftaran') NOT NULL DEFAULT 'pendaftaran',
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 2. MASTER DATA - SPESIALISASI DOKTER
-- =====================================================
CREATE TABLE IF NOT EXISTS spesialis (
  kd_sps VARCHAR(5) PRIMARY KEY,
  nm_sps VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- =====================================================
-- 3. MASTER DATA - POLIKLINIK
-- =====================================================
CREATE TABLE IF NOT EXISTS poliklinik (
  kd_poli VARCHAR(5) PRIMARY KEY,
  nm_poli VARCHAR(50) NOT NULL,
  registrasi DECIMAL(12,2) NOT NULL DEFAULT 0,
  registrasilama DECIMAL(12,2) NOT NULL DEFAULT 0,
  aktif TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================
-- 4. MASTER DATA - DOKTER
-- =====================================================
CREATE TABLE IF NOT EXISTS dokter (
  kd_dokter VARCHAR(20) PRIMARY KEY,
  nm_dokter VARCHAR(100) NOT NULL,
  jk ENUM('L','P') NOT NULL DEFAULT 'L',
  tmp_lahir VARCHAR(50),
  tgl_lahir DATE,
  agama VARCHAR(12),
  almt_tgl VARCHAR(200),
  no_tlp VARCHAR(20),
  kd_sps VARCHAR(5),
  alumni VARCHAR(100),
  no_ijn_praktek VARCHAR(50),
  status ENUM('1','0') NOT NULL DEFAULT '1',
  user_id INT,
  FOREIGN KEY (kd_sps) REFERENCES spesialis(kd_sps),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- =====================================================
-- 5. MASTER DATA - PENANGGUNG JAWAB / PENJAMIN
-- =====================================================
CREATE TABLE IF NOT EXISTS penjab (
  kd_pj VARCHAR(3) PRIMARY KEY,
  png_jawab VARCHAR(50) NOT NULL,
  aktif TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================
-- 6. MASTER DATA - PASIEN
-- =====================================================
CREATE TABLE IF NOT EXISTS pasien (
  no_rkm_medis VARCHAR(15) PRIMARY KEY,
  nm_pasien VARCHAR(100) NOT NULL,
  no_ktp VARCHAR(20),
  jk ENUM('L','P') NOT NULL,
  tmp_lahir VARCHAR(50),
  tgl_lahir DATE NOT NULL,
  nm_ibu VARCHAR(100),
  alamat VARCHAR(200),
  gol_darah ENUM('A','B','O','AB','-') DEFAULT '-',
  no_tlp VARCHAR(20),
  pekerjaan VARCHAR(60),
  stts_nikah ENUM('BELUM MENIKAH','MENIKAH','JANDA','DUDA') DEFAULT 'BELUM MENIKAH',
  agama VARCHAR(12),
  tgl_daftar DATE NOT NULL,
  no_peserta VARCHAR(25) COMMENT 'No peserta BPJS',
  kd_pj VARCHAR(3) DEFAULT 'U',
  FOREIGN KEY (kd_pj) REFERENCES penjab(kd_pj)
) ENGINE=InnoDB;

-- =====================================================
-- 7. REGISTRASI KUNJUNGAN
-- =====================================================
CREATE TABLE IF NOT EXISTS registrasi (
  no_rawat VARCHAR(17) PRIMARY KEY,
  no_rkm_medis VARCHAR(15) NOT NULL,
  tgl_registrasi DATE NOT NULL,
  jam_registrasi TIME NOT NULL,
  kd_dokter VARCHAR(20) NOT NULL,
  no_reg VARCHAR(10),
  kd_poli VARCHAR(5) NOT NULL,
  stts ENUM('Belum','Sudah','Batal') NOT NULL DEFAULT 'Belum',
  status_lanjut ENUM('Ralan','Ranap') NOT NULL DEFAULT 'Ralan',
  kd_pj VARCHAR(3) NOT NULL DEFAULT 'U',
  status_bayar ENUM('Belum','Sudah','Piutang') NOT NULL DEFAULT 'Belum',
  status_poli ENUM('Belum','Sudah','Batal') NOT NULL DEFAULT 'Belum',
  FOREIGN KEY (no_rkm_medis) REFERENCES pasien(no_rkm_medis),
  FOREIGN KEY (kd_dokter) REFERENCES dokter(kd_dokter),
  FOREIGN KEY (kd_poli) REFERENCES poliklinik(kd_poli),
  FOREIGN KEY (kd_pj) REFERENCES penjab(kd_pj)
) ENGINE=InnoDB;

-- =====================================================
-- 8. PENYAKIT / DIAGNOSA (ICD-10)
-- =====================================================
CREATE TABLE IF NOT EXISTS penyakit (
  kd_penyakit VARCHAR(10) PRIMARY KEY,
  nm_penyakit VARCHAR(200) NOT NULL,
  ciri_ciri TEXT,
  keterangan TEXT
) ENGINE=InnoDB;

-- =====================================================
-- 9. DIAGNOSA PASIEN
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnosa_pasien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_rawat VARCHAR(17) NOT NULL,
  kd_penyakit VARCHAR(10) NOT NULL,
  status ENUM('Ralan','Ranap') NOT NULL DEFAULT 'Ralan',
  prioritas TINYINT NOT NULL DEFAULT 1,
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat),
  FOREIGN KEY (kd_penyakit) REFERENCES penyakit(kd_penyakit)
) ENGINE=InnoDB;

-- =====================================================
-- 10. RAWAT JALAN - PEMERIKSAAN DOKTER (SOAP)
-- =====================================================
CREATE TABLE IF NOT EXISTS pemeriksaan_ralan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_rawat VARCHAR(17) NOT NULL,
  tgl_perawatan DATE NOT NULL,
  jam_rawat TIME NOT NULL,
  suhu_tubuh VARCHAR(5),
  tensi VARCHAR(10),
  nadi VARCHAR(5),
  respirasi VARCHAR(5),
  tinggi VARCHAR(5),
  berat VARCHAR(5),
  spo2 VARCHAR(5),
  gcs VARCHAR(10),
  kesadaran ENUM('Compos Mentis','Somnolence','Sopor','Coma') DEFAULT 'Compos Mentis',
  subjek TEXT COMMENT 'Subjective - Keluhan pasien',
  objek TEXT COMMENT 'Objective - Hasil pemeriksaan',
  asesmen TEXT COMMENT 'Assessment - Penilaian dokter',
  plan TEXT COMMENT 'Plan - Rencana tindakan',
  instruksi TEXT,
  evaluasi TEXT,
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat)
) ENGINE=InnoDB;

-- =====================================================
-- 11. JENIS PERAWATAN / TINDAKAN & TARIF
-- =====================================================
CREATE TABLE IF NOT EXISTS jns_perawatan (
  kd_jenis_prw VARCHAR(15) PRIMARY KEY,
  nm_perawatan VARCHAR(100) NOT NULL,
  total_byrdr DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Tarif jasa dokter',
  total_byrpr DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Tarif jasa perawat',
  material DECIMAL(12,2) NOT NULL DEFAULT 0,
  bhp DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Bahan habis pakai',
  tarif_tindakandr DECIMAL(12,2) NOT NULL DEFAULT 0,
  kso DECIMAL(12,2) NOT NULL DEFAULT 0,
  mepigas DECIMAL(12,2) NOT NULL DEFAULT 0,
  biaya_rawat DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Total biaya',
  status ENUM('Ralan','Ranap') NOT NULL DEFAULT 'Ralan'
) ENGINE=InnoDB;

-- =====================================================
-- 12. RAWAT JALAN - TINDAKAN DOKTER
-- =====================================================
CREATE TABLE IF NOT EXISTS rawat_jl_dr (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_rawat VARCHAR(17) NOT NULL,
  kd_jenis_prw VARCHAR(15) NOT NULL,
  kd_dokter VARCHAR(20) NOT NULL,
  tgl_perawatan DATE NOT NULL,
  jam_rawat TIME NOT NULL,
  biaya_rawat DECIMAL(12,2) NOT NULL DEFAULT 0,
  stts_bayar ENUM('Belum','Sudah') NOT NULL DEFAULT 'Belum',
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat),
  FOREIGN KEY (kd_jenis_prw) REFERENCES jns_perawatan(kd_jenis_prw),
  FOREIGN KEY (kd_dokter) REFERENCES dokter(kd_dokter)
) ENGINE=InnoDB;

-- =====================================================
-- 13. MASTER DATA - OBAT & BHP (FARMASI)
-- =====================================================
CREATE TABLE IF NOT EXISTS databarang (
  kd_obat VARCHAR(15) PRIMARY KEY,
  nm_obat VARCHAR(100) NOT NULL,
  satuan VARCHAR(30) NOT NULL DEFAULT 'Tablet',
  harga_beli DECIMAL(12,2) NOT NULL DEFAULT 0,
  harga_ralan DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Harga jual rawat jalan',
  stok INT NOT NULL DEFAULT 0,
  stok_minimum INT NOT NULL DEFAULT 10,
  kategori ENUM('Obat','BHP','Alkes') NOT NULL DEFAULT 'Obat',
  aktif TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================
-- 14. RESEP OBAT (HEADER)
-- =====================================================
CREATE TABLE IF NOT EXISTS resep_obat (
  no_resep VARCHAR(20) PRIMARY KEY,
  tgl_peresepan DATE NOT NULL,
  jam TIME NOT NULL,
  no_rawat VARCHAR(17) NOT NULL,
  kd_dokter VARCHAR(20) NOT NULL,
  status ENUM('antre','diracik','selesai') NOT NULL DEFAULT 'antre',
  tgl_penyerahan DATE,
  jam_penyerahan TIME,
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat),
  FOREIGN KEY (kd_dokter) REFERENCES dokter(kd_dokter)
) ENGINE=InnoDB;

-- =====================================================
-- 15. DETAIL RESEP OBAT
-- =====================================================
CREATE TABLE IF NOT EXISTS detail_resep (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_resep VARCHAR(20) NOT NULL,
  kd_obat VARCHAR(15) NOT NULL,
  jml INT NOT NULL DEFAULT 1,
  aturan_pakai VARCHAR(100) COMMENT 'Misal: 3x1 sesudah makan',
  FOREIGN KEY (no_resep) REFERENCES resep_obat(no_resep),
  FOREIGN KEY (kd_obat) REFERENCES databarang(kd_obat)
) ENGINE=InnoDB;

-- =====================================================
-- 16. BILLING / TAGIHAN
-- =====================================================
CREATE TABLE IF NOT EXISTS billing (
  no_nota VARCHAR(20) PRIMARY KEY,
  no_rawat VARCHAR(17) NOT NULL,
  tgl_byr DATE NOT NULL,
  jam_byr TIME NOT NULL,
  nm_perawatan VARCHAR(200) NOT NULL,
  kategori ENUM('Registrasi','Tindakan Dokter','Obat','BHP','Laboratorium','Radiologi','Lain-lain') NOT NULL,
  biaya DECIMAL(12,2) NOT NULL DEFAULT 0,
  jumlah INT NOT NULL DEFAULT 1,
  total_biaya DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('Belum','Sudah') NOT NULL DEFAULT 'Belum',
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat)
) ENGINE=InnoDB;

-- =====================================================
-- 17. BANGSAL (WARD)
-- =====================================================
CREATE TABLE IF NOT EXISTS bangsal (
  kd_bangsal VARCHAR(5) PRIMARY KEY,
  nm_bangsal VARCHAR(50) NOT NULL,
  status TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- =====================================================
-- 18. KAMAR
-- =====================================================
CREATE TABLE IF NOT EXISTS kamar (
  kd_kamar VARCHAR(15) PRIMARY KEY,
  kd_bangsal VARCHAR(5) NOT NULL,
  kelas ENUM('VIP','Kelas 1','Kelas 2','Kelas 3') NOT NULL DEFAULT 'Kelas 3',
  trf_kamar DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'Tarif per hari',
  status ENUM('KOSONG','ISI','PERBAIKAN') NOT NULL DEFAULT 'KOSONG',
  FOREIGN KEY (kd_bangsal) REFERENCES bangsal(kd_bangsal)
) ENGINE=InnoDB;

-- =====================================================
-- 19. KAMAR INAP (UNTUK DASHBOARD STATISTIK)
-- =====================================================
CREATE TABLE IF NOT EXISTS kamar_inap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_rawat VARCHAR(17) NOT NULL,
  kd_kamar VARCHAR(15) NOT NULL,
  tgl_masuk DATE NOT NULL,
  jam_masuk TIME NOT NULL,
  tgl_keluar DATE,
  jam_keluar TIME,
  stts_pulang ENUM('Sembuh','Rujuk','APS','Meninggal','-') DEFAULT '-',
  FOREIGN KEY (no_rawat) REFERENCES registrasi(no_rawat),
  FOREIGN KEY (kd_kamar) REFERENCES kamar(kd_kamar)
) ENGINE=InnoDB;

-- =====================================================
-- INDEXES untuk performa query
-- =====================================================
CREATE INDEX idx_registrasi_tgl ON registrasi(tgl_registrasi);
CREATE INDEX idx_registrasi_pasien ON registrasi(no_rkm_medis);
CREATE INDEX idx_registrasi_dokter ON registrasi(kd_dokter);
CREATE INDEX idx_registrasi_poli ON registrasi(kd_poli);
CREATE INDEX idx_resep_status ON resep_obat(status);
CREATE INDEX idx_resep_tgl ON resep_obat(tgl_peresepan);
CREATE INDEX idx_billing_rawat ON billing(no_rawat);
CREATE INDEX idx_pasien_nama ON pasien(nm_pasien);
CREATE INDEX idx_pasien_ktp ON pasien(no_ktp);
