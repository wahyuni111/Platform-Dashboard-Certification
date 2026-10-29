/**
 * =============================================================================
 * UI VIEW: EXECUTIVE SUMMARY VIEW (TAB 1)
 * =============================================================================
 * Menangani rendering visual untuk Tab 1 Ringkasan Pengurus:
 * - 4 Kartu Metrik KPI (Responsif terhadap filter aktif & Dapat diklik untuk modal/cetak)
 * - Modal Drilldown Anggota per Status ("Siap Daftar", "Pendampingan", dll)
 * - Analisis Hambatan Utama (Bottlenecks bar responsif terhadap filter)
 * - Tabel Data Master Anggota dengan Live Search
 */

class ExecutiveSummaryView {
  constructor() {
    this.tableBody = document.getElementById("memberTableBody");
    this.tableShowingCount = document.getElementById("tableShowingCount");
    this.bottleneckContainer = document.getElementById("bottleneckContainer");
    
    // Modal Elements
    this.modal = document.getElementById("statusReportModal");
    this.modalTitle = document.getElementById("modalGroupTitle");
    this.modalSubtitle = document.getElementById("modalGroupSubtitle");
    this.modalCount = document.getElementById("modalGroupCount");
    this.modalTableBody = document.getElementById("modalGroupTableBody");
    this.modalCloseBtn = document.getElementById("modalCloseBtn");
    this.modalCloseFooterBtn = document.getElementById("modalCloseFooterBtn");
    this.modalPrintBtn = document.getElementById("modalPrintBtn");
    this.modalSearchInput = document.getElementById("modalSearchInput");
    
    this.currentModalStatus = "ALL";
    this.currentModalMembers = [];
  }

