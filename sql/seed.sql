-- =====================================================
-- SIMRS Kanban - Seed Data (Data Dummy)
-- Data realistis untuk demo dan pengembangan
-- =====================================================

USE simrs_kanban;

-- =====================================================
-- USERS (password: 'admin123' untuk semua user demo)
-- Hash bcryptjs dari 'admin123'
-- =====================================================
INSERT INTO users (username, password_hash, nama, role) VALUES
('admin', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'Administrator Sistem', 'admin'),
('dr.andi', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'dr. Andi Wijaya, Sp.PD', 'dokter'),
('dr.sari', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'dr. Sari Dewi, Sp.A', 'dokter'),
('dr.budi', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'dr. Budi Santoso', 'dokter'),
('apt.rina', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'Apt. Rina Marlina, S.Farm', 'farmasi'),
('kasir01', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'Dian Permata', 'kasir'),
('daftar01', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'Hendra Gunawan', 'pendaftaran'),
('perawat01', '$2a$10$X7UrE3GnM3qMED/V5Ke.3eH7TJcI2Xkv5KVHsNQFOaXD5UQH5GEam', 'Ns. Fitri Handayani, S.Kep', 'perawat');

-- =====================================================
-- SPESIALISASI
-- =====================================================
INSERT INTO spesialis (kd_sps, nm_sps) VALUES
('S001', 'Penyakit Dalam'),
('S002', 'Anak'),
('S003', 'Bedah Umum'),
('S004', 'Kandungan'),
('S005', 'Mata'),
('S006', 'THT'),
('S007', 'Saraf'),
('S008', 'Umum');

-- =====================================================
-- POLIKLINIK
-- =====================================================
INSERT INTO poliklinik (kd_poli, nm_poli, registrasi, registrasilama) VALUES
('P001', 'Poli Umum', 25000, 15000),
('P002', 'Poli Penyakit Dalam', 50000, 35000),
('P003', 'Poli Anak', 50000, 35000),
('P004', 'Poli Bedah', 50000, 35000),
('P005', 'Poli Kandungan', 50000, 35000),
('P006', 'Poli Mata', 50000, 35000),
('P007', 'Poli THT', 50000, 35000),
('P008', 'Poli Saraf', 50000, 35000),
('P009', 'Poli Gigi', 35000, 25000),
('IGD', 'IGD / UGD', 75000, 75000);

-- =====================================================
-- DOKTER
-- =====================================================
INSERT INTO dokter (kd_dokter, nm_dokter, jk, tmp_lahir, tgl_lahir, agama, almt_tgl, no_tlp, kd_sps, alumni, no_ijn_praktek, status, user_id) VALUES
('DK001', 'dr. Andi Wijaya, Sp.PD', 'L', 'Surabaya', '1978-05-12', 'Islam', 'Jl. Mawar No. 15, Solo', '081234567890', 'S001', 'FK UGM 2003', 'SIP/2024/001', '1', 2),
('DK002', 'dr. Sari Dewi, Sp.A', 'P', 'Yogyakarta', '1982-08-20', 'Islam', 'Jl. Melati No. 8, Solo', '081234567891', 'S002', 'FK UI 2007', 'SIP/2024/002', '1', 3),
('DK003', 'dr. Budi Santoso', 'L', 'Solo', '1985-03-15', 'Kristen', 'Jl. Dahlia No. 22, Solo', '081234567892', 'S008', 'FK UNS 2010', 'SIP/2024/003', '1', 4),
('DK004', 'dr. Maya Indah, Sp.OG', 'P', 'Semarang', '1980-11-30', 'Islam', 'Jl. Kenanga No. 5, Solo', '081234567893', 'S004', 'FK UNDIP 2005', 'SIP/2024/004', '1', NULL),
('DK005', 'dr. Reza Fahlevi, Sp.B', 'L', 'Bandung', '1979-07-22', 'Islam', 'Jl. Anggrek No. 11, Solo', '081234567894', 'S003', 'FK UNPAD 2004', 'SIP/2024/005', '1', NULL);

