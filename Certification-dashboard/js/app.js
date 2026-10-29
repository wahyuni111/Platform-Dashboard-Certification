/**
 * =============================================================================
 * APPLICATION CONTROLLER: SIM-HALAL APP (MAIN ORCHESTRATOR)
 * =============================================================================
 * Kelas utama pengontrol aplikasi yang menerapkan prinsip OOP:
 * - Centralized State Management (State Anggota, Filter, Modal, dan Tab).
 * - Menghubungkan alur event antara User Interface dan Business Logic.
 * - Reactive Filtering: Saat filter kategori/status diubah, seluruh komponen
 *   (4 KPI Cards, Bottlenecks, Dropdown Anggota, Tabel Master, Chart) terupdate dinamis!
 * - Drilldown Modal & Cetak Berkas Rekapitulasi per Status ("Siap Daftar", dll)
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

class SimHalalApp {
  constructor() {
    // 1. Inisialisasi Data Layer ke Entity Models
    const rawData = window.SimHalalData.getMembers();
    this.members = rawData.map(raw => new Member(raw));
    this.selectedMemberId = "FTY-001";

    // 2. State Filter & Pencarian
    this.filterCategory = "ALL";
    this.filterStatus = "ALL";
    this.searchQuery = "";

    // 3. Inisialisasi Services
    this.chartService = new ChartService();

    // 4. Inisialisasi UI Views
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

    // Jalankan pipeline filter pertama kali (memuat seluruh data & komponen)
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
    this.selectedMemberId = "FTY-001";

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
   * Eksekusi alur filtering reaktif lengkap:
   * 1. Filter anggota
   * 2. Update KPI cards secara dinamis
   * 3. Update Analisis Hambatan (Bottlenecks) secara dinamis
   * 4. Sinkronisasi dropdown daftar anggota (hanya menampilkan anggota kategori tersebut)
   * 5. Update Tabel Master
   * 6. Update Donut Chart
   * 7. Tampilkan Banner Filter Aktif
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
  if (window.simHalalApp && window.simHalalApp.uiManager) {
    window.simHalalApp.uiManager.switchTab(tabName);
  }
}
