/**
 * =============================================================================
 * APPLICATION CONTROLLER: SIM-HALAL APP (MAIN ORCHESTRATOR)
 * =============================================================================
 * Kelas utama pengontrol aplikasi yang menerapkan prinsip OOP:
 * - Centralized State Management (State Anggota, Autentikasi Peran, Filter, dan Tab).
 * - Dua Peran Pengguna:
 *   1. Pengurus Fatayat NU: Akses penuh monitoring 45 UMKM, Tab 1 & Tab 2, bebas pilih dropdown.
 *   2. Pelaku Usaha (Member UMKM): Eksklusif Tab 2 Dashboard Mandiri, dropdown terkunci.
 * - Reactive Filtering, Drilldown Modal & Cetak Berkas Rekapitulasi per Status.
 */

// Resolusi Dependensi dari Namespace Window
const Member = window.Member;
const AuditCalculator = window.AuditCalculator;
const WhatsAppService = window.WhatsAppService;
const PrintService = window.PrintService;
const ChartService = window.ChartService;
const ExecutiveSummaryView = window.ExecutiveSummaryView;
const MemberDetailView = window.MemberDetailView;
const UIManager = window.UIManager;
const AuthView = window.AuthView;

class SimHalalApp {
  constructor() {
    // 1. Inisialisasi Data Layer ke Entity Models
    const rawData = window.SimHalalData.getMembers();
    this.members = rawData.map(raw => new Member(raw));

    // Muat anggota tambahan yang didaftarkan melalui form registrasi lokal
    try {
      const storedCustom = localStorage.getItem("simhalal_custom_members");
      if (storedCustom) {
        const customList = JSON.parse(storedCustom);
        customList.forEach(c => {
          if (!this.members.some(m => m.id === c.id)) {
            this.members.push(new Member(c));
          }
        });
      }
    } catch (e) {
      console.warn("Gagal memuat anggota kustom:", e);
    }

    // 2. Status Autentikasi Sesi (Pengurus vs Member)
    this.authView = new AuthView();
    this.authSession = null;
    try {
      const savedAuth = localStorage.getItem("simhalal_auth_session");
      if (savedAuth) {
        this.authSession = JSON.parse(savedAuth);
      }
    } catch (e) {
      console.warn("Gagal membaca auth session:", e);
    }

    this.selectedMemberId = (this.authSession?.role === "member" && this.authSession.memberId)
      ? this.authSession.memberId
      : "FTY-001";

    // 3. State Filter & Pencarian
    this.filterCategory = "ALL";
    this.filterStatus = "ALL";
    this.searchQuery = "";

    // 4. Inisialisasi Services & Views
    this.chartService = new ChartService();
    this.uiManager = new UIManager();
    this.summaryView = new ExecutiveSummaryView();
    this.detailView = new MemberDetailView();
  }

  /**
   * Bootstrapping aplikasi saat halaman siap
   */
  init() {
    // Jalankan kalkulasi awal untuk memastikan konsistensi skor semua anggota
    this.members.forEach(m => AuditCalculator.calculate(m));

    // Bind event kontrol filter global
    this.uiManager.bindFilterListeners({
      onCategoryChange: (cat) => this.handleCategoryFilterChange(cat),
      onStatusChange: (status) => this.handleStatusFilterChange(status),
      onSearch: (query) => this.handleSearchQueryChange(query),
      onReset: () => this.handleResetFilter()
    });

    // Bind klik interaktif pada 4 Kartu KPI (Fitur Modal List & Cetak Berkas)
    this.summaryView.bindKPIClicks((statusType) => {
      this.handleOpenGroupModal(statusType);
    });

    // Cek status autentikasi: Jika belum login, tampilkan halaman Masuk/Daftar
    if (!this.authSession) {
      this.renderAuth();
    } else {
      this.applyAuthSession();
    }
  }

  // ===================== AUTENTIKASI & KONTROL AKSES =====================

  /**
   * Menampilkan halaman login dan menyembunyikan dashboard
   */
  renderAuth() {
    this.authView.render(this.members, {
      onLogin: (sessionData) => this.login(sessionData),
      onRegister: (memberData) => this.registerNewMember(memberData)
    });
  }

  /**
   * Menangani aksi login sukses
   * @param {Object} sessionData - { role, memberId, userName, businessName }
   */
  login(sessionData) {
    this.authSession = sessionData;
    try {
      localStorage.setItem("simhalal_auth_session", JSON.stringify(sessionData));
    } catch (e) {
      console.warn("Gagal menyimpan auth session:", e);
    }
    this.applyAuthSession();
  }