-- =====================================================
-- PENANGGUNG JAWAB / PENJAMIN
-- =====================================================
INSERT INTO penjab (kd_pj, png_jawab) VALUES
('U', 'Umum / Pribadi'),
('BPJ', 'BPJS Kesehatan'),
('INH', 'Mandiri Inhealth'),
('ASR', 'Asuransi Lainnya'),
('JKD', 'Jamkesda');

-- =====================================================
-- PASIEN (20 pasien dummy)
-- =====================================================
INSERT INTO pasien (no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah, no_tlp, pekerjaan, stts_nikah, agama, tgl_daftar, no_peserta, kd_pj) VALUES
('RM000001', 'Ahmad Sudrajat', '3372011205850001', 'L', 'Solo', '1985-05-12', 'Siti Aminah', 'Jl. Slamet Riyadi No. 45, Laweyan, Solo', 'A', '081300000001', 'Wiraswasta', 'MENIKAH', 'Islam', '2024-01-15', '0001234567890', 'BPJ'),
('RM000002', 'Dewi Sartika', '3372014508900002', 'P', 'Sukoharjo', '1990-08-05', 'Mulyani', 'Jl. Ir. Sutami No. 12, Jebres, Solo', 'B', '081300000002', 'Guru', 'MENIKAH', 'Islam', '2024-01-20', '0001234567891', 'BPJ'),
('RM000003', 'Bambang Setiawan', '3372010303780003', 'L', 'Karanganyar', '1978-03-03', 'Sri Mulyani', 'Jl. Monginsidi No. 8, Banjarsari, Solo', 'O', '081300000003', 'PNS', 'MENIKAH', 'Islam', '2024-02-01', NULL, 'U'),
('RM000004', 'Ratna Wulandari', '3372012112950004', 'P', 'Solo', '1995-12-21', 'Endang Rahayu', 'Jl. Ronggowarsito No. 30, Pasar Kliwon, Solo', 'AB', '081300000004', 'Karyawan Swasta', 'BELUM MENIKAH', 'Islam', '2024-02-10', '0001234567893', 'BPJ'),
('RM000005', 'Joko Prasetyo', '3372010706800005', 'L', 'Boyolali', '1980-06-07', 'Tumini', 'Jl. A. Yani No. 55, Serengan, Solo', 'A', '081300000005', 'Pedagang', 'MENIKAH', 'Islam', '2024-02-15', NULL, 'U'),
('RM000006', 'Sri Rahayu', '3372011404880006', 'P', 'Klaten', '1988-04-14', 'Suparmi', 'Jl. Bhayangkara No. 18, Laweyan, Solo', 'B', '081300000006', 'Ibu Rumah Tangga', 'MENIKAH', 'Islam', '2024-03-01', '0001234567895', 'BPJ'),
('RM000007', 'Agus Hartono', '3372012509750007', 'L', 'Sragen', '1975-09-25', 'Sarwini', 'Jl. Urip Sumoharjo No. 7, Jebres, Solo', 'O', '081300000007', 'Pensiunan', 'MENIKAH', 'Kristen', '2024-03-05', '0001234567896', 'BPJ'),
('RM000008', 'Eka Putri Ramadhani', '3372010201000008', 'P', 'Solo', '2000-01-02', 'Yuni Astuti', 'Jl. Hasanudin No. 42, Banjarsari, Solo', 'A', '081300000008', 'Mahasiswa', 'BELUM MENIKAH', 'Islam', '2024-03-10', NULL, 'U'),
('RM000009', 'Hadi Purnomo', '3372011808700009', 'L', 'Wonogiri', '1970-08-18', 'Maryam', 'Jl. Veteran No. 15, Serengan, Solo', 'B', '081300000009', 'Buruh', 'MENIKAH', 'Islam', '2024-03-15', '0001234567898', 'BPJ'),
('RM000010', 'Lilis Suryani', '3372010504920010', 'P', 'Sukoharjo', '1992-04-05', 'Suprapti', 'Jl. Gatot Subroto No. 28, Pasar Kliwon, Solo', 'O', '081300000010', 'Perawat', 'MENIKAH', 'Islam', '2024-04-01', NULL, 'U'),
('RM000011', 'Wahyu Nugroho', '3372011101830011', 'L', 'Solo', '1983-01-11', 'Sumini', 'Jl. Sam Ratulangi No. 9, Laweyan, Solo', 'A', '081300000011', 'TNI', 'MENIKAH', 'Islam', '2024-04-05', NULL, 'U'),
('RM000012', 'Indah Permatasari', '3372012807970012', 'P', 'Karanganyar', '1997-07-28', 'Titik Handayani', 'Jl. Diponegoro No. 35, Jebres, Solo', 'AB', '081300000012', 'Karyawan Swasta', 'BELUM MENIKAH', 'Islam', '2024-04-10', '0001234567901', 'BPJ'),
('RM000013', 'Sugiyanto', '3372010603650013', 'L', 'Klaten', '1965-03-06', 'Pariyem', 'Jl. Gajah Mada No. 20, Banjarsari, Solo', 'O', '081300000013', 'Pensiunan', 'MENIKAH', 'Islam', '2024-04-15', '0001234567902', 'BPJ'),
('RM000014', 'Nur Hidayah', '3372011912850014', 'P', 'Solo', '1985-12-19', 'Suminah', 'Jl. P. Sudirman No. 50, Serengan, Solo', 'B', '081300000014', 'Dokter', 'MENIKAH', 'Islam', '2024-05-01', NULL, 'U'),
('RM000015', 'Fajar Kurniawan', '3372010208930015', 'L', 'Boyolali', '1993-08-02', 'Lastri', 'Jl. MT Haryono No. 14, Pasar Kliwon, Solo', 'A', '081300000015', 'Programmer', 'BELUM MENIKAH', 'Islam', '2024-05-05', NULL, 'U'),
('RM000016', 'Yuliana Sari', '3372011605870016', 'P', 'Sragen', '1987-05-16', 'Karsinah', 'Jl. Kapten Mulyadi No. 33, Laweyan, Solo', 'O', '081300000016', 'Apoteker', 'MENIKAH', 'Kristen', '2024-05-10', '0001234567905', 'BPJ'),
('RM000017', 'Dimas Pradipta', '3372012404020017', 'L', 'Solo', '2002-04-24', 'Winarti', 'Jl. Ki Hajar Dewantara No. 6, Jebres, Solo', 'B', '081300000017', 'Mahasiswa', 'BELUM MENIKAH', 'Islam', '2024-06-01', NULL, 'U'),
('RM000018', 'Tri Wahyuni', '3372010909800018', 'P', 'Wonogiri', '1980-09-09', 'Sunarti', 'Jl. Prof. Suharso No. 21, Banjarsari, Solo', 'A', '081300000018', 'Pedagang', 'MENIKAH', 'Islam', '2024-06-10', '0001234567907', 'BPJ'),
('RM000019', 'Rizky Firmansyah', '3372011302990019', 'L', 'Sukoharjo', '1999-02-13', 'Dewi Ratnasari', 'Jl. Yos Sudarso No. 17, Serengan, Solo', 'AB', '081300000019', 'Freelancer', 'BELUM MENIKAH', 'Islam', '2024-06-15', NULL, 'U'),
('RM000020', 'Mulyati', '3372012106720020', 'P', 'Klaten', '1972-06-21', 'Tukiyem', 'Jl. Adi Sucipto No. 44, Laweyan, Solo', 'O', '081300000020', 'Ibu Rumah Tangga', 'MENIKAH', 'Islam', '2024-07-01', '0001234567909', 'BPJ');