  /**
   * Mengaitkan event klik pada 4 kartu KPI
   * @param {Function} onCardClick - Callback(statusType)
   */
  bindKPIClicks(onCardClick) {
    const cardTotal = document.getElementById("kpiCardTotal");
    const cardReady = document.getElementById("kpiCardReady");
    const cardNeedHelp = document.getElementById("kpiCardNeedHelp");
    const cardNotReady = document.getElementById("kpiCardNotReady");

    if (cardTotal) {
      cardTotal.onclick = () => onCardClick("ALL");
    }
    if (cardReady) {
      cardReady.onclick = () => onCardClick("Siap Daftar");
    }
    if (cardNeedHelp) {
      cardNeedHelp.onclick = () => onCardClick("Perlu Pendampingan");
    }
    if (cardNotReady) {
      cardNotReady.onclick = () => onCardClick("Belum Siap");
    }

    // Modal Close Listeners
    if (this.modalCloseBtn) {
      this.modalCloseBtn.onclick = () => this.closeGroupModal();
    }
    if (this.modalCloseFooterBtn) {
      this.modalCloseFooterBtn.onclick = () => this.closeGroupModal();
    }
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal) this.closeGroupModal();
      };
    }
  }

  /**
   * Membuka modal daftar anggota berdasarkan status terpilih
   * @param {string} statusType - "ALL", "Siap Daftar", "Perlu Pendampingan", "Belum Siap"
   * @param {Member[]} members - Daftar anggota sesuai kelompok status
   * @param {Object} callbacks - { onSelectMember, onPrintGroup }
   */
  openGroupModal(statusType, members = [], callbacks = {}) {
    if (!this.modal) return;

    this.currentModalStatus = statusType;
    this.currentModalMembers = members;
    this.modalCallbacks = callbacks;

    // Reset input pencarian di dalam modal
    if (this.modalSearchInput) {
      this.modalSearchInput.value = "";
      this.modalSearchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = this.currentModalMembers.filter(m => 
          m.nama.toLowerCase().includes(q) ||
          m.usaha.toLowerCase().includes(q) ||
          m.nib.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
        );
        this._renderModalTableRows(filtered, callbacks.onSelectMember);
      };
    }

    // Set Header Modal Berdasarkan Status
    let title = "Daftar Seluruh Anggota Pelaku Usaha";
    let subtitle = "Rekapitulasi lengkap seluruh UMKM anggota Fatayat NU Desa Mersi yang terdata.";
    let badgeClass = "bg-slate-100 text-slate-800 border-slate-300";

    if (statusType === "Siap Daftar") {
      title = "Daftar Pelaku Usaha: Siap Daftar (Skor ≥ 80%)";
      subtitle = "Usaha-usaha berikut telah melengkapi persyaratan dokumen dan siap diajukan untuk audit self-declare BPJPH.";
      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (statusType === "Perlu Pendampingan") {
      title = "Daftar Pelaku Usaha: Perlu Pendampingan (Skor 50-79%)";
      subtitle = "Usaha-usaha berikut masih memerlukan bimbingan teknis berkas (manual SJPH, NIB, atau sertifikat bumbu).";
      badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (statusType === "Belum Siap") {
      title = "Daftar Pelaku Usaha: Belum Siap (Skor < 50%)";
      subtitle = "Usaha-usaha ini menjadi sasaran prioritas pembuatan legalitas dasar NIB OSS-RBA dan sanitasi dapur.";
      badgeClass = "bg-red-100 text-red-800 border-red-300";
    }

    if (this.modalTitle) this.modalTitle.textContent = title;
    if (this.modalSubtitle) this.modalSubtitle.textContent = subtitle;
    if (this.modalCount) {
      this.modalCount.textContent = `${members.length} Usaha`;
      this.modalCount.className = `inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${badgeClass}`;
    }

    // Render baris tabel modal
    this._renderModalTableRows(members, callbacks.onSelectMember);

    // Bind tombol cetak modal
    if (this.modalPrintBtn && callbacks.onPrintGroup) {
      this.modalPrintBtn.onclick = () => {
        callbacks.onPrintGroup(this.currentModalStatus, this.currentModalMembers);
      };
    }

    // Tampilkan modal
    this.modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  closeGroupModal() {
    if (!this.modal) return;
    this.modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  _renderModalTableRows(members, onSelectMember) {
    if (!this.modalTableBody) return;
    this.modalTableBody.innerHTML = "";

    if (members.length === 0) {
      this.modalTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400">
            Tidak ada pelaku usaha yang sesuai dengan kata kunci pencarian.
          </td>
        </tr>
      `;
      return;
    }

    members.forEach((m, idx) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs";

      const style = m.statusBadgeStyle;
      const catatan = m.hambatan.length === 0 
        ? `<span class="text-emerald-700 font-bold flex items-center gap-1"><svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>100% Lengkap (Siap Submit)</span>`
        : `<span class="text-slate-600">${m.hambatan.slice(0, 2).join("; ")}${m.hambatan.length > 2 ? ` (+${m.hambatan.length - 2} catatan)` : ''}</span>`;

      tr.innerHTML = `
        <td class="p-3 text-center font-mono text-slate-400">${idx + 1}</td>
        <td class="p-3">
          <div class="font-bold text-nu-900">${m.nama}</div>
          <div class="text-[10px] font-mono text-slate-400 font-semibold">${m.id} &bull; ${m.alamat}</div>
        </td>
        <td class="p-3">
          <div class="font-semibold text-slate-800">${m.usaha}</div>
          <div class="text-[10px] text-slate-500">${m.kategori}</div>
        </td>
        <td class="p-3 font-mono ${m.hasValidNib ? 'text-slate-700 font-semibold' : 'text-red-500 font-bold'}">
          ${m.nib}
        </td>
        <td class="p-3">
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-slate-800">${m.skor}%</span>
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${style.badge}">${m.status}</span>
          </div>
        </td>
        <td class="p-3">
          <div class="text-[11px] leading-tight max-w-[220px] truncate" title="${m.hambatan.join('; ')}">${catatan}</div>
        </td>
        <td class="p-3 text-right">
          <button type="button" class="btn-goto-mandiri min-h-[34px] px-3 py-1.5 rounded-lg bg-nu-700 hover:bg-nu-800 text-white font-bold text-xs shadow-sm transition-all btn-press inline-flex items-center gap-1">
            <span>Buka Dashboard</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </td>
      `;

      const btn = tr.querySelector(".btn-goto-mandiri");
      if (btn) {
        btn.onclick = () => {
          this.closeGroupModal();
          if (typeof onSelectMember === "function") {
            onSelectMember(m.id);
          }
        };
      }

      this.modalTableBody.appendChild(tr);
    });
  }

  /**
   * Memperbarui angka metrik pada 4 kartu KPI sesuai filter aktif
   * @param {Object} aggregates - { total, ready, readyPct, needHelp, needHelpPct, notReady, notReadyPct }
   * @param {string} activeCategory - Kategori yang dipilih ("ALL", "Kudapan Kering", dll)
   * @param {string} activeStatus - Status yang dipilih ("ALL", "Siap Daftar", dll)
   * @param {number} grandTotal - Total seluruh anggota (45)
   */
  renderKPIs(aggregates, activeCategory = "ALL", activeStatus = "ALL", grandTotal = 45) {
    this._setText("kpiTotal", aggregates.total);
    this._setText("kpiReady", aggregates.ready);
    this._setText("kpiReadyPct", `(${aggregates.readyPct}%)`);
    this._setText("kpiNeedHelp", aggregates.needHelp);
    this._setText("kpiNeedHelpPct", `(${aggregates.needHelpPct}%)`);
    this._setText("kpiNotReady", aggregates.notReady);
    this._setText("kpiNotReadyPct", `(${aggregates.notReadyPct}%)`);
    this._setText("summaryBadgeCount", aggregates.total);

    const subTitleElem = document.getElementById("kpiTotalSubtitle");
    if (subTitleElem) {
      if (activeCategory !== "ALL" || activeStatus !== "ALL") {
        const catLabel = activeCategory !== "ALL" ? activeCategory : "Semua Kategori";
        subTitleElem.innerHTML = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>Terfilter: ${catLabel} (${aggregates.total} dari ${grandTotal})`;
      } else {
        subTitleElem.innerHTML = `<span class="inline-block w-1.5 h-1.5 rounded-full bg-nu-700 mr-1"></span>Fatayat NU Desa Mersi (Semua)`;
      }
    }
  }

  /**
   * Merender bar analisis hambatan (bottleneck) secara dinamis sesuai data anggota yang terfilter
   * @param {Array} bottlenecks 
   */
  renderBottlenecks(bottlenecks = []) {
    const container = document.getElementById("bottleneckBarsList");
    if (!container) return;

    container.innerHTML = "";

    if (bottlenecks.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Tidak ada data hambatan pada kriteria filter ini.</p>`;
      return;
    }

    bottlenecks.forEach(item => {
      const div = document.createElement("div");
      div.className = "transition-all duration-300";
      div.innerHTML = `
        <div class="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${item.dot}"></span>
            ${item.label}
          </span>
          <span class="font-bold text-slate-800">${item.percent}% (${item.count} Usaha)</span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
          <div class="bg-gradient-to-r ${item.barColor} h-3.5 rounded-full transition-all duration-700" style="width: ${item.percent}%;"></div>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">${item.note}</p>
      `;
      container.appendChild(div);
    });
  }

  /**
   * Merender baris-baris pada tabel data master anggota
   * @param {Member[]} members - Daftar anggota yang lolos filter & search
   * @param {Function} onSelectCallback - Callback saat baris/tombol diklik
   */
  renderTable(members, onSelectCallback) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = "";

    if (this.tableShowingCount) {
      this.tableShowingCount.textContent = members.length;
    }

    if (members.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-10 text-slate-400">
            <svg class="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Tidak ada data anggota yang cocok dengan filter / kata kunci pencarian.
          </td>
        </tr>
      `;
      return;
    }

    members.forEach(m => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50/80 transition-colors cursor-pointer group";
      
      tr.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        if (typeof onSelectCallback === "function") onSelectCallback(m.id);
      });

      const style = m.statusBadgeStyle;

      tr.innerHTML = `
        <td class="py-3.5 px-4">
          <div class="font-bold text-nu-900 group-hover:text-nu-700 flex items-center gap-1.5">
            <span>${m.nama}</span>
          </div>
          <div class="text-[11px] font-mono text-slate-400 font-semibold">${m.id}</div>
        </td>
        <td class="py-3.5 px-4">
          <div class="font-semibold text-slate-800">${m.usaha}</div>
          <div class="text-[11px] text-slate-500">${m.kategori}</div>
        </td>
        <td class="py-3.5 px-4 hidden md:table-cell">
          <div class="font-mono text-xs ${m.hasValidNib ? 'text-slate-700 font-semibold' : 'text-red-500 font-bold'}">
            ${m.nib}
          </div>
          <div class="text-[10px] text-slate-400">${m.alamat}</div>
        </td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2">
            <span class="font-black text-xs sm:text-sm text-slate-800 w-8">${m.skor}%</span>
            <div class="w-16 sm:w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="${style.bar} h-2 rounded-full" style="width: ${m.skor}%;"></div>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.badge}">
            ${m.status}
          </span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <button type="button" class="btn-inspect min-h-[36px] px-3 py-1.5 rounded-lg bg-nu-50 hover:bg-nu-700 text-nu-800 hover:text-white text-xs font-bold border border-nu-200 transition-all btn-press shadow-sm inline-flex items-center gap-1">
            <span>Dashboard</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </td>
      `;

      const btnInspect = tr.querySelector(".btn-inspect");
      if (btnInspect) {
        btnInspect.addEventListener("click", () => {
          if (typeof onSelectCallback === "function") onSelectCallback(m.id);
        });
      }

      this.tableBody.appendChild(tr);
    });
  }

  _setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }
}

// Export ke namespace global
window.ExecutiveSummaryView = ExecutiveSummaryView;
