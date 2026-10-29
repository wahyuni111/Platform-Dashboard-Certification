/**
 * =============================================================================
 * UI VIEW: UI MANAGER
 * =============================================================================
 * Menangani interaksi antarmuka pengguna:
 * - Tab switching antara "Ringkasan Pengurus" dan "Cek Detail Berkas Anggota"
 * - Pengelolaan sinkronisasi dropdown anggota (responsif terhadap filter aktif)
 * - Banner indikator visual status filter aktif
 * - Penanganan toggle filter drawer pada mobile
 * - Efek perayaan perolehan skor sempurna (Canvas Confetti)
 */

class UIManager {
  constructor() {
    this.tabSummaryBtn = document.getElementById("tabSummaryBtn");
    this.tabDetailBtn = document.getElementById("tabDetailBtn");
    this.tabSummaryContent = document.getElementById("tabSummaryContent");
    this.tabDetailContent = document.getElementById("tabDetailContent");
    this.mobileFilterContainer = document.getElementById("filterContainer");
    this.activeFilterBar = document.getElementById("activeFilterBanner");
    this.activeTab = "summary";
  }

  /**
   * Mengganti mode tampilan antara Tab 1 dan Tab 2
   * @param {"summary"|"detail"} targetTab 
   */
  switchTab(targetTab) {
    this.activeTab = targetTab;

    if (targetTab === "summary") {
      this.tabSummaryBtn.className = "flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all btn-press shadow-sm bg-gradient-to-r from-nu-800 to-nu-700 text-white shadow-nu-900/20";
      this.tabDetailBtn.className = "flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all btn-press bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm";
      this.tabSummaryContent.classList.remove("hidden");
      this.tabDetailContent.classList.add("hidden");
    } else {
      this.tabDetailBtn.className = "flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all btn-press shadow-sm bg-gradient-to-r from-nu-800 to-nu-700 text-white shadow-nu-900/20";
      this.tabSummaryBtn.className = "flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all btn-press bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm";
      this.tabDetailContent.classList.remove("hidden");
      this.tabSummaryContent.classList.add("hidden");
    }
  }

  /**
   * Mengisi pilihan dropdown daftar anggota di header (responsif terhadap filter kategori & status)
   * @param {Member[]} members - Daftar anggota aktif terfilter
   * @param {string} selectedId - ID anggota yang sedang aktif
   * @param {Function} onChangeCallback - Callback jika pengguna memilih anggota
   * @returns {string} ID anggota yang akhirnya terpilih
   */
  populateMemberDropdown(members, selectedId, onChangeCallback) {
    const select = document.getElementById("memberSelect");
    if (!select) return selectedId;

    select.innerHTML = "";

    if (members.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-- Tidak ada anggota pada kriteria ini --";
      select.appendChild(opt);
      return "";
    }

    // Cek apakah selectedId saat ini ada di dalam daftar yang terfilter
    let targetId = selectedId;
    const exists = members.some(m => m.id === selectedId);
    if (!exists) {
      targetId = members[0].id; // Fallback otomatis ke anggota pertama dari kategori tersebut
    }

    members.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.id} - ${m.nama} (${m.usaha})`;
      if (m.id === targetId) opt.selected = true;
      select.appendChild(opt);
    });

    select.value = targetId;

    select.onchange = (e) => {
      if (typeof onChangeCallback === "function" && e.target.value) {
        onChangeCallback(e.target.value);
      }
    };

    return targetId;
  }

  /**
   * Menampilkan banner visual pill status filter aktif
   * @param {string} category 
   * @param {string} status 
   * @param {string} query 
   * @param {number} filteredCount 
   * @param {number} totalCount 
   * @param {Object} clearHandlers - { onClearCategory, onClearStatus, onClearQuery, onResetAll }
   */
  renderActiveFilterBanner(category, status, query, filteredCount, totalCount, clearHandlers = {}) {
    const banner = document.getElementById("activeFilterBanner");
    if (!banner) return;

    const isFiltered = (category !== "ALL" || status !== "ALL" || query.length > 0);

    if (!isFiltered) {
      banner.classList.add("hidden");
      banner.innerHTML = "";
      return;
    }

    banner.classList.remove("hidden");
    let pillsHtml = `<div class="flex flex-wrap items-center gap-2 py-2 text-xs">`;
    pillsHtml += `<span class="font-bold text-nu-900 flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-nu-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>Filter Aktif:</span>`;