-- =====================================================
-- PENYAKIT (ICD-10 yang sering dipakai)
-- =====================================================
INSERT INTO penyakit (kd_penyakit, nm_penyakit, ciri_ciri) VALUES
('J06.9', 'ISPA (Infeksi Saluran Pernapasan Atas)', 'Batuk, pilek, demam, sakit tenggorokan'),
('J18.9', 'Pneumonia', 'Batuk berdahak, demam tinggi, sesak napas'),
('A09', 'Gastroenteritis (Diare)', 'BAB encer, mual, muntah, dehidrasi'),
('K29.7', 'Gastritis (Maag)', 'Nyeri ulu hati, mual, kembung, begah'),
('I10', 'Hipertensi Esensial', 'Tekanan darah tinggi, sakit kepala, pusing'),
('E11.9', 'Diabetes Mellitus Tipe 2', 'Sering kencing, haus, berat badan turun'),
('M54.5', 'Low Back Pain', 'Nyeri punggung bawah, kaku, kesulitan bergerak'),
('R50.9', 'Demam', 'Suhu tubuh tinggi, menggigil, lemas'),
('J45.9', 'Asma Bronkiale', 'Sesak napas, mengi, batuk terutama malam hari'),
('K30', 'Dispepsia', 'Nyeri perut atas, kembung, mual, rasa penuh'),
('N39.0', 'Infeksi Saluran Kemih', 'Nyeri saat BAK, sering BAK, demam'),
('L20.9', 'Dermatitis Atopik', 'Kulit gatal, kemerahan, kering, bersisik'),
('G43.9', 'Migrain', 'Nyeri kepala sebelah, mual, sensitif cahaya'),
('H10.9', 'Konjungtivitis', 'Mata merah, gatal, berair, belekan'),
('B00.9', 'Herpes Simplex', 'Luka lepuh pada kulit/bibir, nyeri, demam'),
('R51', 'Cephalgia (Sakit Kepala)', 'Nyeri kepala, pusing, tegang leher'),
('E78.5', 'Dislipidemia', 'Kolesterol tinggi, biasanya tanpa gejala'),
('J02.9', 'Faringitis Akut', 'Sakit tenggorokan, demam, sulit menelan'),
('M79.3', 'Myalgia', 'Nyeri otot, pegal-pegal, lemas'),
('B82.9', 'Helminthiasis (Cacingan)', 'Gatal anus, mual, perut buncit, pucat');

