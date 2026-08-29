/**
 * =====================================================
 * SIMRS Kanban - Frontend Application
 * Single Page Application dengan Vanilla JS
 * =====================================================
 */

// =====================================================
// API CLIENT
// =====================================================
const API = {
  base: '/api',
  token: localStorage.getItem('token'),

  setToken(t) { this.token = t; localStorage.setItem('token', t); },
  clearToken() { this.token = null; localStorage.removeItem('token'); },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const res = await fetch(`${this.base}${endpoint}`, { ...options, headers });
      if (res.status === 401) { App.logout(); throw new Error('Unauthorized'); }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      if (err.message !== 'Unauthorized') console.error('API Error:', err);
      throw err;
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const Utils = {
  formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  formatTime(timeStr) { return timeStr ? timeStr.substring(0, 5) : '-'; },

  hitungUmur(tglLahir) {
    if (!tglLahir) return '-';
    const birth = new Date(tglLahir);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return `${age} tahun`;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },

  statusBadge(status) {
    const map = {
      'Belum': 'badge-warning', 'Sudah': 'badge-success', 'Batal': 'badge-danger',
      'antre': 'badge-danger', 'diracik': 'badge-warning', 'selesai': 'badge-success',
      'Piutang': 'badge-info'
    };
    return `<span class="badge ${map[status] || 'badge-default'}">${status}</span>`;
  },

  genderBadge(jk) {
    return jk === 'L'
      ? '<span class="badge badge-info">Laki-laki</span>'
      : '<span class="badge badge-purple">Perempuan</span>';
  }
};

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'bx-check-circle', error: 'bx-x-circle', info: 'bx-info-circle', warning: 'bx-error' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class='bx ${icons[type]}'></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOutRight 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// =====================================================
// MODAL SYSTEM
// =====================================================
function openModal(title, content, size = '') {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modal.className = `modal ${size}`;
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  overlay.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// =====================================================
// MAIN APP CONTROLLER
// =====================================================
const App = {
  user: null,
  currentPage: '',

  init() {
    // Check existing token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      API.setToken(token);
      this.user = JSON.parse(userData);
      this.showApp();
    } else {
      this.showLogin();
    }

    // Event listeners
    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('btn-logout').addEventListener('click', () => this.logout());
    document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('mobile-toggle').addEventListener('click', () => this.toggleMobileSidebar());
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

    // Hash router
    window.addEventListener('hashchange', () => this.route());

    // Clock
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Load theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    this.updateThemeIcon(theme);
  },

  async handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errDiv = document.getElementById('login-error');
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0;"></div> Memproses...';
    btn.disabled = true;
    errDiv.style.display = 'none';

    try {
      const data = await API.post('/auth/login', { username, password });
      API.setToken(data.token);
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      this.showApp();
      showToast(`Selamat datang, ${data.user.nama}!`, 'success');
    } catch (err) {
      errDiv.textContent = err.message || 'Login gagal';
      errDiv.style.display = 'block';
    } finally {
      btn.innerHTML = "<i class='bx bx-log-in'></i> Masuk";
      btn.disabled = false;
    }
  },

  logout() {
    API.clearToken();
    this.user = null;
    localStorage.removeItem('user');
    this.showLogin();
  },

  showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app-layout').style.display = 'none';
    location.hash = '';
  },

  showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-layout').style.display = 'flex';

    // Update user info
    document.getElementById('user-name').textContent = this.user.nama;
    document.getElementById('user-role').textContent = this.user.role;

    // Filter nav by role
    this.filterNavByRole();

    // Route to default page
    if (!location.hash || location.hash === '#/') {
      location.hash = '#/farmasi';
    } else {
      this.route();
    }
  },

  filterNavByRole() {
    const sections = document.querySelectorAll('.nav-section[data-roles]');
    sections.forEach(section => {
      const roles = section.dataset.roles.split(',');
      section.style.display = (roles.includes(this.user.role) || this.user.role === 'admin') ? '' : 'none';
    });
  },

  route() {
    const hash = location.hash.slice(2) || 'farmasi';
    const page = hash.split('/')[0];
    this.currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Page titles
    const titles = {
      'dashboard': 'Dashboard',
      'registrasi': 'Registrasi Pasien',
      'rawat-jalan': 'Input Resep (Dokter)',
      'farmasi': 'Farmasi (Kanban)',
      'stok-obat': 'Stok Obat & BHP',
      'billing': 'Billing / Kasir',
      'pasien': 'Data Pasien',
    };
    document.getElementById('page-title').textContent = titles[page] || 'SIMRS Kanban';

    // Render page
    const pages = {
      'dashboard': Pages.dashboard,
      'registrasi': Pages.registrasi,
      'rawat-jalan': Pages.rawatJalan,
      'farmasi': Pages.farmasi,
      'stok-obat': Pages.stokObat,
      'billing': Pages.billing,
      'pasien': Pages.pasien,
    };

    const renderFn = pages[page];
    if (renderFn) {
      renderFn.call(Pages);
    } else {
      document.getElementById('content-area').innerHTML = `
        <div class="empty-state">
          <i class='bx bx-error-circle'></i>
          <h3>Halaman tidak ditemukan</h3>
          <p>Halaman "${page}" tidak tersedia.</p>
        </div>`;
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  },

  toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
  },

  updateClock() {
    const now = new Date();
    document.getElementById('topbar-clock').textContent = now.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' WIB';
  }
};

