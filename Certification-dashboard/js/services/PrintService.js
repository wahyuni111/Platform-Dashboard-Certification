/**
 * =============================================================================
 * SERVICE: PRINT SERVICE
 * =============================================================================
 * Menangani penyiapan tata letak cetak dokumen resmi berstandar A4 PDF:
 * 1. Lembar Hasil Audit Kesiapan Per Anggota (Dashboard Mandiri)
 * 2. Berkas Rekapitulasi Pelaku Usaha per Kelompok Status ("Siap Daftar",
 *    "Perlu Pendampingan", "Belum Siap", atau "Total Terdata")
 * Dilengkapi kop surat resmi PR Fatayat NU Desa Mersi & kolom pengesahan 3 pihak.
 */

// Resolusi Dependensi
const AuditPillars = window.AuditPillars;

class PrintService {
  /**
   * Menyiapkan data pada DOM print template individual dan memanggil dialog cetak browser
   * @param {Member} member 
   */
  static printAuditReport(member) {
    if (!member) return;

    // Pastikan mode cetak group dinonaktifkan
    document.body.classList.remove("printing-group");

    // 1. Isi Profil Anggota & Usaha
    this._setText("printId", member.id);
    this._setText("printCategory", member.kategori);
    this._setText("printOwner", member.nama);
    this._setText("printBrand", member.usaha);
    this._setText("printNib", member.nib);
    this._setText("printStatus", `${member.status.toUpperCase()} (${member.skor}%)`);
    this._setText("printAddress", member.alamat);
    this._setText("printSignOwner", member.nama);

    // 2. Isi Tabel 18 Indikator SJPH
    const printTbody = document.getElementById("printChecklistBody");
    if (printTbody) {
      printTbody.innerHTML = "";
      const criteriaList = AuditPillars.getFlatCriteriaList(member);

      criteriaList.forEach(c => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-300";
        tr.innerHTML = `
          <td class="p-1 text-center border-r border-slate-300 font-mono">${c.no}</td>
          <td class="p-1 border-r border-slate-300">${c.title}</td>
          <td class="p-1 text-center border-r border-slate-300 font-medium text-[10px]">${c.pilar}</td>
          <td class="p-1 text-center font-bold ${c.passed ? 'text-emerald-700 bg-emerald-50/50' : 'text-red-600 bg-red-50/50'}">
            ${c.passed ? '[ V ] MEMENUHI' : '[ X ] KURANG'}
          </td>
        `;
        printTbody.appendChild(tr);
      });
    }

    // 3. Isi Daftar Catatan Rekomendasi
    const actionOl = document.getElementById("printActionList");
    if (actionOl) {
      actionOl.innerHTML = "";
      if (member.hambatan.length === 0) {
        actionOl.innerHTML = `<li class="text-emerald-800 font-semibold">Seluruh butir dokumen telah lengkap (Skor ${member.skor}%). Pelaku usaha SIAP diajukan proses fatwa halal di sistem SIHALAL BPJPH.</li>`;
      } else {
        member.hambatan.forEach(h => {
          const li = document.createElement("li");
          li.textContent = h;
          actionOl.appendChild(li);
        });
      }
    }