-- =====================================================
-- JENIS PERAWATAN / TINDAKAN
-- =====================================================
INSERT INTO jns_perawatan (kd_jenis_prw, nm_perawatan, total_byrdr, biaya_rawat, status) VALUES
('JNS001', 'Konsultasi Dokter Umum', 50000, 75000, 'Ralan'),
('JNS002', 'Konsultasi Dokter Spesialis', 100000, 150000, 'Ralan'),
('JNS003', 'Pemeriksaan Fisik Lengkap', 75000, 100000, 'Ralan'),
('JNS004', 'Nebulizer', 25000, 50000, 'Ralan'),
('JNS005', 'Injeksi Intravena', 15000, 30000, 'Ralan'),
('JNS006', 'Hecting (Jahit Luka)', 50000, 100000, 'Ralan'),
('JNS007', 'EKG', 50000, 100000, 'Ralan'),
('JNS008', 'Pemasangan Infus', 25000, 75000, 'Ralan'),
('JNS009', 'Ganti Verband', 15000, 35000, 'Ralan'),
('JNS010', 'Cabut Gigi', 75000, 125000, 'Ralan');

-- =====================================================
-- OBAT / BHP (FARMASI)
-- =====================================================
INSERT INTO databarang (kd_obat, nm_obat, satuan, harga_beli, harga_ralan, stok, stok_minimum, kategori) VALUES
('OBT001', 'Paracetamol 500mg', 'Tablet', 350, 500, 500, 50, 'Obat'),
('OBT002', 'Amoxicillin 500mg', 'Kapsul', 800, 1200, 300, 30, 'Obat'),
('OBT003', 'Omeprazole 20mg', 'Kapsul', 1500, 2500, 200, 20, 'Obat'),
('OBT004', 'Amlodipine 5mg', 'Tablet', 500, 800, 250, 25, 'Obat'),
('OBT005', 'Metformin 500mg', 'Tablet', 400, 700, 300, 30, 'Obat'),
('OBT006', 'Cetirizine 10mg', 'Tablet', 600, 1000, 200, 20, 'Obat'),
('OBT007', 'Ibuprofen 400mg', 'Tablet', 500, 800, 250, 25, 'Obat'),
('OBT008', 'Vitamin C 500mg', 'Tablet', 300, 500, 400, 40, 'Obat'),
('OBT009', 'Vitamin B Complex', 'Tablet', 250, 400, 350, 35, 'Obat'),
('OBT010', 'Dexamethasone 0.5mg', 'Tablet', 400, 700, 200, 20, 'Obat'),
('OBT011', 'Ranitidine 150mg', 'Tablet', 600, 1000, 180, 20, 'Obat'),
('OBT012', 'Salbutamol Inhaler', 'Pcs', 15000, 25000, 50, 10, 'Obat'),
('OBT013', 'ORS (Oralit)', 'Sachet', 1000, 2000, 300, 30, 'Obat'),
('OBT014', 'Loperamide 2mg', 'Tablet', 500, 900, 150, 15, 'Obat'),
('OBT015', 'Antasida DOEN', 'Tablet', 300, 500, 400, 40, 'Obat'),
('OBT016', 'Simvastatin 20mg', 'Tablet', 800, 1500, 200, 20, 'Obat'),
('OBT017', 'Diclofenac Sodium 50mg', 'Tablet', 500, 800, 250, 25, 'Obat'),
('OBT018', 'Ciprofloxacin 500mg', 'Tablet', 1200, 2000, 150, 15, 'Obat'),
('OBT019', 'Methylprednisolone 4mg', 'Tablet', 700, 1200, 200, 20, 'Obat'),
('OBT020', 'Domperidone 10mg', 'Tablet', 500, 800, 250, 25, 'Obat'),
('BHP001', 'Spuit 3cc', 'Pcs', 1500, 3000, 500, 50, 'BHP'),
('BHP002', 'Spuit 5cc', 'Pcs', 2000, 3500, 400, 40, 'BHP'),
('BHP003', 'Kasa Steril 16x16', 'Pcs', 2500, 4000, 300, 30, 'BHP'),
('BHP004', 'Plester Luka', 'Pcs', 500, 1000, 500, 50, 'BHP'),
('BHP005', 'Sarung Tangan', 'Pasang', 3000, 5000, 400, 40, 'BHP'),
('BHP006', 'Masker Medis', 'Pcs', 1000, 2000, 1000, 100, 'BHP'),
('BHP007', 'Kapas Alkohol', 'Pcs', 500, 1000, 500, 50, 'BHP'),
('BHP008', 'Infus Set', 'Set', 15000, 25000, 100, 10, 'BHP'),
('BHP009', 'Cairan Infus RL 500ml', 'Botol', 12000, 20000, 150, 15, 'BHP'),
('BHP010', 'Cairan Infus NaCl 500ml', 'Botol', 12000, 20000, 150, 15, 'BHP');