// =====================================================
// PAGE MODULES
// =====================================================
const Pages = {

  // ===================================================
  // DASHBOARD
  // ===================================================
  async dashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><p>Memuat dashboard...</p></div>';

    try {
      const stats = await API.get('/dashboard/stats');

      content.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon"><i class='bx bxs-group'></i></div>
            <div class="stat-value">${stats.totalPasienHariIni}</div>
            <div class="stat-label">Pasien Hari Ini</div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon"><i class='bx bxs-user-check'></i></div>
            <div class="stat-value">${stats.totalPasien}</div>
            <div class="stat-label">Total Pasien Terdaftar</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon"><i class='bx bxs-capsule'></i></div>
            <div class="stat-value">${stats.resepAntre + stats.resepDiracik}</div>
            <div class="stat-label">Resep Menunggu</div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><i class='bx bxs-bed'></i></div>
            <div class="stat-value">${stats.kamarTerisi}/${stats.totalKamar}</div>
            <div class="stat-label">Kamar Terisi</div>
          </div>
          <div class="stat-card cyan">
            <div class="stat-icon"><i class='bx bxs-wallet'></i></div>
            <div class="stat-value">${Utils.formatRupiah(stats.pendapatanHariIni)}</div>
            <div class="stat-label">Pendapatan Hari Ini</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class='bx bx-line-chart' style="color:var(--primary);margin-right:6px;"></i> Tren Kunjungan 7 Hari</h3>
            </div>
            <div class="card-body chart-container">
              <div class="chart-bar-container" id="chart-tren"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class='bx bx-building-house' style="color:var(--secondary);margin-right:6px;"></i> Kunjungan per Poli</h3>
            </div>
            <div class="card-body">
              <ul class="poli-list" id="poli-list">
                ${stats.perPoli.length === 0 ? '<li class="text-muted text-center">Belum ada kunjungan hari ini</li>' :
                  stats.perPoli.map(p => `
                    <li>
                      <span>${p.nm_poli}</span>
                      <span class="poli-count">${p.jumlah}</span>
                    </li>
                  `).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;

      // Render chart
      Pages.renderChart(stats.tren);
    } catch (err) {
      content.innerHTML = `<div class="empty-state"><i class='bx bx-error-circle'></i><h3>Gagal memuat dashboard</h3><p>${err.message}</p></div>`;
    }
  },

  renderChart(tren) {
    const chart = document.getElementById('chart-tren');
    if (!chart) return;

    // Fill missing days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = tren.find(t => t.tanggal === dateStr);
      days.push({ tanggal: dateStr, jumlah: found ? found.jumlah : 0, label: d.toLocaleDateString('id-ID', { weekday: 'short' }) });
    }

    const maxVal = Math.max(...days.map(d => d.jumlah), 1);
    chart.innerHTML = days.map(d => {
      const height = Math.max((d.jumlah / maxVal) * 140, 4);
      return `
        <div class="chart-bar-wrapper">
          <span class="chart-bar-value">${d.jumlah}</span>
          <div class="chart-bar" style="height:${height}px;" title="${d.jumlah} kunjungan"></div>
          <span class="chart-bar-label">${d.label}</span>
        </div>
      `;
    }).join('');
  },

  // ===================================================
  // REGISTRASI
  // ===================================================
  async registrasi() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary" onclick="Pages.showRegistrasiForm()">
            <i class='bx bx-plus'></i> Registrasi Baru
          </button>
        </div>
        <div class="toolbar-right">
          <input type="date" class="form-control" id="filter-tgl-registrasi" value="${new Date().toISOString().split('T')[0]}" onchange="Pages.loadRegistrasi()" style="width:auto;">
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="registrasi-table-container">
          <div class="loading-overlay"><div class="spinner"></div></div>
        </div>
      </div>
    `;
    Pages.loadRegistrasi();
  },

  async loadRegistrasi() {
    const container = document.getElementById('registrasi-table-container');
    const tgl = document.getElementById('filter-tgl-registrasi')?.value || new Date().toISOString().split('T')[0];

    try {
      const rows = await API.get(`/registrasi?tanggal=${tgl}`);
      if (rows.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="bx bx-calendar-x"></i><h3>Belum ada registrasi</h3><p>Belum ada pasien yang terdaftar pada tanggal ini.</p></div>';
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>No. Antrian</th>
              <th>No. Rawat</th>
              <th>Pasien</th>
              <th>Poli</th>
              <th>Dokter</th>
              <th>Penjamin</th>
              <th>Jam</th>
              <th>Status</th>
            </tr></thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td><span class="badge badge-info">${r.no_reg}</span></td>
                  <td><code style="font-size:0.78rem;">${r.no_rawat}</code></td>
                  <td>
                    <strong>${r.nm_pasien}</strong>
                    <div class="text-muted" style="font-size:0.75rem;">${r.no_rkm_medis} · ${Utils.genderBadge(r.jk)}</div>
                  </td>
                  <td>${r.nm_poli}</td>
                  <td>${r.nm_dokter}</td>
                  <td>${r.png_jawab}</td>
                  <td>${Utils.formatTime(r.jam_registrasi)}</td>
                  <td>${Utils.statusBadge(r.status_poli)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class='bx bx-error'></i><h3>Gagal memuat data</h3><p>${err.message}</p></div>`;
    }
  },

  async showRegistrasiForm() {
    try {
      const [poliList, dokterList, penjabList] = await Promise.all([
        API.get('/poliklinik'), API.get('/dokter'), API.get('/penjab')
      ]);

      openModal('Registrasi Pasien Baru', `
        <div class="form-group">
          <label>Cari Pasien (No. RM / Nama / KTP)</label>
          <div class="search-bar" style="max-width:100%;">
            <i class='bx bx-search'></i>
            <input type="text" id="reg-search-pasien" placeholder="Ketik nama atau No. RM..." oninput="Pages.searchPasienForReg(this.value)">
          </div>
          <div id="reg-pasien-results" style="margin-top:8px;"></div>
        </div>
        <input type="hidden" id="reg-no-rkm-medis">
        <div id="reg-pasien-info" style="display:none;" class="mb-2"></div>
        <hr style="border-color:var(--border-color);margin:16px 0;">
        <div class="form-row">
          <div class="form-group">
            <label>Poliklinik</label>
            <select class="form-control" id="reg-poli">
              <option value="">-- Pilih Poli --</option>
              ${poliList.map(p => `<option value="${p.kd_poli}">${p.nm_poli}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Dokter</label>
            <select class="form-control" id="reg-dokter">
              <option value="">-- Pilih Dokter --</option>
              ${dokterList.map(d => `<option value="${d.kd_dokter}">${d.nm_dokter}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Penjamin / Cara Bayar</label>
          <select class="form-control" id="reg-penjab">
            ${penjabList.map(p => `<option value="${p.kd_pj}">${p.png_jawab}</option>`).join('')}
          </select>
        </div>
        <div class="modal-footer" style="padding:16px 0 0;">
          <button class="btn btn-outline" onclick="closeModal()">Batal</button>
          <button class="btn btn-primary" onclick="Pages.submitRegistrasi()"><i class='bx bx-check'></i> Daftarkan</button>
        </div>
      `, 'modal-lg');
    } catch (err) {
      showToast('Gagal memuat form registrasi: ' + err.message, 'error');
    }
  },

  searchPasienForReg: Utils.debounce(async (query) => {
    if (query.length < 2) { document.getElementById('reg-pasien-results').innerHTML = ''; return; }
    try {
      const res = await API.get(`/pasien?search=${encodeURIComponent(query)}&limit=5`);
      const container = document.getElementById('reg-pasien-results');
      if (res.data.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">Pasien tidak ditemukan. <a href="#" onclick="Pages.showNewPasienForm();return false;" style="color:var(--primary);">Daftarkan baru?</a></p>';
        return;
      }
      container.innerHTML = res.data.map(p => `
        <div style="padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px;cursor:pointer;transition:all 0.2s;" 
             onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-color)'"
             onclick="Pages.selectPasienForReg('${p.no_rkm_medis}','${p.nm_pasien}','${p.jk}','${p.tgl_lahir}','${p.alamat || ''}')">
          <strong>${p.nm_pasien}</strong>
          <span class="text-muted" style="font-size:0.78rem;"> · ${p.no_rkm_medis} · ${Utils.genderBadge(p.jk)} · ${Utils.hitungUmur(p.tgl_lahir)}</span>
        </div>
      `).join('');
    } catch (err) { /* silent */ }
  }),

  selectPasienForReg(noRM, nama, jk, tglLahir, alamat) {
    document.getElementById('reg-no-rkm-medis').value = noRM;
    document.getElementById('reg-pasien-results').innerHTML = '';
    document.getElementById('reg-search-pasien').value = nama;
    document.getElementById('reg-pasien-info').style.display = 'block';
    document.getElementById('reg-pasien-info').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><label>No. RM</label><span>${noRM}</span></div>
        <div class="detail-item"><label>Nama</label><span>${nama}</span></div>
        <div class="detail-item"><label>Jenis Kelamin</label><span>${jk === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
        <div class="detail-item"><label>Umur</label><span>${Utils.hitungUmur(tglLahir)}</span></div>
      </div>
    `;
  },

  async submitRegistrasi() {
    const noRM = document.getElementById('reg-no-rkm-medis').value;
    const kdPoli = document.getElementById('reg-poli').value;
    const kdDokter = document.getElementById('reg-dokter').value;
    const kdPj = document.getElementById('reg-penjab').value;

    if (!noRM) { showToast('Pilih pasien terlebih dahulu', 'error'); return; }
    if (!kdPoli) { showToast('Pilih poliklinik', 'error'); return; }
    if (!kdDokter) { showToast('Pilih dokter', 'error'); return; }

    try {
      const res = await API.post('/registrasi', { no_rkm_medis: noRM, kd_dokter: kdDokter, kd_poli: kdPoli, kd_pj: kdPj });
      showToast(`Registrasi berhasil! No. Rawat: ${res.no_rawat}`, 'success');
      closeModal();
      Pages.loadRegistrasi();
    } catch (err) {
      showToast('Gagal registrasi: ' + err.message, 'error');
    }
  },

  // ===================================================
  // PASIEN (DATA MASTER)
  // ===================================================
  async pasien() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary" onclick="Pages.showNewPasienForm()">
            <i class='bx bx-user-plus'></i> Pasien Baru
          </button>
        </div>
        <div class="toolbar-right">
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" id="search-pasien" placeholder="Cari nama, No. RM, KTP..." oninput="Pages.loadPasien(1)">
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="pasien-table-container">
          <div class="loading-overlay"><div class="spinner"></div></div>
        </div>
      </div>
    `;
    Pages.loadPasien(1);
  },

  async loadPasien(page = 1) {
    const container = document.getElementById('pasien-table-container');
    const search = document.getElementById('search-pasien')?.value || '';

    try {
      const res = await API.get(`/pasien?search=${encodeURIComponent(search)}&page=${page}&limit=15`);
      if (res.data.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="bx bx-user-x"></i><h3>Tidak ada data pasien</h3></div>';
        return;
      }

      const totalPages = Math.ceil(res.total / res.limit);
      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>No. RM</th><th>Nama</th><th>JK</th><th>Umur</th><th>Alamat</th><th>No. Telp</th><th>Penjamin</th><th>Tgl Daftar</th>
            </tr></thead>
            <tbody>
              ${res.data.map(p => `
                <tr style="cursor:pointer;" onclick="Pages.showPasienDetail('${p.no_rkm_medis}')">
                  <td><code>${p.no_rkm_medis}</code></td>
                  <td><strong>${p.nm_pasien}</strong></td>
                  <td>${Utils.genderBadge(p.jk)}</td>
                  <td>${Utils.hitungUmur(p.tgl_lahir)}</td>
                  <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.alamat || '-'}</td>
                  <td>${p.no_tlp || '-'}</td>
                  <td><span class="badge badge-default">${p.png_jawab || 'Umum'}</span></td>
                  <td>${Utils.formatDate(p.tgl_daftar)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button ${page <= 1 ? 'disabled' : ''} onclick="Pages.loadPasien(${page - 1})">‹ Prev</button>
          <span class="text-muted" style="padding:8px;font-size:0.85rem;">Hal ${page} dari ${totalPages} (${res.total} data)</span>
          <button ${page >= totalPages ? 'disabled' : ''} onclick="Pages.loadPasien(${page + 1})">Next ›</button>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class='bx bx-error'></i><h3>Gagal memuat data</h3><p>${err.message}</p></div>`;
    }
  },

  showNewPasienForm() {
    openModal('Daftarkan Pasien Baru', `
      <div class="form-row">
        <div class="form-group"><label>Nama Lengkap *</label><input class="form-control" id="new-nm-pasien" required></div>
        <div class="form-group"><label>No. KTP</label><input class="form-control" id="new-no-ktp" maxlength="16"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Jenis Kelamin *</label><select class="form-control" id="new-jk"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
        <div class="form-group"><label>Tanggal Lahir *</label><input type="date" class="form-control" id="new-tgl-lahir"></div>
        <div class="form-group"><label>Tempat Lahir</label><input class="form-control" id="new-tmp-lahir"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Nama Ibu</label><input class="form-control" id="new-nm-ibu"></div>
        <div class="form-group"><label>No. Telepon</label><input class="form-control" id="new-no-tlp"></div>
      </div>
      <div class="form-group"><label>Alamat</label><textarea class="form-control" id="new-alamat" rows="2"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Gol. Darah</label><select class="form-control" id="new-gol-darah"><option value="-">-</option><option>A</option><option>B</option><option>O</option><option>AB</option></select></div>
        <div class="form-group"><label>Pekerjaan</label><input class="form-control" id="new-pekerjaan"></div>
        <div class="form-group"><label>Status Nikah</label><select class="form-control" id="new-stts-nikah"><option>BELUM MENIKAH</option><option>MENIKAH</option><option>JANDA</option><option>DUDA</option></select></div>
        <div class="form-group"><label>Agama</label><select class="form-control" id="new-agama"><option>Islam</option><option>Kristen</option><option>Katolik</option><option>Hindu</option><option>Buddha</option><option>Konghucu</option></select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>No. Peserta BPJS</label><input class="form-control" id="new-no-peserta" maxlength="13"></div>
        <div class="form-group"><label>Penjamin</label><select class="form-control" id="new-kd-pj"><option value="U">Umum / Pribadi</option><option value="BPJ">BPJS Kesehatan</option></select></div>
      </div>
      <div class="modal-footer" style="padding:16px 0 0;">
        <button class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="Pages.submitNewPasien()"><i class='bx bx-save'></i> Simpan</button>
      </div>
    `, 'modal-lg');
  },

  async submitNewPasien() {
    const data = {
      nm_pasien: document.getElementById('new-nm-pasien').value,
      no_ktp: document.getElementById('new-no-ktp').value,
      jk: document.getElementById('new-jk').value,
      tgl_lahir: document.getElementById('new-tgl-lahir').value,
      tmp_lahir: document.getElementById('new-tmp-lahir').value,
      nm_ibu: document.getElementById('new-nm-ibu').value,
      no_tlp: document.getElementById('new-no-tlp').value,
      alamat: document.getElementById('new-alamat').value,
      gol_darah: document.getElementById('new-gol-darah').value,
      pekerjaan: document.getElementById('new-pekerjaan').value,
      stts_nikah: document.getElementById('new-stts-nikah').value,
      agama: document.getElementById('new-agama').value,
      no_peserta: document.getElementById('new-no-peserta').value,
      kd_pj: document.getElementById('new-kd-pj').value,
    };

    if (!data.nm_pasien || !data.tgl_lahir) { showToast('Nama dan tanggal lahir wajib diisi', 'error'); return; }

    try {
      const res = await API.post('/pasien', data);
      showToast(`Pasien berhasil didaftarkan! No. RM: ${res.no_rkm_medis}`, 'success');
      closeModal();
      if (App.currentPage === 'pasien') Pages.loadPasien(1);
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error');
    }
  },

  async showPasienDetail(noRM) {
    try {
      const p = await API.get(`/pasien/${noRM}`);
      openModal('Detail Pasien', `
        <div class="detail-header">
          <div class="detail-avatar">${p.nm_pasien.charAt(0)}</div>
          <div class="detail-info">
            <h3>${p.nm_pasien}</h3>
            <p>${p.no_rkm_medis} · ${Utils.genderBadge(p.jk)} · ${Utils.hitungUmur(p.tgl_lahir)}</p>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><label>No. KTP</label><span>${p.no_ktp || '-'}</span></div>
          <div class="detail-item"><label>Tempat Lahir</label><span>${p.tmp_lahir || '-'}</span></div>
          <div class="detail-item"><label>Tanggal Lahir</label><span>${Utils.formatDate(p.tgl_lahir)}</span></div>
          <div class="detail-item"><label>Gol. Darah</label><span>${p.gol_darah}</span></div>
          <div class="detail-item"><label>No. Telepon</label><span>${p.no_tlp || '-'}</span></div>
          <div class="detail-item"><label>Nama Ibu</label><span>${p.nm_ibu || '-'}</span></div>
          <div class="detail-item"><label>Pekerjaan</label><span>${p.pekerjaan || '-'}</span></div>
          <div class="detail-item"><label>Status Nikah</label><span>${p.stts_nikah || '-'}</span></div>
          <div class="detail-item"><label>Agama</label><span>${p.agama || '-'}</span></div>
          <div class="detail-item"><label>Penjamin</label><span>${p.png_jawab || 'Umum'}</span></div>
          <div class="detail-item"><label>No. BPJS</label><span>${p.no_peserta || '-'}</span></div>
          <div class="detail-item"><label>Tgl Daftar</label><span>${Utils.formatDate(p.tgl_daftar)}</span></div>
        </div>
        <div class="detail-item mt-2"><label>Alamat</label><span>${p.alamat || '-'}</span></div>
      `, 'modal-lg');
    } catch (err) {
      showToast('Gagal memuat detail pasien', 'error');
    }
  },

  // ===================================================
  // RAWAT JALAN
  // ===================================================
  async rawatJalan() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="text-muted" style="font-size:0.85rem;"><i class='bx bx-calendar'></i> Pasien Rawat Jalan Hari Ini</span>
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="ralan-container">
          <div class="loading-overlay"><div class="spinner"></div></div>
        </div>
      </div>
    `;
    Pages.loadRawatJalan();
  },

  async loadRawatJalan() {
    const container = document.getElementById('ralan-container');
    try {
      const rows = await API.get('/rawat-jalan');
      if (rows.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="bx bx-calendar-x"></i><h3>Belum ada pasien rawat jalan hari ini</h3></div>';
        return;
      }

      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>No</th><th>Pasien</th><th>Poli</th><th>Dokter</th><th>Jam</th><th>Status SOAP</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              ${rows.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>
                    <strong>${r.nm_pasien}</strong>
                    <div class="text-muted" style="font-size:0.75rem;">${r.no_rkm_medis} · ${Utils.hitungUmur(r.tgl_lahir)}</div>
                  </td>
                  <td>${r.nm_poli}</td>
                  <td>${r.nm_dokter}</td>
                  <td>${Utils.formatTime(r.jam_registrasi)}</td>
                  <td>${r.subjek ? '<span class="badge badge-success">Sudah</span>' : '<span class="badge badge-warning">Belum</span>'}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="Pages.showSOAPForm('${r.no_rawat}','${r.nm_pasien}','${r.no_rkm_medis}','${r.kd_dokter}','${r.nm_dokter}')">
                      <i class='bx bx-edit'></i> SOAP
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class='bx bx-error'></i><h3>Gagal memuat data</h3><p>${err.message}</p></div>`;
    }
  },

  async showSOAPForm(noRawat, nmPasien, noRM, kdDokter, nmDokter) {
    openModal(`Pemeriksaan: ${nmPasien}`, `
      <div class="detail-header mb-2">
        <div class="detail-avatar">${nmPasien.charAt(0)}</div>
        <div class="detail-info">
          <h3>${nmPasien}</h3>
          <p>${noRM} · Dokter: ${nmDokter}</p>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" onclick="Pages.switchTab(this,'soap-tab')">SOAP</button>
        <button class="tab-btn" onclick="Pages.switchTab(this,'diagnosa-tab')">Diagnosa</button>
        <button class="tab-btn" onclick="Pages.switchTab(this,'resep-tab')">Resep Obat</button>
      </div>

      <!-- SOAP Tab -->
      <div class="tab-content active" id="soap-tab">
        <p class="text-muted mb-2" style="font-size:0.82rem;">Vital Signs</p>
        <div class="form-row">
          <div class="form-group"><label>Tensi (mmHg)</label><input class="form-control" id="soap-tensi" placeholder="120/80"></div>
          <div class="form-group"><label>Suhu (°C)</label><input class="form-control" id="soap-suhu" placeholder="36.5"></div>
          <div class="form-group"><label>Nadi (/mnt)</label><input class="form-control" id="soap-nadi" placeholder="80"></div>
          <div class="form-group"><label>Respirasi (/mnt)</label><input class="form-control" id="soap-resp" placeholder="20"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Tinggi (cm)</label><input class="form-control" id="soap-tinggi" placeholder="170"></div>
          <div class="form-group"><label>Berat (kg)</label><input class="form-control" id="soap-berat" placeholder="65"></div>
          <div class="form-group"><label>SpO2 (%)</label><input class="form-control" id="soap-spo2" placeholder="98"></div>
          <div class="form-group"><label>Kesadaran</label><select class="form-control" id="soap-kesadaran"><option>Compos Mentis</option><option>Somnolence</option><option>Sopor</option><option>Coma</option></select></div>
        </div>
        <div class="form-group"><label><strong>S</strong>ubjective - Keluhan Pasien</label><textarea class="form-control" id="soap-subjek" rows="3" placeholder="Keluhan yang dirasakan pasien..."></textarea></div>
        <div class="form-group"><label><strong>O</strong>bjective - Hasil Pemeriksaan</label><textarea class="form-control" id="soap-objek" rows="3" placeholder="Hasil pemeriksaan fisik..."></textarea></div>
        <div class="form-group"><label><strong>A</strong>ssessment - Penilaian</label><textarea class="form-control" id="soap-asesmen" rows="2" placeholder="Penilaian/diagnosis kerja..."></textarea></div>
        <div class="form-group"><label><strong>P</strong>lan - Rencana</label><textarea class="form-control" id="soap-plan" rows="2" placeholder="Rencana tindakan/terapi..."></textarea></div>
        <button class="btn btn-success w-100" onclick="Pages.submitSOAP('${noRawat}')"><i class='bx bx-save'></i> Simpan SOAP</button>
      </div>

      <!-- Diagnosa Tab -->
      <div class="tab-content" id="diagnosa-tab">
        <div class="form-group">
          <label>Cari Diagnosa (ICD-10)</label>
          <div class="search-bar" style="max-width:100%;">
            <i class='bx bx-search'></i>
            <input type="text" id="search-diagnosa" placeholder="Ketik kode atau nama penyakit..." oninput="Pages.searchDiagnosa(this.value)">
          </div>
          <div id="diagnosa-results" style="margin-top:8px;max-height:200px;overflow-y:auto;"></div>
        </div>
        <div id="selected-diagnosa" class="mb-2"></div>
        <button class="btn btn-success w-100" onclick="Pages.submitDiagnosa('${noRawat}')"><i class='bx bx-save'></i> Simpan Diagnosa</button>
      </div>

      <!-- Resep Tab -->
      <div class="tab-content" id="resep-tab">
        <div class="form-group">
          <label>Cari Obat</label>
          <div class="search-bar" style="max-width:100%;">
            <i class='bx bx-search'></i>
            <input type="text" id="search-obat" placeholder="Ketik nama obat..." oninput="Pages.searchObat(this.value)">
          </div>
          <div id="obat-results" style="margin-top:8px;max-height:200px;overflow-y:auto;"></div>
        </div>
        <div id="selected-obat" class="mb-2"></div>
        <button class="btn btn-success w-100" onclick="Pages.submitResep('${noRawat}','${kdDokter}')"><i class='bx bx-save'></i> Kirim Resep ke Farmasi</button>
      </div>
    `, 'modal-xl');

    // Initialize temp storage
    window._selectedDiagnosa = [];
    window._selectedObat = [];
  },

  switchTab(btn, tabId) {
    btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    btn.closest('.modal-body').querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
  },

  async submitSOAP(noRawat) {
    try {
      await API.post('/rawat-jalan/soap', {
        no_rawat: noRawat,
        tensi: document.getElementById('soap-tensi').value,
        suhu_tubuh: document.getElementById('soap-suhu').value,
        nadi: document.getElementById('soap-nadi').value,
        respirasi: document.getElementById('soap-resp').value,
        tinggi: document.getElementById('soap-tinggi').value,
        berat: document.getElementById('soap-berat').value,
        spo2: document.getElementById('soap-spo2').value,
        kesadaran: document.getElementById('soap-kesadaran').value,
        subjek: document.getElementById('soap-subjek').value,
        objek: document.getElementById('soap-objek').value,
        asesmen: document.getElementById('soap-asesmen').value,
        plan: document.getElementById('soap-plan').value,
      });
      showToast('SOAP berhasil disimpan!', 'success');
      Pages.loadRawatJalan();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); }
  },

  searchDiagnosa: Utils.debounce(async (q) => {
    if (q.length < 2) { document.getElementById('diagnosa-results').innerHTML = ''; return; }
    const rows = await API.get(`/penyakit?search=${encodeURIComponent(q)}`);
    document.getElementById('diagnosa-results').innerHTML = rows.map(d => `
      <div style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:0.85rem;"
           onclick="Pages.addDiagnosa('${d.kd_penyakit}','${d.nm_penyakit.replace(/'/g, "\\'")}')">
        <strong>${d.kd_penyakit}</strong> - ${d.nm_penyakit}
      </div>
    `).join('');
  }),

  addDiagnosa(kd, nm) {
    if (window._selectedDiagnosa.find(d => d.kd_penyakit === kd)) return;
    window._selectedDiagnosa.push({ kd_penyakit: kd, nm_penyakit: nm, prioritas: window._selectedDiagnosa.length + 1 });
    Pages.renderSelectedDiagnosa();
  },

  renderSelectedDiagnosa() {
    document.getElementById('selected-diagnosa').innerHTML = window._selectedDiagnosa.map((d, i) => `
      <div class="d-flex align-center justify-between" style="padding:8px 12px;background:var(--bg-hover);border-radius:8px;margin-bottom:6px;">
        <span><span class="badge badge-info">${d.kd_penyakit}</span> ${d.nm_penyakit}</span>
        <button class="btn btn-sm btn-danger" onclick="window._selectedDiagnosa.splice(${i},1);Pages.renderSelectedDiagnosa()"><i class='bx bx-x'></i></button>
      </div>
    `).join('');
  },

  async submitDiagnosa(noRawat) {
    if (window._selectedDiagnosa.length === 0) { showToast('Pilih minimal 1 diagnosa', 'error'); return; }
    try {
      await API.post('/rawat-jalan/diagnosa', { no_rawat: noRawat, diagnosa: window._selectedDiagnosa });
      showToast('Diagnosa berhasil disimpan!', 'success');
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); }
  },

  searchObat: Utils.debounce(async (q) => {
    if (q.length < 2) { document.getElementById('obat-results').innerHTML = ''; return; }
    const rows = await API.get(`/obat?search=${encodeURIComponent(q)}`);
    document.getElementById('obat-results').innerHTML = rows.map(o => `
      <div style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:0.85rem;"
           onclick="Pages.addObat('${o.kd_obat}','${o.nm_obat.replace(/'/g, "\\'")}','${o.satuan}')">
        <strong>${o.nm_obat}</strong> <span class="text-muted">(${o.satuan}) - Stok: ${o.stok}</span>
      </div>
    `).join('');
  }),

  addObat(kd, nm, satuan) {
    if (window._selectedObat.find(o => o.kd_obat === kd)) return;
    window._selectedObat.push({ kd_obat: kd, nm_obat: nm, satuan, jml: 10, aturan_pakai: '3x1 sesudah makan' });
    Pages.renderSelectedObat();
  },

  renderSelectedObat() {
    document.getElementById('selected-obat').innerHTML = window._selectedObat.map((o, i) => `
      <div style="padding:10px 12px;background:var(--bg-hover);border-radius:8px;margin-bottom:6px;">
        <div class="d-flex align-center justify-between mb-1">
          <strong style="font-size:0.88rem;">${o.nm_obat}</strong>
          <button class="btn btn-sm btn-danger" onclick="window._selectedObat.splice(${i},1);Pages.renderSelectedObat()"><i class='bx bx-x'></i></button>
        </div>
        <div class="form-row" style="grid-template-columns:100px 1fr;">
          <div class="form-group" style="margin:0;"><label style="font-size:0.72rem;">Jumlah</label><input class="form-control" type="number" value="${o.jml}" min="1" onchange="window._selectedObat[${i}].jml=parseInt(this.value)" style="padding:6px 8px;"></div>
          <div class="form-group" style="margin:0;"><label style="font-size:0.72rem;">Aturan Pakai</label><input class="form-control" value="${o.aturan_pakai}" onchange="window._selectedObat[${i}].aturan_pakai=this.value" style="padding:6px 8px;"></div>
        </div>
      </div>
    `).join('');
  },

  async submitResep(noRawat, kdDokter) {
    if (window._selectedObat.length === 0) { showToast('Tambahkan minimal 1 obat', 'error'); return; }
    try {
      await API.post('/rawat-jalan/resep', { no_rawat: noRawat, kd_dokter: kdDokter, items: window._selectedObat });
      showToast('Resep berhasil dikirim ke Farmasi!', 'success');
      closeModal();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); }
  },

  // ===================================================
  // FARMASI KANBAN
  // ===================================================
  async farmasi() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="text-muted" style="font-size:0.85rem;"><i class='bx bx-time-five'></i> Update otomatis · Drag & drop untuk mengubah status</span>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-outline btn-sm" onclick="Pages.loadFarmasi()"><i class='bx bx-refresh'></i> Refresh</button>
        </div>
      </div>
      <div class="kanban-board" id="kanban-board">
        <div class="kanban-column antre">
          <div class="kanban-column-header">
            <h3><i class='bx bx-time-five' style="color:var(--danger);"></i> Resep Masuk</h3>
            <span class="count" id="count-antre">0</span>
          </div>
          <div class="kanban-cards" id="kanban-antre"></div>
        </div>
        <div class="kanban-column diracik">
          <div class="kanban-column-header">
            <h3><i class='bx bx-loader-alt' style="color:var(--warning);"></i> Sedang Diracik</h3>
            <span class="count" id="count-diracik">0</span>
          </div>
          <div class="kanban-cards" id="kanban-diracik"></div>
        </div>
        <div class="kanban-column selesai">
          <div class="kanban-column-header">
            <h3><i class='bx bx-check-circle' style="color:var(--success);"></i> Siap Diambil</h3>
            <span class="count" id="count-selesai">0</span>
          </div>
          <div class="kanban-cards" id="kanban-selesai"></div>
        </div>
      </div>
    `;
    Pages.loadFarmasi();
  },

  async loadFarmasi() {
    try {
      const reseps = await API.get('/farmasi/antrian');
      window._currentReseps = reseps; // Simpan untuk modal detail

      ['antre', 'diracik', 'selesai'].forEach(status => {
        const container = document.getElementById(`kanban-${status}`);
        const items = reseps.filter(r => r.status === status);
        document.getElementById(`count-${status}`).textContent = items.length;

        container.innerHTML = items.length === 0
          ? '<div class="text-center text-muted" style="padding:40px;font-size:0.85rem;"><i class="bx bx-inbox" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.3;"></i>Kosong</div>'
          : items.map(r => `
            <div class="kanban-card" data-id="${r.no_resep}" onclick="Pages.showDetailResep('${r.no_resep}')" style="cursor:pointer;" title="Klik untuk melihat detail dan validasi stok">
              <div class="patient-name">${r.nm_pasien}</div>
              <div class="resep-id">${r.no_resep}</div>
              <div class="doctor-name"><i class='bx bx-user'></i> ${r.nm_dokter} · ${r.nm_poli}</div>
              <div class="obat-list">
                ${(r.items || []).map(item => `
                  <div class="obat-item">
                    <span>${item.nm_obat}</span>
                    <span class="qty">${item.jml} ${item.satuan}</span>
                  </div>
                `).join('')}
              </div>
              <div class="card-time"><i class='bx bx-time'></i> ${Utils.formatTime(r.jam)}</div>
            </div>
          `).join('');

        // Initialize Sortable
        if (!container._sortable) {
          container._sortable = new Sortable(container, {
            group: 'farmasi',
            animation: 200,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onEnd: async (evt) => {
              const noResep = evt.item.dataset.id;
              const statusBaru = evt.to.id.replace('kanban-', '');
              try {
                await API.put('/farmasi/status', { no_resep: noResep, status: statusBaru });
                showToast(`Status resep diperbarui: ${statusBaru}`, 'success');
                Pages.loadFarmasi(); // Refresh counts
              } catch (err) {
                showToast(err.message || 'Gagal update status. Periksa ketersediaan stok!', 'error');
                Pages.loadFarmasi(); // Kembalikan posisi kartu
              }
            }
          });
        }
      });
    } catch (err) {
      document.getElementById('kanban-antre').innerHTML = `<div class="text-center text-muted" style="padding:20px;">${err.message}</div>`;
    }
  },

  showDetailResep(noResep) {
    const resep = window._currentReseps.find(r => r.no_resep === noResep);
    if (!resep) return;

    const itemsHtml = (resep.items || []).map(item => `
      <tr>
        <td><strong>${item.nm_obat}</strong></td>
        <td>${item.jml} ${item.satuan}</td>
        <td><span class="badge badge-info">${item.aturan_pakai || '-'}</span></td>
      </tr>
    `).join('');

    const content = `
      <div style="margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
        <h4 style="margin:0;">${resep.nm_pasien} <span style="font-size:0.85rem;font-weight:normal;color:var(--text-muted);">(${resep.no_resep})</span></h4>
        <div style="font-size:0.9rem; margin-top:5px;"><i class='bx bx-user'></i> Dokter: ${resep.nm_dokter}</div>
        <div style="font-size:0.9rem;"><i class='bx bx-time'></i> Waktu Resep: ${Utils.formatTime(resep.jam)}</div>
        <div style="font-size:0.9rem;"><i class='bx bx-info-circle'></i> Status: <strong>${resep.status.toUpperCase()}</strong></div>
      </div>
      <h5>Detail Obat & Aturan Pakai:</h5>
      <table class="data-table" style="margin-top:10px;">
        <thead>
          <tr><th>Nama Obat</th><th>Jumlah</th><th>Aturan Pakai</th></tr>
        </thead>
        <tbody>${itemsHtml || '<tr><td colspan="3" class="text-center">Tidak ada obat</td></tr>'}</tbody>
      </table>
      <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:0.85rem; color:var(--text-muted);">
          <i class='bx bx-info-square'></i> Tips: Seret kartu ke "Sedang Diracik" untuk validasi stok.
        </div>
        <button class="btn btn-primary btn-sm" onclick="Pages.cetakEtiket('${resep.no_resep}')">
          <i class='bx bx-printer'></i> Cetak Etiket (Label)
        </button>
      </div>
    `;
    
    openModal('Detail E-Resep', content, 'modal-md');
  },

  cetakEtiket(noResep) {
    const resep = window._currentReseps.find(r => r.no_resep === noResep);
    if (!resep) return;

    // Create a temporary hidden iframe or div to print
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    let labelsHtml = (resep.items || []).map(item => `
      <div style="border:1px solid #000; padding:10px; margin-bottom:10px; width:300px; font-family:sans-serif; border-radius:5px;">
        <div style="text-align:center; border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:5px;">
          <strong>RS Indriati Boyolali</strong><br>
          <small>Instalasi Farmasi</small>
        </div>
        <table style="width:100%; font-size:12px;">
          <tr><td width="80">No. Resep</td><td>: ${resep.no_resep}</td></tr>
          <tr><td>Pasien</td><td>: <strong>${resep.nm_pasien}</strong></td></tr>
          <tr><td>Tanggal</td><td>: ${Utils.formatDate(resep.tgl_peresepan)}</td></tr>
        </table>
        <div style="text-align:center; margin:15px 0;">
          <h3 style="margin:0;">${item.nm_obat}</h3>
          <p style="margin:5px 0;">Qty: ${item.jml} ${item.satuan}</p>
        </div>
        <div style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; background:#eee;">
          ${item.aturan_pakai || 'Sesuai petunjuk dokter'}
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head><title>Cetak Etiket - ${resep.no_resep}</title></head>
        <body style="padding:20px;" onload="window.print(); window.close();">
          ${labelsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  },

  // ===================================================
  // STOK OBAT
  // ===================================================
  async stokObat() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" id="search-stok" placeholder="Cari obat/BHP..." oninput="Pages.loadStokObat()">
          </div>
          <select class="form-control" id="filter-kategori" onchange="Pages.loadStokObat()" style="width:auto;">
            <option value="">Semua Kategori</option>
            <option value="Obat">Obat</option>
            <option value="BHP">BHP</option>
            <option value="Alkes">Alkes</option>
          </select>
        </div>
        <div class="toolbar-right">
          <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
            <input type="checkbox" id="filter-low-stock" onchange="Pages.loadStokObat()"> Stok Menipis
          </label>
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="stok-container">
          <div class="loading-overlay"><div class="spinner"></div></div>
        </div>
      </div>
    `;
    Pages.loadStokObat();
  },

  async loadStokObat() {
    const container = document.getElementById('stok-container');
    const search = document.getElementById('search-stok')?.value || '';
    const kategori = document.getElementById('filter-kategori')?.value || '';
    const lowStock = document.getElementById('filter-low-stock')?.checked || false;

    try {
      const rows = await API.get(`/farmasi/stok?search=${encodeURIComponent(search)}&kategori=${kategori}&low_stock=${lowStock}`);

      container.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>Kode</th><th>Nama</th><th>Kategori</th><th>Satuan</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok</th><th>Min. Stok</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${rows.map(o => {
                const isLow = o.stok <= o.stok_minimum;
                return `
                <tr>
                  <td><code>${o.kd_obat}</code></td>
                  <td><strong>${o.nm_obat}</strong></td>
                  <td><span class="badge ${o.kategori === 'Obat' ? 'badge-info' : o.kategori === 'BHP' ? 'badge-warning' : 'badge-purple'}">${o.kategori}</span></td>
                  <td>${o.satuan}</td>
                  <td>${Utils.formatRupiah(o.harga_beli)}</td>
                  <td>${Utils.formatRupiah(o.harga_ralan)}</td>
                  <td class="${isLow ? 'text-danger fw-bold' : ''}">${o.stok}</td>
                  <td>${o.stok_minimum}</td>
                  <td>${isLow ? '<span class="badge badge-danger">⚠ Stok Rendah</span>' : '<span class="badge badge-success">Aman</span>'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class='bx bx-error'></i><h3>Gagal memuat data</h3><p>${err.message}</p></div>`;
    }
  },

  // ===================================================
  // BILLING / KASIR
  // ===================================================
  async billing() {
    const content = document.getElementById('content-area');
    content.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary" onclick="Pages.showBillingSearch()">
            <i class='bx bx-receipt'></i> Proses Pembayaran
          </button>
        </div>
        <div class="toolbar-right">
          <input type="date" class="form-control" id="filter-tgl-billing" value="${new Date().toISOString().split('T')[0]}" onchange="Pages.loadBilling()" style="width:auto;">
        </div>
      </div>
      <div class="card">
        <div class="card-body" id="billing-container">
          <div class="loading-overlay"><div class="spinner"></div></div>
        </div>
      </div>
    `;
    Pages.loadBilling();
  },

  async loadBilling() {
    const container = document.getElementById('billing-container');
    const tgl = document.getElementById('filter-tgl-billing')?.value || new Date().toISOString().split('T')[0];

    try {
      const rows = await API.get(`/billing?tanggal=${tgl}`);
      if (rows.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="bx bx-receipt"></i><h3>Belum ada transaksi</h3><p>Belum ada pembayaran pada tanggal ini.</p></div>';
        return;
      }

      // Group by no_rawat
      const grouped = {};
      rows.forEach(b => {
        if (!grouped[b.no_rawat]) grouped[b.no_rawat] = { nm_pasien: b.nm_pasien, no_rkm_medis: b.no_rkm_medis, png_jawab: b.png_jawab, items: [], total: 0 };
        grouped[b.no_rawat].items.push(b);
        grouped[b.no_rawat].total += parseFloat(b.total_biaya);
      });

      const totalPendapatan = rows.reduce((sum, b) => sum + parseFloat(b.total_biaya), 0);

      container.innerHTML = `
        <div class="d-flex justify-between align-center mb-2">
          <span class="text-muted">${Object.keys(grouped).length} transaksi</span>
          <strong style="font-size:1.1rem;color:var(--success);">Total: ${Utils.formatRupiah(totalPendapatan)}</strong>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr>
              <th>No. Rawat</th><th>Pasien</th><th>Item</th><th>Kategori</th><th>Biaya</th><th>Qty</th><th>Subtotal</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${rows.map(b => `
                <tr>
                  <td><code style="font-size:0.75rem;">${b.no_rawat}</code></td>
                  <td>${b.nm_pasien}</td>
                  <td>${b.nm_perawatan}</td>
                  <td><span class="badge badge-default">${b.kategori}</span></td>
                  <td>${Utils.formatRupiah(b.biaya)}</td>
                  <td>${b.jumlah}</td>
                  <td class="fw-bold">${Utils.formatRupiah(b.total_biaya)}</td>
                  <td>${Utils.statusBadge(b.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class='bx bx-error'></i><h3>Gagal memuat data</h3><p>${err.message}</p></div>`;
    }
  },

  showBillingSearch() {
    openModal('Proses Pembayaran', `
      <div class="form-group">
        <label>Cari Pasien (untuk tagihan hari ini)</label>
        <div class="search-bar" style="max-width:100%;">
          <i class='bx bx-search'></i>
          <input type="text" id="billing-search" placeholder="Ketik nama atau No. RM..." oninput="Pages.searchPasienForBilling(this.value)">
        </div>
      </div>
      <div id="billing-search-results"></div>
    `, 'modal-lg');
  },

  searchPasienForBilling: Utils.debounce(async (q) => {
    if (q.length < 2) { document.getElementById('billing-search-results').innerHTML = ''; return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      const regs = await API.get(`/registrasi?tanggal=${today}`);
      const filtered = regs.filter(r => r.nm_pasien.toLowerCase().includes(q.toLowerCase()) || r.no_rkm_medis.includes(q));

      document.getElementById('billing-search-results').innerHTML = filtered.length === 0
        ? '<p class="text-muted">Tidak ditemukan registrasi hari ini.</p>'
        : filtered.map(r => `
          <div style="padding:12px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;cursor:pointer;" onclick="Pages.showBillingDetail('${r.no_rawat}')">
            <strong>${r.nm_pasien}</strong> <span class="text-muted">· ${r.no_rkm_medis}</span>
            <div class="text-muted" style="font-size:0.8rem;">${r.nm_poli} · ${r.nm_dokter} · ${Utils.statusBadge(r.status_bayar)}</div>
          </div>
        `).join('');
    } catch (err) { /* silent */ }
  }),

  async showBillingDetail(noRawat) {
    try {
      const data = await API.get(`/billing/pasien/${noRawat}`);
      const reg = data.registrasi;

      // Build billing items
      const items = [];
      // 1. Registrasi
      items.push({ nm_perawatan: `Registrasi ${reg.nm_poli}`, kategori: 'Registrasi', biaya: parseFloat(reg.biaya_registrasi), jumlah: 1, total_biaya: parseFloat(reg.biaya_registrasi) });

      // 2. Tindakan
      data.tindakan.forEach(t => {
        items.push({ nm_perawatan: t.nm_perawatan, kategori: 'Tindakan Dokter', biaya: parseFloat(t.biaya_rawat), jumlah: 1, total_biaya: parseFloat(t.biaya_rawat) });
      });

      // 3. Obat
      data.resep.forEach(o => {
        items.push({ nm_perawatan: o.nm_obat, kategori: 'Obat', biaya: parseFloat(o.harga_ralan), jumlah: o.jml, total_biaya: parseFloat(o.subtotal) });
      });

      const grandTotal = items.reduce((sum, i) => sum + i.total_biaya, 0);

      closeModal();
      setTimeout(() => {
        openModal(`Billing: ${reg.nm_pasien}`, `
          <div class="detail-header">
            <div class="detail-avatar">${reg.nm_pasien.charAt(0)}</div>
            <div class="detail-info">
              <h3>${reg.nm_pasien}</h3>
              <p>${reg.no_rkm_medis} · ${reg.nm_poli} · ${reg.nm_dokter}</p>
            </div>
          </div>

          <div class="table-wrapper mt-2">
            <table class="data-table">
              <thead><tr><th>Item</th><th>Kategori</th><th class="text-right">Harga</th><th class="text-right">Qty</th><th class="text-right">Subtotal</th></tr></thead>
              <tbody>
                ${items.map(i => `
                  <tr>
                    <td>${i.nm_perawatan}</td>
                    <td><span class="badge badge-default">${i.kategori}</span></td>
                    <td class="text-right">${Utils.formatRupiah(i.biaya)}</td>
                    <td class="text-right">${i.jumlah}</td>
                    <td class="text-right fw-bold">${Utils.formatRupiah(i.total_biaya)}</td>
                  </tr>
                `).join('')}
                <tr style="background:var(--bg-hover);">
                  <td colspan="4" class="text-right fw-bold" style="font-size:1rem;">TOTAL</td>
                  <td class="text-right fw-bold text-primary" style="font-size:1.1rem;">${Utils.formatRupiah(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer" style="padding:20px 0 0;">
            <button class="btn btn-outline" onclick="closeModal()">Batal</button>
            <button class="btn btn-success" onclick="Pages.prosesPayment('${noRawat}', ${JSON.stringify(items).replace(/"/g, '&quot;')})">
              <i class='bx bx-check-circle'></i> Proses Pembayaran ${Utils.formatRupiah(grandTotal)}
            </button>
          </div>
        `, 'modal-lg');
      }, 200);
    } catch (err) {
      showToast('Gagal memuat billing: ' + err.message, 'error');
    }
  },

  async prosesPayment(noRawat, items) {
    try {
      await API.post('/billing/bayar', { no_rawat: noRawat, items });
      showToast('Pembayaran berhasil diproses!', 'success');
      closeModal();
      if (App.currentPage === 'billing') Pages.loadBilling();
    } catch (err) {
      showToast('Gagal memproses pembayaran: ' + err.message, 'error');
    }
  },
};

// =====================================================
// INITIALIZE APP
// =====================================================
document.addEventListener('DOMContentLoaded', () => App.init());