    // 4. Trigger print
    window.print();
  }

  /**
   * Menyiapkan lembar cetak rekapitulasi kelompok status ("Siap Daftar", "Pendampingan", dll)
   * @param {string} statusType - "ALL", "Siap Daftar", "Perlu Pendampingan", "Belum Siap"
   * @param {Member[]} membersList - Array objek Member
   * @param {Object} meta - { category, query }
   */
  static printGroupReport(statusType, membersList = [], meta = {}) {
    // Aktifkan mode print kelompok pada CSS
    document.body.classList.add("printing-group");

    // 1. Tentukan Judul Berdasarkan Status
    let groupTitle = "BERKAS REKAPITULASI SELURUH ANGGOTA PELAKU USAHA";
    let groupNote = "Daftar monitoring komprehensif seluruh anggota pelaku usaha terdata.";

    if (statusType === "Siap Daftar") {
      groupTitle = "BERKAS REKAPITULASI PELAKU USAHA: SIAP DAFTAR SERTIFIKASI HALAL (SKOR ≥ 80%)";
      groupNote = "Daftar anggota yang telah memenuhi syarat SJPH BPJPH dan siap diajukan penerbitan Sertifikat Halal Self-Declare.";
    } else if (statusType === "Perlu Pendampingan") {
      groupTitle = "BERKAS REKAPITULASI PELAKU USAHA: AGENDA PRIORITAS PENDAMPINGAN PPH (SKOR 50-79%)";
      groupNote = "Daftar anggota yang memerlukan pendampingan pengurusan NIB, manual SJPH, dan bukti halal bahan kritis.";
    } else if (statusType === "Belum Siap") {
      groupTitle = "BERKAS REKAPITULASI PELAKU USAHA: TARGET FASILITASI DOKUMEN & LEGALITAS DASAR (SKOR < 50%)";
      groupNote = "Daftar anggota yang menjadi prioritas pembuatan NIB OSS-RBA dan edukasi higienitas dasar di Balai Desa.";
    }

    this._setText("printGroupTitle", groupTitle);
    this._setText("printGroupNote", groupNote);
    this._setText("printGroupTotalCount", `${membersList.length} Pelaku Usaha`);

    // Tanggal Cetak Indonesia
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = now.toLocaleDateString('id-ID', options);
    this._setText("printGroupPrintDate", dateFormatted);

    // Filter Kategori Info
    const catText = meta.category && meta.category !== "ALL" ? meta.category : "Semua Kategori";
    this._setText("printGroupCategoryFilter", catText);

    // 2. Isi Tabel Anggota
    const tbody = document.getElementById("printGroupTableBody");
    if (tbody) {
      tbody.innerHTML = "";

      if (membersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-3 text-center text-slate-500">Tidak ada data pelaku usaha pada kelompok ini.</td></tr>`;
      } else {
        membersList.forEach((m, idx) => {
          const tr = document.createElement("tr");
          tr.className = "border-b border-slate-300 text-[10px]";

          let statusBadgeClass = "text-emerald-700 font-bold";
          if (m.skor < 50) statusBadgeClass = "text-red-600 font-bold";
          else if (m.skor < 80) statusBadgeClass = "text-amber-700 font-bold";

          const catatan = m.hambatan.length === 0 
            ? "Berkas Lengkap 100% (Siap Submit SIHALAL)"
            : m.hambatan.slice(0, 2).join("; ") + (m.hambatan.length > 2 ? ` (+${m.hambatan.length - 2} berkas)` : "");

          tr.innerHTML = `
            <td class="p-1.5 text-center border-r border-slate-300 font-mono">${idx + 1}</td>
            <td class="p-1.5 border-r border-slate-300 font-mono">${m.id}</td>
            <td class="p-1.5 border-r border-slate-300">
              <div class="font-bold text-slate-900">${m.nama}</div>
              <div class="text-[9px] text-slate-500">${m.alamat}</div>
            </td>
            <td class="p-1.5 border-r border-slate-300">
              <div class="font-semibold text-slate-800">${m.usaha}</div>
              <div class="text-[9px] text-slate-500">${m.kategori}</div>
            </td>
            <td class="p-1.5 text-center border-r border-slate-300 font-mono">${m.nib}</td>
            <td class="p-1.5 text-center border-r border-slate-300 ${statusBadgeClass}">${m.skor}%</td>
            <td class="p-1.5 text-slate-700">${catatan}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // 3. Jalankan dialog cetak browser
    window.print();

    // 4. Bersihkan class setelah print
    setTimeout(() => {
      document.body.classList.remove("printing-group");
    }, 1200);
  }

  static _setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }
}

// Export ke namespace global
window.PrintService = PrintService;