-- =====================================================
-- BANGSAL
-- =====================================================
INSERT INTO bangsal (kd_bangsal, nm_bangsal) VALUES
('BGL01', 'Bangsal Mawar'),
('BGL02', 'Bangsal Melati'),
('BGL03', 'Bangsal Anggrek'),
('BGL04', 'Bangsal Kenanga'),
('BGL05', 'ICU');

-- =====================================================
-- KAMAR
-- =====================================================
INSERT INTO kamar (kd_kamar, kd_bangsal, kelas, trf_kamar, status) VALUES
('KMR0101', 'BGL01', 'Kelas 3', 150000, 'KOSONG'),
('KMR0102', 'BGL01', 'Kelas 3', 150000, 'ISI'),
('KMR0103', 'BGL01', 'Kelas 3', 150000, 'KOSONG'),
('KMR0201', 'BGL02', 'Kelas 2', 250000, 'KOSONG'),
('KMR0202', 'BGL02', 'Kelas 2', 250000, 'ISI'),
('KMR0301', 'BGL03', 'Kelas 1', 400000, 'KOSONG'),
('KMR0302', 'BGL03', 'Kelas 1', 400000, 'KOSONG'),
('KMR0401', 'BGL04', 'VIP', 600000, 'ISI'),
('KMR0402', 'BGL04', 'VIP', 600000, 'KOSONG'),
('KMR0501', 'BGL05', 'Kelas 1', 1000000, 'KOSONG'),
('KMR0502', 'BGL05', 'Kelas 1', 1000000, 'KOSONG');