  /**
   * Menangani aksi logout dan kembali ke halaman login
   */
  logout() {
    this.authSession = null;
    try {
      localStorage.removeItem("simhalal_auth_session");
    } catch (e) {}
    this.renderAuth();
  }

  /**
   * Mendaftarkan anggota UMKM baru dari formulir registrasi
   * @param {Object} memberData 
   */
  registerNewMember(memberData) {
    const newM = new Member(memberData);
    AuditCalculator.calculate(newM);
    this.members.push(newM);

    try {
      let list = [];
      const stored = localStorage.getItem("simhalal_custom_members");
      if (stored) list = JSON.parse(stored);
      list.push(memberData);
      localStorage.setItem("simhalal_custom_members", JSON.stringify(list));
    } catch (e) {
      console.warn("Gagal menyimpan custom member:", e);
    }
  }

  /**
   * Menerapkan aturan tampilan antarmuka berdasarkan peran (Role)
   */
  applyAuthSession() {
    if (!this.authSession) {
      this.renderAuth();
      return;
    }

    this.authView.hide();

    const headerStatus = document.getElementById("headerAuthStatus");
    const logoutBtn = document.getElementById("headerLogoutBtn");
    const tabSummaryBtn = document.getElementById("tabSummaryBtn");
    const memberSelect = document.getElementById("memberSelect");
    const globalFilterSection = document.getElementById("globalFilterSection");

    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }

