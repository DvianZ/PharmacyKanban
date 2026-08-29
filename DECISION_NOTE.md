# 📄 1-Page Decision Note: Pharmacy Kanban

🔗 **Live Prototype:** [https://pharmacykanban-production.up.railway.app/](https://pharmacykanban-production.up.railway.app/)  
💻 **GitHub Repo:** [https://github.com/DvianZ/PharmacyKanban](https://github.com/DvianZ/PharmacyKanban)

**Konteks & Latar Belakang (The Problem)**
Sistem Informasi Manajemen Rumah Sakit (SIMRS) Khanza yang digunakan saat ini merupakan *monolith* yang memiliki keunggulan luar biasa dalam kelengkapan fitur dan stabilitas database. Namun, antarmukanya (UI/UX) seringkali sangat kompleks dan kaku. Hal ini menciptakan *bottleneck* (kemacetan) operasional di lapangan, khususnya di **Instalasi Farmasi**, di mana apoteker dipaksa melakukan *refresh* tabel terus-menerus dan kebingungan melacak status ratusan resep setiap harinya.

Membangun ulang seluruh SIMRS Khanza dari awal adalah keputusan yang buruk, sangat berisiko, memakan waktu bertahun-tahun, dan sering berujung pada kegagalan adopsi. 

---

**Keputusan Arsitektur Utama (The Decision)**
Pendekatan kami adalah **Micro-Frontend / Decoupled UI Berbasis Kanban**. 
Daripada mengganti rumah sakit secara keseluruhan, kami mempertahankan *backend* dan *database* Khanza sebagai satu-satunya sumber kebenaran (*Single Source of Truth*), lalu membangun lapisan *frontend* modern (berupa Web App) yang secara spesifik difokuskan pada satu tugas kritis: Alur Pelayanan Resep.

1. **Kanban Board pattern (Drag and Drop):**
   - *Why:* Memecahkan masalah kognitif staf. Antrean resep diubah menjadi kartu visual (Resep Masuk -> Sedang Diracik -> Selesai).
   - *Impact:* Pembaruan status (dari antre menjadi diracik) terjadi seketika hanya dengan menyeret kartu (*drag*), memperbarui database secara asinkron tanpa perlunya memuat ulang halaman.

2. **Drop-in Compatible Database Integration:**
   - *Why:* Kami tidak membuat tabel database baru yang mengisolasi data. Aplikasi ini dirancang untuk melakukan *query* langsung ke struktur tabel warisan Khanza (`registrasi`, `resep_obat`, `detail_resep`, `databarang`).
   - *Impact:* Rumah sakit tidak perlu migrasi data. Sistem Kanban ini bisa langsung "dicolokkan" dan berjalan berdampingan dengan aplikasi Khanza desktop yang lama pada hari yang sama.

3. **Teknologi Ringan (Vanilla JS & Express.js):**
   - *Why:* Di lingkungan rumah sakit yang menuntut kecepatan tinggi dan kompatibilitas perangkat yang beragam (bahkan komputer lama), kami menghindari *framework frontend* yang berat. Kami menggunakan Vanilla JS, CSS murni (Tailwind), dan Express.js sebagai penjembatani REST API.

---

**Risiko, Trade-offs & Mitigasi**
- **Tightly Coupled Schema:** Karena sistem ini membaca skema Khanza, pembaruan pada struktur tabel inti Khanza akan berdampak pada aplikasi ini. *Mitigasi:* Kami mengabstraksi *query* di dalam API *layer* Node.js, sehingga pembaruan masa depan hanya perlu sedikit penyesuaian di *backend*, tanpa merusak *frontend*.
- **Otentikasi Demo:** Pada prototipe ini, sistem *role-based access* (RBAC) kami sederhanakan menggunakan JWT standar untuk keperluan kelancaran demo. Pada tahapan *production*, sistem login dapat dengan mudah diintegrasikan dengan modul LDAP/SSO bawaan rumah sakit.

---

**Visi Masa Depan (Scalability)**
Pola **"UI Decoupling"** yang sukses diterapkan pada modul farmasi ini merupakan *Proof of Concept* (PoC). Ke depannya, pendekatan ini dapat direplikasi untuk menciptakan modul terpisah yang sangat cepat dan fokus untuk divisi lain (contoh: *Mobile EMR* khusus Dokter, Dasbor Antrean Pasien), sambil tetap membiarkan jantung SIMRS (database) tidak tersentuh dan aman.