-- =====================================================
-- REGISTRASI KUNJUNGAN (data hari ini dan beberapa hari lalu)
-- Gunakan CURDATE() untuk data hari ini
-- =====================================================
INSERT INTO registrasi (no_rawat, no_rkm_medis, tgl_registrasi, jam_registrasi, kd_dokter, no_reg, kd_poli, stts, status_lanjut, kd_pj, status_bayar, status_poli) VALUES
-- Hari ini
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/001'), 'RM000001', CURDATE(), '08:00:00', 'DK001', '001', 'P002', 'Belum', 'Ralan', 'BPJ', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/002'), 'RM000002', CURDATE(), '08:15:00', 'DK002', '001', 'P003', 'Belum', 'Ralan', 'BPJ', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/003'), 'RM000003', CURDATE(), '08:30:00', 'DK003', '001', 'P001', 'Belum', 'Ralan', 'U', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/004'), 'RM000004', CURDATE(), '08:45:00', 'DK001', '002', 'P002', 'Belum', 'Ralan', 'BPJ', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/005'), 'RM000005', CURDATE(), '09:00:00', 'DK003', '002', 'P001', 'Belum', 'Ralan', 'U', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/006'), 'RM000006', CURDATE(), '09:15:00', 'DK002', '002', 'P003', 'Sudah', 'Ralan', 'BPJ', 'Belum', 'Sudah'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/007'), 'RM000008', CURDATE(), '09:30:00', 'DK003', '003', 'P001', 'Belum', 'Ralan', 'U', 'Belum', 'Belum'),
(CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/008'), 'RM000010', CURDATE(), '09:45:00', 'DK001', '003', 'P002', 'Belum', 'Ralan', 'U', 'Belum', 'Belum'),

-- Kemarin
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), 'RM000007', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:00:00', 'DK001', '001', 'P002', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), 'RM000009', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:30:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/003'), 'RM000011', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', 'DK002', '001', 'P003', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah'),

-- 2 hari lalu
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '%Y/%m/%d'), '/001'), 'RM000012', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:00:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '%Y/%m/%d'), '/002'), 'RM000013', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:30:00', 'DK001', '001', 'P002', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '%Y/%m/%d'), '/003'), 'RM000014', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00', 'DK001', '002', 'P002', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah'),

-- 3 hari lalu
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '%Y/%m/%d'), '/001'), 'RM000015', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '08:00:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '%Y/%m/%d'), '/002'), 'RM000016', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '08:30:00', 'DK002', '001', 'P003', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),

-- 4-6 hari lalu
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '%Y/%m/%d'), '/001'), 'RM000017', DATE_SUB(CURDATE(), INTERVAL 4 DAY), '08:00:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '%Y/%m/%d'), '/002'), 'RM000018', DATE_SUB(CURDATE(), INTERVAL 4 DAY), '08:30:00', 'DK001', '001', 'P002', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '%Y/%m/%d'), '/001'), 'RM000019', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '08:00:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '%Y/%m/%d'), '/002'), 'RM000020', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '08:30:00', 'DK004', '001', 'P005', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '%Y/%m/%d'), '/001'), 'RM000001', DATE_SUB(CURDATE(), INTERVAL 6 DAY), '08:00:00', 'DK001', '001', 'P002', 'Sudah', 'Ralan', 'BPJ', 'Sudah', 'Sudah'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '%Y/%m/%d'), '/002'), 'RM000005', DATE_SUB(CURDATE(), INTERVAL 6 DAY), '09:00:00', 'DK003', '001', 'P001', 'Sudah', 'Ralan', 'U', 'Sudah', 'Sudah');