    if (this.authSession.role === "member") {
      // =======================================================================
      // PERAN 1: PELAKU USAHA (USER PESERTA / MEMBER UMKM)
      // Aturan:
      // - Hanya bisa melihat Tab 2 (Dashboard Mandiri).
      // - TIDAK BISA KLIK DROPDOWN nama-nama pelaku usaha di pojok kanan atas!
      // =======================================================================
      this.selectedMemberId = this.authSession.memberId || "FTY-001";

      // 1. Status Badge di Header
      if (headerStatus) {
        headerStatus.innerHTML = `
          <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 shadow-sm" title="Profil Anda Terkunci">
            <svg class="w-4 h-4 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <div class="text-left leading-tight">
              <span class="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Akun Pelaku Usaha</span>
              <span class="text-xs font-black text-nu-900 truncate max-w-[150px] sm:max-w-none block">${this.activeMember.nama} &bull; ${this.activeMember.usaha}</span>
            </div>
          </div>
        `;
      }

      // 2. Sembunyikan Tombol Tab 1 (Ringkasan Pengurus)
      if (tabSummaryBtn) {
        tabSummaryBtn.classList.add("hidden");
      }

      // 3. Alihkan langsung ke Tab 2 (Dashboard Mandiri)
      this.uiManager.switchTab("detail");

      // 4. DROPDOWN TERKUNCI PERMANEN: Member tidak bisa memilih usaha lain!
      if (memberSelect) {
        memberSelect.disabled = true;
        memberSelect.classList.add("opacity-70", "cursor-not-allowed", "bg-slate-200");
        memberSelect.title = "Akun Anda terkunci pada profil usaha Anda sendiri";
      }

      // 5. Sembunyikan bilah filter global pengurus
      if (globalFilterSection) {
        globalFilterSection.classList.add("hidden");
      }

    } else {
      // =======================================================================
      // PERAN 2: PENGURUS FATAYAT NU (ADMIN / AKSES PENUH)
      // Aturan:
      // - Bisa masuk di tampilan keseluruhan (Tab 1 & Tab 2).
      // - Bisa bebas memilih dropdown seluruh nama anggota.
      // =======================================================================
      if (headerStatus) {
        headerStatus.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
            <svg class="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span class="font-extrabold">Pengurus Fatayat NU (Akses Penuh)</span>
          </span>
        `;
      }

      if (tabSummaryBtn) {
        tabSummaryBtn.classList.remove("hidden");
      }

      if (memberSelect) {
        memberSelect.disabled = false;
        memberSelect.classList.remove("opacity-70", "cursor-not-allowed", "bg-slate-200");
        memberSelect.title = "Pilih anggota UMKM";
      }

      if (globalFilterSection) {
        globalFilterSection.classList.remove("hidden");
      }
    }

    // Jalankan pipeline filter dan render view
    this.applyFilters();
  }

  // ===================== STATE & SELECTION =====================

  /**
   * Mengambil objek anggota yang sedang aktif dipilih
   * @returns {Member}
   */
  get activeMember() {
    return this.members.find(m => m.id === this.selectedMemberId) || this.members[0];
  }

  /**
   * Memilih anggota berdasarkan ID
   * @param {string} memberId 
   * @param {boolean} shouldSwitchTab - Apakah otomatis beralih ke Tab Detail
   */
  selectMember(memberId, shouldSwitchTab = false) {
    // Jika login sebagai member, abaikan permintaan berpindah ke akun orang lain!
    if (this.authSession && this.authSession.role === "member") {
      if (this.authSession.memberId) {
        memberId = this.authSession.memberId;
      }
    }

    this.selectedMemberId = memberId;

    // Sinkronisasi nilai dropdown header
    const selectElem = document.getElementById("memberSelect");
    if (selectElem && selectElem.value !== memberId) {
      selectElem.value = memberId;
    }

    // Render ulang detail view
    this.renderDetail();

    if (shouldSwitchTab) {
      this.uiManager.switchTab("detail");
      this.uiManager.scrollToAuditSection();
    }
  }

  // ===================== MUTASI DATA & INTERAKSI AUDIT =====================

  /**
   * Menangani aksi toggle butir kriteria audit pada pilar
   * @param {string} criterionKey 
   */
  handleToggleCriterion(criterionKey) {
    const member = this.activeMember;
    if (!member) return;

    // 1. Mutasi nilai kriteria pada domain model
    member.toggleCriterion(criterionKey);

    // 2. Hitung ulang skor terbobot dan status kelayakan
    AuditCalculator.calculate(member);

    // 3. Render ulang tampilan detail dan ringkasan terfilter
    this.renderDetail();
    this.applyFilters();

    // 4. Efek perayaan jika mencapai skor 100%
    if (member.skor === 100) {
      this.uiManager.celebrate100Score();
    }
  }

  // ===================== MODAL DRILLDOWN & CETAK GRUP =====================

  /**
   * Membuka modal daftar anggota saat kartu KPI diklik
   * @param {string} statusType - "ALL", "Siap Daftar", "Perlu Pendampingan", "Belum Siap"
   */
  handleOpenGroupModal(statusType) {
    // Member tidak memiliki akses membuka modal drilldown pengurus
    if (this.authSession && this.authSession.role === "member") return;

    let list = this.members;
    
    // Jika ada filter kategori aktif, terapkan pada kelompok
    if (this.filterCategory !== "ALL") {
      list = list.filter(m => m.kategori === this.filterCategory);
    }

    // Filter berdasarkan status kartu yang diklik
    if (statusType !== "ALL") {
      list = list.filter(m => m.status === statusType);
    }

    this.summaryView.openGroupModal(statusType, list, {
      onSelectMember: (id) => this.selectMember(id, true),
      onPrintGroup: (status, membersList) => this.handlePrintGroupReport(status, membersList)
    });
  }

  /**
   * Menangani aksi cetak berkas rekapitulasi anggota per status (PDF/Print Out)
   * @param {string} statusType 
   * @param {Member[]} membersList 
   */
  handlePrintGroupReport(statusType, membersList) {
    if (this.authSession && this.authSession.role === "member") return;
    PrintService.printGroupReport(statusType, membersList, {
      category: this.filterCategory,
      query: this.searchQuery
    });
  }

  // ===================== PRINT INDIVIDUAL & WHATSAPP =====================

  handlePrintReport() {
    PrintService.printAuditReport(this.activeMember);
  }

  handleSendWhatsApp() {
    WhatsAppService.sendReminder(this.activeMember);
  }

  // ===================== FILTER & PENCARIAN REAKTIF =====================

  handleCategoryFilterChange(category) {
    this.filterCategory = category;
    this.applyFilters();
  }

  handleStatusFilterChange(status) {
    this.filterStatus = status;
    this.applyFilters();
  }

  handleSearchQueryChange(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  handleResetFilter() {
    this.filterCategory = "ALL";
    this.filterStatus = "ALL";
    this.searchQuery = "";
    if (this.authSession?.role !== "member") {
      this.selectedMemberId = "FTY-001";
    }

    const catSelect = document.getElementById("categoryFilter");
    const statusSelect = document.getElementById("statusFilter");
    const searchInput = document.getElementById("tableSearchInput");

    if (catSelect) catSelect.value = "ALL";
    if (statusSelect) statusSelect.value = "ALL";
    if (searchInput) searchInput.value = "";

    this.applyFilters();
  }

  /**
   * Mengambil array anggota yang lolos filter kategori, status, dan search query
   * @returns {Member[]}
   */
  getFilteredMembers() {
    return this.members.filter(m => {
      const matchCat = (this.filterCategory === "ALL" || m.kategori === this.filterCategory);
      const matchStatus = (this.filterStatus === "ALL" || m.status === this.filterStatus);
      const matchSearch = (!this.searchQuery ||
        m.nama.toLowerCase().includes(this.searchQuery) ||
        m.usaha.toLowerCase().includes(this.searchQuery) ||
        m.nib.toLowerCase().includes(this.searchQuery) ||
        m.id.toLowerCase().includes(this.searchQuery)
      );
      return matchCat && matchStatus && matchSearch;
    });
  }

  // ===================== RENDERING PIPELINE =====================

  /**
   * Eksekusi alur filtering reaktif lengkap
   */
  applyFilters() {
    const filtered = this.getFilteredMembers();

    // 1. Update 4 KPI Cards dengan data terfilter
    const aggregates = AuditCalculator.computeAggregates(filtered);
    this.summaryView.renderKPIs(
      aggregates, 
      this.filterCategory, 
      this.filterStatus, 
      this.members.length
    );

    // 2. Update Analisis Titik Hambatan (Bottlenecks)
    const bottlenecks = AuditCalculator.computeBottlenecks(filtered);
    this.summaryView.renderBottlenecks(bottlenecks);

    // 3. Update Dropdown Anggota (sinkron dengan filter yang dipilih)
    const dropdownList = filtered.length > 0 ? filtered : this.members;
    this.selectedMemberId = this.uiManager.populateMemberDropdown(
      dropdownList,
      this.selectedMemberId,
      (id) => this.selectMember(id, false)
    );

    // Jika user adalah member, pastikan dropdown selalu disabled
    const memberSelect = document.getElementById("memberSelect");
    if (this.authSession?.role === "member" && memberSelect) {
      memberSelect.disabled = true;
      memberSelect.classList.add("opacity-70", "cursor-not-allowed", "bg-slate-200");
    }

    // 4. Update Tabel Data Master
    this.summaryView.renderTable(filtered, (id) => {
      this.selectMember(id, true);
    });

    // 5. Update Diagram Donut Kategori (highlight kategori yang aktif)
    this.chartService.renderCategoryDonut(
      "categoryChartCanvas",
      "chartContainer",
      window.SimHalalData.categories,
      this.filterCategory
    );

    // 6. Tampilkan Banner Visual Pill Filter Aktif
    this.uiManager.renderActiveFilterBanner(
      this.filterCategory,
      this.filterStatus,
      this.searchQuery,
      filtered.length,
      this.members.length,
      {
        onClearCategory: () => {
          const select = document.getElementById("categoryFilter");
          if (select) select.value = "ALL";
          this.handleCategoryFilterChange("ALL");
        },
        onClearStatus: () => {
          const select = document.getElementById("statusFilter");
          if (select) select.value = "ALL";
          this.handleStatusFilterChange("ALL");
        },
        onClearQuery: () => {
          const input = document.getElementById("tableSearchInput");
          if (input) input.value = "";
          this.handleSearchQueryChange("");
        },
        onResetAll: () => this.handleResetFilter()
      }
    );

    // 7. Update Detail View
    this.renderDetail();
  }

  /**
   * Merender Tab 2: Dashboard Mandiri Anggota
   */
  renderDetail() {
    this.detailView.render(this.activeMember, {
      onToggleCriterion: (key) => this.handleToggleCriterion(key),
      onPrint: () => this.handlePrintReport(),
      onSendWhatsApp: () => this.handleSendWhatsApp()
    });
  }
}

// Export ke namespace global
window.SimHalalApp = SimHalalApp;

// Inisialisasi Aplikasi Saat Seluruh DOM Siap
document.addEventListener("DOMContentLoaded", () => {
  window.simHalalApp = new SimHalalApp();
  window.simHalalApp.init();
});

// Helper Navigasi Global untuk tombol tab pada HTML
function switchTab(tabName) {
  // Jika sedang login sebagai member, blokir akses ke Tab 1 (summary)
  if (window.simHalalApp && window.simHalalApp.authSession?.role === "member" && tabName === "summary") {
    return;
  }
  if (window.simHalalApp && window.simHalalApp.uiManager) {
    window.simHalalApp.uiManager.switchTab(tabName);
  }
}