    if (category !== "ALL") {
      pillsHtml += `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
          Kategori: ${category}
          <button type="button" id="clearCatPill" class="ml-1 text-emerald-700 hover:text-emerald-950 font-black" title="Hapus filter kategori">&times;</button>
        </span>
      `;
    }

    if (status !== "ALL") {
      pillsHtml += `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-300">
          Status: ${status}
          <button type="button" id="clearStatusPill" class="ml-1 text-amber-700 hover:text-amber-950 font-black" title="Hapus filter status">&times;</button>
        </span>
      `;
    }

    if (query.length > 0) {
      pillsHtml += `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold border border-blue-300">
          Pencarian: "${query}"
          <button type="button" id="clearQueryPill" class="ml-1 text-blue-700 hover:text-blue-950 font-black" title="Hapus pencarian">&times;</button>
        </span>
      `;
    }

    pillsHtml += `
      <span class="text-slate-500 font-medium">(${filteredCount} dari ${totalCount} UMKM)</span>
      <button type="button" id="resetAllPill" class="ml-auto text-xs font-bold text-red-600 hover:text-red-800 underline">Reset Semua</button>
    </div>`;

    banner.innerHTML = pillsHtml;

    // Pasang listeners untuk tombol clear pill
    const btnCat = document.getElementById("clearCatPill");
    if (btnCat && clearHandlers.onClearCategory) {
      btnCat.onclick = clearHandlers.onClearCategory;
    }
    const btnStat = document.getElementById("clearStatusPill");
    if (btnStat && clearHandlers.onClearStatus) {
      btnStat.onclick = clearHandlers.onClearStatus;
    }
    const btnQ = document.getElementById("clearQueryPill");
    if (btnQ && clearHandlers.onClearQuery) {
      btnQ.onclick = clearHandlers.onClearQuery;
    }
    const btnReset = document.getElementById("resetAllPill");
    if (btnReset && clearHandlers.onResetAll) {
      btnReset.onclick = clearHandlers.onResetAll;
    }
  }

  /**
   * Memasang listener ke kontrol filter global
   * @param {Object} handlers - { onCategoryChange, onStatusChange, onSearch, onReset }
   */
  bindFilterListeners(handlers = {}) {
    // 1. Mobile Filter Toggle
    const mobileToggleBtn = document.getElementById("mobileFilterToggleBtn");
    if (mobileToggleBtn && this.mobileFilterContainer) {
      mobileToggleBtn.addEventListener("click", () => {
        this.mobileFilterContainer.classList.toggle("hidden");
      });
    }

    // 2. Kategori Filter
    const catSelect = document.getElementById("categoryFilter");
    if (catSelect && handlers.onCategoryChange) {
      catSelect.addEventListener("change", (e) => handlers.onCategoryChange(e.target.value));
    }

    // 3. Status Filter
    const statusSelect = document.getElementById("statusFilter");
    if (statusSelect && handlers.onStatusChange) {
      statusSelect.addEventListener("change", (e) => handlers.onStatusChange(e.target.value));
    }

    // 4. Reset Filter
    const resetBtn = document.getElementById("resetFilterBtn");
    if (resetBtn && handlers.onReset) {
      resetBtn.addEventListener("click", handlers.onReset);
    }

    // 5. Search Bar
    const searchInput = document.getElementById("tableSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchInput && handlers.onSearch) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value;
        if (clearSearchBtn) {
          if (val.trim().length > 0) clearSearchBtn.classList.remove("hidden");
          else clearSearchBtn.classList.add("hidden");
        }
        handlers.onSearch(val);
      });
    }
    if (clearSearchBtn && searchInput && handlers.onSearch) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.classList.add("hidden");
        handlers.onSearch("");
      });
    }
  }

  /**
   * Memicu efek perayaan saat skor 100%
   */
  celebrate100Score() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
  }

  /**
   * Scroll halus ke area audit
   */
  scrollToAuditSection() {
    window.scrollTo({ top: 110, behavior: "smooth" });
  }
}

// Export ke namespace global
window.UIManager = UIManager;