-- =====================================================
-- RESEP OBAT (FARMASI)
-- =====================================================
INSERT INTO resep_obat (no_resep, tgl_peresepan, jam, no_rawat, kd_dokter, status) VALUES
('RSP-20240829-001', CURDATE(), '09:30:00', CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/006'), 'DK002', 'antre'),
('RSP-20240829-002', CURDATE(), '10:00:00', CONCAT(DATE_FORMAT(CURDATE(), '%Y/%m/%d'), '/006'), 'DK002', 'diracik'),
('RSP-20240828-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), 'DK001', 'selesai'),
('RSP-20240828-002', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30:00', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), 'DK003', 'selesai');

-- =====================================================
-- DETAIL RESEP
-- =====================================================
INSERT INTO detail_resep (no_resep, kd_obat, jml, aturan_pakai) VALUES
('RSP-20240829-001', 'OBT001', 10, '3x1 sesudah makan'),
('RSP-20240829-001', 'OBT008', 10, '1x1 sesudah makan'),
('RSP-20240829-001', 'OBT006', 5, '1x1 malam hari'),
('RSP-20240829-002', 'OBT002', 15, '3x1 sesudah makan'),
('RSP-20240829-002', 'OBT020', 10, '3x1 sebelum makan'),
('RSP-20240828-001', 'OBT004', 30, '1x1 pagi hari'),
('RSP-20240828-001', 'OBT016', 30, '1x1 malam hari'),
('RSP-20240828-002', 'OBT001', 10, '3x1 sesudah makan'),
('RSP-20240828-002', 'OBT013', 6, '3x1 setelah BAB');

-- =====================================================
-- PEMERIKSAAN RALAN (SOAP) - contoh data
-- =====================================================
INSERT INTO pemeriksaan_ralan (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, kesadaran, subjek, objek, asesmen, plan) VALUES
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '36.8', '150/90', '80', '20', '170', '75', 'Compos Mentis',
 'Pasien mengeluh pusing dan sakit kepala sudah 3 hari. Riwayat hipertensi sejak 5 tahun lalu. Minum obat tidak teratur.',
 'TD 150/90 mmHg, nadi reguler, tidak ada edema ekstremitas.',
 'Hipertensi Esensial tidak terkontrol',
 'Lanjutkan Amlodipine 5mg 1x1 dan Simvastatin 20mg 1x1. Edukasi minum obat teratur. Kontrol 2 minggu lagi.'
),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30:00', '37.5', '120/80', '88', '22', '165', '60', 'Compos Mentis',
 'Pasien datang dengan keluhan BAB cair >5x sejak kemarin. Mual, muntah 2x. Tidak ada darah dalam tinja.',
 'Turgor kulit sedikit menurun, bising usus meningkat, nyeri tekan epigastrium.',
 'Gastroenteritis Akut dengan dehidrasi ringan',
 'Rehidrasi oral dengan oralit. Paracetamol 3x500mg. Kontrol jika tidak membaik 3 hari.'
);

-- =====================================================
-- DIAGNOSA PASIEN
-- =====================================================
INSERT INTO diagnosa_pasien (no_rawat, kd_penyakit, status, prioritas) VALUES
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), 'I10', 'Ralan', 1),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), 'E78.5', 'Ralan', 2),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), 'A09', 'Ralan', 1);

-- =====================================================
-- KAMAR INAP (untuk statistik dashboard)
-- =====================================================
INSERT INTO kamar_inap (no_rawat, kd_kamar, tgl_masuk, jam_masuk, tgl_keluar, jam_keluar, stts_pulang) VALUES
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '%Y/%m/%d'), '/001'), 'KMR0102', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '14:00:00', NULL, NULL, '-'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '%Y/%m/%d'), '/001'), 'KMR0202', DATE_SUB(CURDATE(), INTERVAL 4 DAY), '10:00:00', NULL, NULL, '-'),
(CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '%Y/%m/%d'), '/001'), 'KMR0401', DATE_SUB(CURDATE(), INTERVAL 6 DAY), '16:00:00', NULL, NULL, '-');

-- =====================================================
-- BILLING (contoh tagihan yang sudah lunas)
-- =====================================================
INSERT INTO billing (no_nota, no_rawat, tgl_byr, jam_byr, nm_perawatan, kategori, biaya, jumlah, total_biaya, status) VALUES
('NTA-001', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Registrasi Poli Penyakit Dalam', 'Registrasi', 50000, 1, 50000, 'Sudah'),
('NTA-002', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Konsultasi Dokter Spesialis', 'Tindakan Dokter', 150000, 1, 150000, 'Sudah'),
('NTA-003', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Amlodipine 5mg', 'Obat', 800, 30, 24000, 'Sudah'),
('NTA-004', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/001'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'Simvastatin 20mg', 'Obat', 1500, 30, 45000, 'Sudah'),
('NTA-005', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'Registrasi Poli Umum', 'Registrasi', 25000, 1, 25000, 'Sudah'),
('NTA-006', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'Konsultasi Dokter Umum', 'Tindakan Dokter', 75000, 1, 75000, 'Sudah'),
('NTA-007', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'Paracetamol 500mg', 'Obat', 500, 10, 5000, 'Sudah'),
('NTA-008', CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y/%m/%d'), '/002'), DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:30:00', 'ORS (Oralit)', 'Obat', 2000, 6, 12000, 'Sudah');
