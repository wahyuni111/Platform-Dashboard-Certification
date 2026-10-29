/**
 * =============================================================================
 * UI VIEW: MEMBER DETAIL VIEW (TAB 2 - DASHBOARD MANDIRI ANGGOTA UMKM)
 * =============================================================================
 * Menangani rendering visual untuk Dashboard Mandiri per Anggota:
 * - Header Sambutan Hangat Pelaku Usaha
 * - Profil Usaha & Skor Kesiapan Terbobot
 * - Milestone Tracker "Syarat Sertifikasi Udah Sampe Mana Aja?" (5 Tahapan)
 * - 8 Kartu Tugas Upload Dokumen Asli & Unduh Template (FITUR UTAMA REVISI)
 * - Komparasi Transparan: "Sudah Terlaksana [V]" vs "Belum Terlaksana [X]"
 * - Matriks 4 Pilar Checklist Lengkap (18 Indikator SJPH)
 * - Kotak Rekomendasi Taktis & Integrasi Cetak PDF / WhatsApp
 */

// Resolusi Dependensi
const AuditPillars = window.AuditPillars;

class MemberDetailView {
  constructor() {
    this.scoreAnimationDuration = 600;
  }

  /**
   * Merender seluruh komponen pada Dashboard Mandiri untuk anggota terpilih
   * @param {Member} member 
   * @param {Object} callbacks - { onToggleCriterion, onPrint, onSendWhatsApp }
   */
  render(member, callbacks = {}) {
    if (!member) return;

    this.renderGreetingHeader(member);
    this.renderProfileCard(member);
    this.renderScoreGauge(member);
    this.renderJourneyMilestones(member);
    this.renderDocumentUploadTasks(member, callbacks.onToggleCriterion);
    this.renderCompletedAndPendingSummary(member, callbacks.onToggleCriterion);
    this.renderPillarsMatrix(member, callbacks.onToggleCriterion);
    this.renderActionBox(member, callbacks.onPrint, callbacks.onSendWhatsApp);
  }

  /**
   * Sambutan khusus personal per anggota
   * @param {Member} member 
   */
  renderGreetingHeader(member) {
    this._setText("mandiriGreetingTitle", `Ahlan wa Sahlan, Ibu ${member.nama}!`);
    this._setText("mandiriGreetingSubtitle", `Dashboard Mandiri Kesiapan Audit Halal BPJPH Jalur Self-Declare — ${member.usaha} (${member.kategori})`);
  }

  /**
   * Merender kartu profil dan legalitas usaha
   * @param {Member} member 
   */
  renderProfileCard(member) {
    this._setText("detailBadgeId", member.id);
    this._setText("detailBadgeCategory", member.kategori);
    this._setText("detailAddress", member.alamat);
    this._setText("detailBusinessName", member.usaha);
    this._setText("detailMemberName", member.nama);
    this._setText("detailNib", member.nib);
    this._setText("detailSupervisorName", member.penyelia_nama || "Belum Ditunjuk");
    this._setText("detailPhone", member.formattedPhone);

    const waLink = document.getElementById("detailWaLink");
    if (waLink) {
      waLink.href = `https://wa.me/${member.cleanPhoneForWhatsApp}`;
    }

    const kbliEl = document.getElementById("detailKbli");
    if (kbliEl) {
      if (member.kbli) {
        kbliEl.className = "inline-flex items-center gap-1 font-bold text-emerald-600";
        kbliEl.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Sesuai Bidang Pangan`;
      } else {
        kbliEl.className = "inline-flex items-center gap-1 font-bold text-red-500";
        kbliEl.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> Belum Sesuai`;
      }
    }
  }

  /**
   * Merender skor gauge, badge status, dan menganimasikan bar
   * @param {Member} member 
   */
  renderScoreGauge(member) {
    const scoreNumElem = document.getElementById("detailScoreNumber");
    if (scoreNumElem) {
      const currentVal = parseInt(scoreNumElem.textContent) || 0;
      this._animateScore(scoreNumElem, currentVal, member.skor);
    }

    this._setText("detailBadgeScore", `${member.skor}%`);

    const statusBadge = document.getElementById("detailStatusBadge");
    const progressBar = document.getElementById("detailProgressBar");
    const badgeScoreElem = document.getElementById("detailBadgeScore");
    const style = member.statusBadgeStyle;

    if (statusBadge) {
      statusBadge.textContent = member.status.toUpperCase();
      statusBadge.className = `inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide uppercase border ${style.badge}`;
    }

    if (badgeScoreElem) {
      badgeScoreElem.className = `ml-1 px-2 py-0.5 text-[10px] font-black rounded-full ${style.badge}`;
    }

    if (progressBar && progressBar.style) {
      progressBar.className = `progress-bar-fill h-2.5 rounded-full ${style.bar}`;
      progressBar.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (progressBar && progressBar.style) {
            progressBar.style.width = `${member.skor}%`;
          }
        }, 60);
      });
    }
  }

  /**
   * Merender indikator progres "Syarat Sertifikasi Udah Sampe Mana Aja?" (5 Stepper)
   * @param {Member} member 
   */
  renderJourneyMilestones(member) {
    const container = document.getElementById("journeyMilestonesContainer");
    const summaryText = document.getElementById("journeySummaryText");
    if (!container) return;

    container.innerHTML = "";
    const milestones = member.journeyMilestones;
    const completedCount = milestones.filter(m => m.done).length;

    if (summaryText) {
      if (completedCount === 5) {
        summaryText.innerHTML = `<span class="text-emerald-700 font-extrabold flex items-center gap-1.5"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Hebat! Seluruh 5 tahapan sertifikasi telah tuntas dilalui. Usaha Ibu ${member.nama} siap diajukan ke BPJPH!</span>`;
      } else {
        const nextStep = milestones.find(m => !m.done);
        summaryText.innerHTML = `<span>Progres Sertifikasi: <strong>${completedCount} dari 5 Tahap</strong> Selesai. Langkah berikutnya: <strong class="text-nu-800 underline">${nextStep ? nextStep.title : 'Pengajuan'}</strong>.</span>`;
      }
    }

    milestones.forEach((m, idx) => {
      const stepDiv = document.createElement("div");
      stepDiv.className = "flex-1 relative flex flex-col items-center text-center group";

      let circleClass = "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all duration-300";
      let titleClass = "text-xs font-bold mt-2";
      let descClass = "text-[10px] text-slate-400 hidden sm:block max-w-[120px] truncate";
      let badgeHtml = "";

      if (m.done) {
        circleClass += " bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-700/20";
        titleClass += " text-emerald-800";
        badgeHtml = `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 mt-1 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Lolos [V]</span>`;
      } else {
        const isCurrentActive = (!m.done && (idx === 0 || milestones[idx - 1].done));
        if (isCurrentActive) {
          circleClass += " bg-amber-50 border-amber-500 text-amber-700 ring-4 ring-amber-100 animate-pulse";
          titleClass += " text-amber-800";
          badgeHtml = `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 mt-1 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Sedang Proses</span>`;
        } else {
          circleClass += " bg-slate-100 border-slate-300 text-slate-400";
          titleClass += " text-slate-400";
          badgeHtml = `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 mt-1 rounded text-[9px] font-medium bg-slate-100 text-slate-500">Menunggu</span>`;
        }
      }

      stepDiv.innerHTML = `
        <div class="${circleClass}">
          ${m.done ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>` : m.step}
        </div>
        <div class="${titleClass} leading-tight">${m.title}</div>
        <div class="${descClass}">${m.desc}</div>
        ${badgeHtml}
      `;

      container.appendChild(stepDiv);
    });
  }

  /**
   * =========================================================================
   * DASHBOARD PROGRESS & 8 KARTU PERSYARATAN RESMI HALAL (SIM-HALAL FATAYAT)
   * =========================================================================
   * @param {Member} member 
   * @param {Function} onToggleCriterion 
   */
  renderDocumentUploadTasks(member, onToggleCriterion) {
    const container = document.getElementById("documentUploadTasksContainer");
    if (!container) return;

    const storageKey = `simhalal_uploads_${member.id}`;
    let savedData = { files: {}, email: '', nib: '' };
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        savedData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage:", e);
    }
    // Default seed jika belum ada berkas tersimpan
    if (!savedData.files) savedData.files = {};
    if (member.hasValidNIB && !savedData.files['nib']) {
      savedData.files['nib'] = {
        name: `NIB_OSS_${member.nib}.pdf`,
        formattedSize: '245 KB',
        uploadedAt: 'Tervalidasi OSS',
        type: 'application/pdf'
      };
    }
    if (member.sihalal && !savedData.files['sihalal']) {
      savedData.files['sihalal'] = {
        name: `Screenshot_Akun_SIHALAL_${this._cleanStr(member.nama)}.png`,
        formattedSize: '380 KB',
        uploadedAt: 'Tervalidasi BPJPH',
        type: 'image/png'
      };
    }
    if (member.permohonan && !savedData.files['permohonan']) {
      savedData.files['permohonan'] = {
        name: `Surat_Permohonan_Halal_${this._cleanStr(member.nama)}.pdf`,
        formattedSize: '420 KB',
        uploadedAt: 'Berkas Masuk',
        type: 'application/pdf'
      };
    }
    if (member.manual_sjph && !savedData.files['manual_sjph']) {
      savedData.files['manual_sjph'] = {
        name: `Manual_SJPH_Lengkap_${this._cleanStr(member.usaha)}.docx`,
        formattedSize: '310 KB',
        uploadedAt: 'Berkas Masuk',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    }
    if (member.daftar_bahan && !savedData.files['daftar_bahan']) {
      savedData.files['daftar_bahan'] = {
        name: `Rincian_Bahan_Baku_${this._cleanStr(member.usaha)}.xlsx`,
        formattedSize: '195 KB',
        uploadedAt: 'Berkas Masuk',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    }
    if (member.surat_penyelia && !savedData.files['surat_penyelia']) {
      savedData.files['surat_penyelia'] = {
        name: `SK_Penyelia_${this._cleanStr(member.penyelia_nama || 'Muslim')}.pdf`,
        formattedSize: '512 KB',
        uploadedAt: 'Berkas Masuk',
        type: 'application/pdf'
      };
    }
    if (member.ikrar_materai && !savedData.files['ikrar_materai']) {
      savedData.files['ikrar_materai'] = {
        name: `Ikrar_Bebas_Babi_Materai_${this._cleanStr(member.nama)}.jpg`,
        formattedSize: '780 KB',
        uploadedAt: 'Berkas Masuk',
        type: 'image/jpeg'
      };
    }

    const currentEmail = savedData.email || member.email || `${this._cleanStr(member.nama).toLowerCase()}@gmail.com`;
    const isEmailSaved = Boolean(savedData.email || member.email);
    const hasGmail = savedData.hasGmail !== undefined ? savedData.hasGmail : true;

    const currentNib = member.hasValidNIB ? member.nib : (savedData.nib || '');
    const hasNib = savedData.hasNib !== undefined ? savedData.hasNib : Boolean(member.hasValidNIB);

    // Hitung total terselesaikan
    let completedCount = 0;
    if (isEmailSaved) completedCount++;
    if (savedData.files['nib'] || member.hasValidNIB) completedCount++;
    if (savedData.files['sihalal'] || member.sihalal) completedCount++;
    if (savedData.files['permohonan'] || member.permohonan) completedCount++;
    if (savedData.files['manual_sjph'] || member.manual_sjph) completedCount++;
    if (savedData.files['daftar_bahan'] || member.daftar_bahan) completedCount++;
    if (savedData.files['surat_penyelia'] || member.surat_penyelia) completedCount++;
    if (savedData.files['ikrar_materai'] || member.ikrar_materai) completedCount++;

    const pctComplete = Math.round((completedCount / 8) * 100);

    // Pesan ramah dan menenangkan khas Fatayat NU
    let motivationalMsg = `Mari lengkapi 8 berkas persyaratan sertifikasi halal bersama pendamping Fatayat NU Mersi.`;
    if (completedCount === 8) {
      motivationalMsg = `MasyaAllah Tabarakallah! Seluruh berkas persyaratan sudah 100% lengkap dan siap diverifikasi oleh Auditor Halal.`;
    } else if (completedCount >= 6) {
      motivationalMsg = `Alhamdulillah, berkas Ibu/Bapak sudah siap ${pctComplete}%! Tinggal ${8 - completedCount} langkah lagi siap verifikasi lapangan.`;
    } else if (completedCount >= 3) {
      motivationalMsg = `Bagus sekali! Sudah ${completedCount} dari 8 persyaratan disiapkan. Yuk lanjutkan pengisian dokumen berikutnya.`;
    }

    // Render HTML
    container.innerHTML = `
      <!-- ========================================================================= -->
      <!-- 1. DASHBOARD PROGRESS BERKAS (PENGGANTI BANNER TUGAS 2 MINGGU)             -->
      <!-- ========================================================================= -->
      <div class="bg-gradient-to-br from-white via-nu-50/30 to-emerald-50/40 rounded-3xl border-2 border-nu-200 p-5 sm:p-7 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-nu-100">
          
          <div class="flex items-start gap-4">
            <div class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-nu-800 to-nu-600 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <svg class="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-nu-950 text-[10px] font-black flex items-center justify-center border-2 border-white">
                ${completedCount}
              </span>
            </div>

            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-nu-800 text-white tracking-wide uppercase">
                  Progress Kesiapan Berkas
                </span>
                <span class="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  SIM-HALAL Fatayat NU
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Pusat Dokumen & Kelengkapan Sertifikasi Halal
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed font-medium">
                ${motivationalMsg}
              </p>
            </div>
          </div>

          <!-- Big Progress Counter Box -->
          <div class="flex items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border-2 border-nu-200/80 shadow-sm self-start md:self-auto">
            <div class="text-right">
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Kelengkapan Dokumen:
              </div>
              <div class="text-base sm:text-lg font-black text-nu-900">
                <span class="text-2xl font-mono text-nu-800">${completedCount}</span>
                <span class="text-slate-400 font-mono"> / 8 Selesai</span>
              </div>
            </div>

            <!-- Circular Percentage Meter -->
            <div class="relative w-14 h-14 flex items-center justify-center">
              <svg class="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="5" class="text-slate-100" fill="transparent"/>
                <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="5" stroke-dasharray="150.8" stroke-dashoffset="${150.8 - (150.8 * pctComplete) / 100}" stroke-linecap="round" class="text-nu-700 transition-all duration-700" fill="transparent"/>
              </svg>
              <span class="absolute font-black text-xs sm:text-sm text-nu-900 font-mono">
                ${pctComplete}%
              </span>
            </div>
          </div>

        </div>

        <!-- Visual Progress Bar Strip -->
        <div class="mt-5 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-600">
            <span class="flex items-center gap-1.5 text-nu-900 font-extrabold">
              <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              Alur Pengisian Berkas (Langkah 1 s/d 8)
            </span>
            <span class="text-nu-800 font-mono font-black">${pctComplete}% Terpenuhi</span>
          </div>

          <div class="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5">
            <div class="bg-gradient-to-r from-emerald-600 to-nu-700 h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${pctComplete}%"></div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
            <span class="font-semibold text-nu-800">Langkah 1-3: Akun & Legalitas Dasar</span>
            <span class="hidden sm:inline font-bold text-slate-300">&bull;</span>
            <span class="font-semibold text-nu-800">Langkah 4-8: Surat Persyaratan & Template Halal</span>
            <span class="font-bold text-emerald-700 flex items-center gap-1 ml-auto">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Tersimpan Aman di SIM-HALAL untuk Kunjungan Lapangan
            </span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAHAP 1: AKUN & LEGALITAS DASAR                                           -->
      <!-- 1. Gmail (Ingat Password!) -> 2. NIB OSS -> 3. Akun SIHALAL               -->
      <!-- ========================================================================= -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-nu-800 text-white text-sm font-black flex items-center justify-center shadow-sm">1</span>
            <div>
              <h4 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Tahap 1: Akun & Legalitas Dasar
              </h4>
              <p class="text-xs text-slate-500 font-medium">
                Pastikan email dan perizinan dasar siap sebelum mengurus dokumen halal
              </p>
            </div>
          </div>
          <span class="text-xs font-bold text-nu-800 bg-nu-100 px-3 py-1 rounded-full">Langkah 1 - 3</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <!-- 1. Email Gmail Aktif -->
          <div class="rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${isEmailSaved ? 'bg-emerald-50/50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'}">
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <span class="text-[10px] font-black uppercase text-red-700 tracking-wider">Langkah 1</span>
                    <h5 class="text-sm sm:text-base font-black text-slate-900">Email Gmail Aktif</h5>
                  </div>
                </div>
                ${isEmailSaved ? `
                  <span class="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Siap
                  </span>
                ` : `
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Perlu Diisi</span>
                `}
              </div>

              <!-- Pilihan Sudah/Belum Punya Gmail -->
              <div class="mb-3">
                <span class="block text-xs font-bold text-slate-700 mb-1.5">Apakah Ibu/Bapak sudah memiliki akun Gmail?</span>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" id="btn_toggle_gmail_yes" class="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${hasGmail ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span>Sudah Punya</span>
                  </button>
                  <button type="button" id="btn_toggle_gmail_no" class="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${!hasGmail ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    <span>Belum Punya</span>
                  </button>
                </div>
              </div>

              <!-- KOTAK PERINGATAN PENTING: PASSWORD WAJIB DIINGAT -->
              <div class="p-3 bg-amber-50 rounded-xl border border-amber-300 mb-3 text-amber-950 text-xs leading-relaxed">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  <div>
                    <strong class="font-extrabold text-amber-900 block mb-0.5">⚠️ PENTING: PASSWORD HARUS DIINGAT!</strong>
                    <span>Catat kata sandi/password Gmail di buku catatan Ibu/Bapak. Link aktivasi akun SIHALAL BPJPH akan dikirimkan ke email ini.</span>
                  </div>
                </div>
              </div>

              ${hasGmail ? `
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700">Alamat Gmail Ibu/Bapak:</label>
                  <input type="email" id="input_email_task" value="${currentEmail}" placeholder="contoh: sitiaminah@gmail.com" class="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none transition-all" />
                  <button type="button" id="btn_save_email" class="w-full min-h-[44px] mt-2 px-4 py-2.5 bg-nu-800 hover:bg-nu-900 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-98">
                    <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span>${isEmailSaved ? 'Perbarui Alamat Email' : 'Simpan Email Gmail'}</span>
                  </button>
                </div>
              ` : `
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                  <p class="font-semibold text-slate-800">Belum memiliki akun Gmail?</p>
                  <p>Tenang Bu/Pak, Tim Pendamping PPH Fatayat NU Mersi siap membantu membuatkan akun Gmail resmi gratis saat pendampingan.</p>
                  <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-nu-800 hover:text-nu-900 underline pt-1">
                    <span>Buka Halaman Buat Gmail Baru</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </div>
              `}
            </div>

            ${isEmailSaved ? `
              <div class="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="truncate">Tersimpan: ${currentEmail}</span>
              </div>
            ` : ''}
          </div>

          <!-- 2. NIB Berbasis OSS-RBA -->
          <div class="rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${savedData.files['nib'] || member.hasValidNIB ? 'bg-emerald-50/50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'}">
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  </div>
                  <div>
                    <span class="text-[10px] font-black uppercase text-blue-700 tracking-wider">Langkah 2</span>
                    <h5 class="text-sm sm:text-base font-black text-slate-900">NIB Berbasis OSS-RBA</h5>
                  </div>
                </div>

                ${savedData.files['nib'] || member.hasValidNIB ? `
                  <span class="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Lengkap
                  </span>
                ` : `
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Belum Lengkap</span>
                `}
              </div>

              <!-- Pilihan Sudah/Belum Punya NIB -->
              <div class="mb-3">
                <span class="block text-xs font-bold text-slate-700 mb-1.5">Apakah usaha Ibu/Bapak sudah memiliki NIB?</span>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" id="btn_toggle_nib_yes" class="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${hasNib ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span>Sudah Punya NIB</span>
                  </button>
                  <button type="button" id="btn_toggle_nib_no" class="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${!hasNib ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    <span>Belum Punya NIB</span>
                  </button>
                </div>
              </div>

              ${hasNib ? `
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Nomor NIB (13 Digit Angka):</label>
                    <div class="flex gap-2">
                      <input type="text" id="input_nib_task" maxlength="16" value="${currentNib}" placeholder="1234567890123" class="flex-1 font-mono text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none" />
                      <button type="button" id="btn_save_nib" class="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors active:scale-98">Simpan</button>
                    </div>
                  </div>

                  <!-- Upload Zone -->
                  ${this._renderVanillaUploadZoneHtml('nib', 'Upload Dokumen NIB (PDF/Foto)', savedData.files['nib'] || (member.hasValidNIB ? { name: `NIB_OSS_${member.nib}.pdf`, formattedSize: '245 KB', uploadedAt: 'Tersimpan' } : null))}
                </div>
              ` : `
                <div class="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 leading-relaxed space-y-2">
                  <p class="font-extrabold text-amber-900">Belum Memiliki NIB?</p>
                  <p>Silakan siapkan KTP asli. Kader Pendamping Halal Fatayat NU Desa Mersi akan memfasilitasi pembuatan NIB di portal OSS-RBA secara gratis saat kunjungan.</p>
                  <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline pt-1">
                    <span>Buka Portal Resmi OSS (oss.go.id)</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </div>
              `}
            </div>

            ${savedData.files['nib'] || member.hasValidNIB ? `
              <div class="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="truncate">NIB Terverifikasi: ${currentNib || member.nib}</span>
              </div>
            ` : ''}
          </div>

          <!-- 3. Akun SIHALAL BPJPH -->
          <div class="rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${savedData.files['sihalal'] || member.sihalal ? 'bg-emerald-50/50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'}">
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <span class="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Langkah 3</span>
                    <h5 class="text-sm sm:text-base font-black text-slate-900">Akun SIHALAL BPJPH</h5>
                  </div>
                </div>

                ${savedData.files['sihalal'] || member.sihalal ? `
                  <span class="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Aktif
                  </span>
                ` : `
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Belum Aktif</span>
                `}
              </div>

              <p class="text-xs text-slate-600 mb-3 leading-relaxed">
                Pendaftaran akun di portal resmi BPJPH (ptsp.halal.go.id) menggunakan NIB dan Gmail yang telah tersimpan.
              </p>

              <a href="https://ptsp.halal.go.id" target="_blank" rel="noopener noreferrer" class="w-full min-h-[44px] mb-3 px-4 py-2.5 bg-nu-700 hover:bg-nu-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                <span>Buka Portal SIHALAL BPJPH</span>
              </a>

              <!-- Upload Zone -->
              ${this._renderVanillaUploadZoneHtml('sihalal', 'Upload Bukti Screenshot Akun Aktif', savedData.files['sihalal'] || (member.sihalal ? { name: `Bukti_Akun_SIHALAL_${this._cleanStr(member.nama)}.png`, formattedSize: '380 KB', uploadedAt: 'Tervalidasi BPJPH' } : null))}
            </div>

            ${savedData.files['sihalal'] || member.sihalal ? `
              <div class="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>Akun SIHALAL Terhubung & Aktif</span>
              </div>
            ` : ''}
          </div>

        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAHAP 2: DOKUMEN & SURAT PERSYARATAN RESMI HALAL                          -->
      <!-- 4. Permohonan -> 5. Manual SJPH -> 6. Bahan -> 7. SK Penyelia -> 8. Ikrar -->
      <!-- ========================================================================= -->
      <div class="space-y-4 pt-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-nu-800 text-white text-sm font-black flex items-center justify-center shadow-sm">2</span>
            <div>
              <h4 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Tahap 2: Dokumen & Surat Persyaratan Halal
              </h4>
              <p class="text-xs text-slate-500 font-medium">
                Unduh draf resmi, lengkapi tanda tangan, lalu unggah dokumen/foto aslinya
              </p>
            </div>
          </div>
          <span class="text-xs font-bold text-nu-800 bg-nu-100 px-3 py-1 rounded-full">Langkah 4 - 8</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- 4. Surat Permohonan -->
          ${this._renderVanillaDocumentCard('permohonan', '4', 'Surat Permohonan Sertifikasi Halal', 'Surat pengajuan resmi pelaku usaha yang dibubuhi tanda tangan asli.', savedData.files['permohonan'] || (member.permohonan ? { name: `Surat_Permohonan_${this._cleanStr(member.nama)}.pdf`, formattedSize: '420 KB', uploadedAt: 'Tersimpan' } : null), {
            primaryDlId: 'btn_dl_permohonan_docx',
            primaryDlLabel: 'Unduh Template Word (.docx)',
            secondaryDlId: 'btn_dl_permohonan_pdf',
            secondaryDlLabel: 'Unduh PDF Resmi',
            uploadBtnLabel: 'Upload Surat Permohonan (Bertanda Tangan)'
          })}

          <!-- 5. Dokumen Manual SJPH Lengkap -->
          ${this._renderVanillaDocumentCard('manual_sjph', '5', 'Dokumen Manual SJPH Lengkap', 'Buku komitmen halal, sanitasi dapur, dan pemisahan peralatan produksi.', savedData.files['manual_sjph'] || (member.manual_sjph ? { name: `Manual_SJPH_${this._cleanStr(member.usaha)}.docx`, formattedSize: '310 KB', uploadedAt: 'Tersimpan' } : null), {
            primaryDlId: 'btn_dl_manual_docx',
            primaryDlLabel: 'Unduh Manual SJPH Resmi (.docx)',
            secondaryDlId: 'btn_dl_manual_pdf',
            secondaryDlLabel: 'Unduh Buku Panduan PDF',
            uploadBtnLabel: 'Upload Manual SJPH Terisi'
          })}

          <!-- 6. Tabel Rincian Bahan Baku & Produk -->
          ${this._renderVanillaDocumentCard('daftar_bahan', '6', 'Tabel Rincian Bahan Baku & Produk', 'Daftar bahan baku, bumbu kemasan, minyak, dan sumber air layak konsumsi.', savedData.files['daftar_bahan'] || (member.daftar_bahan ? { name: `Rincian_Bahan_${this._cleanStr(member.usaha)}.xlsx`, formattedSize: '195 KB', uploadedAt: 'Tersimpan' } : null), {
            primaryDlId: 'btn_dl_bahan_csv',
            primaryDlLabel: 'Unduh Template Tabel (.csv / Excel)',
            uploadBtnLabel: 'Upload File / Foto Daftar Bahan Lengkap'
          })}

          <!-- 7. SK Penetapan Penyelia Halal -->
          ${this._renderVanillaDocumentCard('surat_penyelia', '7', 'Surat Penetapan Penyelia Halal', `Surat penunjukan penyelia halal internal (${member.penyelia_nama || 'Muslim'}) bertugas menjaga kehalalan.`, savedData.files['surat_penyelia'] || (member.surat_penyelia ? { name: `SK_Penyelia_${this._cleanStr(member.penyelia_nama || 'Muslim')}.pdf`, formattedSize: '512 KB', uploadedAt: 'Tersimpan' } : null), {
            primaryDlId: 'btn_dl_penyelia_docx',
            primaryDlLabel: 'Unduh Format SK Penyelia (.docx)',
            uploadBtnLabel: 'Upload SK Penyelia + Foto KTP'
          })}

          <!-- 8. Surat Bebas Babi & Ikrar Halal Bermaterai -->
          ${this._renderVanillaDocumentCard('ikrar_materai', '8', 'Surat Bebas Babi & Ikrar Halal', 'Surat pernyataan kehalalan bermaterai asli Rp10.000 bertanda tangan di atas materai.', savedData.files['ikrar_materai'] || (member.ikrar_materai ? { name: `Ikrar_Bebas_Babi_Materai_${this._cleanStr(member.nama)}.jpg`, formattedSize: '780 KB', uploadedAt: 'Tersimpan' } : null), {
            primaryDlId: 'btn_dl_ikrar_doc',
            primaryDlLabel: 'Unduh Draf Pernyataan Bebas Babi (.doc)',
            uploadBtnLabel: 'Upload Foto Surat Bermaterai Rp10.000 Asli'
          })}

        </div>
      </div>
    `;

    // Pasang Event Listeners
    this._attachUploadCardListeners(member, onToggleCriterion, storageKey, savedData);
  }

  _renderVanillaDocumentCard(taskId, stepNum, title, desc, fileData, opts = {}) {
    const isUploaded = Boolean(fileData);
    return `
      <div id="card_task_${taskId}" class="rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${isUploaded ? 'bg-emerald-50/40 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'}">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-nu-800 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                ${stepNum}
              </span>
              <div>
                <span class="text-[10px] font-black uppercase text-nu-700 tracking-wider">Langkah ${stepNum}</span>
                <h5 class="text-sm font-black text-slate-900 leading-snug">${title}</h5>
              </div>
            </div>
            ${isUploaded ? `
              <span class="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                Terunggah
              </span>
            ` : `
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Belum Diunggah</span>
            `}
          </div>

          <p class="text-xs text-slate-500 mb-4 leading-relaxed font-medium">${desc}</p>

          <!-- Download Action Buttons -->
          <div class="mb-4 space-y-2">
            <button type="button" id="${opts.primaryDlId}" class="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-300 active:scale-98">
              <svg class="w-4 h-4 text-nu-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>${opts.primaryDlLabel}</span>
            </button>

            ${opts.secondaryDlId ? `
              <button type="button" id="${opts.secondaryDlId}" class="w-full min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>${opts.secondaryDlLabel}</span>
              </button>
            ` : ''}
          </div>

          <!-- Upload Zone -->
          ${this._renderVanillaUploadZoneHtml(taskId, opts.uploadBtnLabel, fileData)}
        </div>

        ${isUploaded ? `
          <div class="mt-4 pt-3 border-t border-emerald-200/80 text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span>Tersimpan di SIM-HALAL: Siap diverifikasi saat kunjungan</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderVanillaUploadZoneHtml(taskId, uploadBtnLabel, fileData) {
    const isUploaded = Boolean(fileData);
    return `
      <div>
        <input type="file" id="file_input_${taskId}" accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,image/*" class="hidden" />

        <!-- Progress Box -->
        <div id="progress_box_${taskId}" class="hidden p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-center space-y-2 mb-3">
          <div class="flex items-center justify-between text-xs font-bold text-amber-900">
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 animate-spin text-amber-700" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sedang Mengunggah Dokumen...
            </span>
            <span id="progress_pct_${taskId}" class="font-mono">15%</span>
          </div>
          <div class="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
            <div id="progress_bar_${taskId}" class="bg-amber-600 h-full rounded-full transition-all duration-300" style="width: 15%"></div>
          </div>
          <p class="text-[10px] text-amber-800 font-medium">Menyimpan berkas ke sistem SIM-HALAL Fatayat NU...</p>
        </div>

        ${isUploaded && fileData ? `
          <!-- Uploaded state -->
          <div class="p-3 rounded-xl bg-emerald-100/60 border border-emerald-300 space-y-2.5">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-emerald-950 truncate">${fileData.name}</p>
                <p class="text-[10px] text-emerald-700 font-medium">${fileData.formattedSize || 'Berkas Terverifikasi'} &bull; ${fileData.uploadedAt || 'Tersimpan'}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/80">
              <button type="button" id="btn_preview_${taskId}" class="min-h-[44px] px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <span>Lihat Berkas</span>
              </button>
              <button type="button" id="btn_change_${taskId}" class="min-h-[44px] px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98">
                <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Ganti File</span>
              </button>
            </div>
          </div>
        ` : `
          <!-- Not uploaded yet -->
          <div class="p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-nu-500 bg-slate-50/60 transition-all text-center">
            <button type="button" id="btn_up_${taskId}" class="w-full min-h-[44px] px-3.5 py-2.5 bg-nu-800 hover:bg-nu-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98">
              <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span class="truncate">${uploadBtnLabel || 'Upload Dokumen (PDF/Foto)'}</span>
            </button>
            <p class="text-[10px] text-slate-400 mt-2">Maksimal 5MB (Format: PDF, Word, Excel, JPG, PNG)</p>
          </div>
        `}
      </div>
    `;
  }

  _attachUploadCardListeners(member, onToggleCriterion, storageKey, savedData) {
    const self = this;

    // Helper simpan ke localStorage
    const persist = (files, email, nib, hasGmail, hasNib) => {
      try {
        const next = {
          files: files || savedData.files,
          email: email !== undefined ? email : savedData.email,
          hasGmail: hasGmail !== undefined ? hasGmail : savedData.hasGmail,
          nib: nib !== undefined ? nib : savedData.nib,
          hasNib: hasNib !== undefined ? hasNib : savedData.hasNib,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn("Gagal menulis localStorage:", e);
      }
    };

    // Toggle Punya/Belum Gmail
    const btnGmailYes = document.getElementById("btn_toggle_gmail_yes");
    const btnGmailNo = document.getElementById("btn_toggle_gmail_no");
    if (btnGmailYes && btnGmailNo) {
      btnGmailYes.onclick = () => {
        savedData.hasGmail = true;
        persist(undefined, undefined, undefined, true, undefined);
        self.renderDocumentUploadTasks(member, onToggleCriterion);
      };
      btnGmailNo.onclick = () => {
        savedData.hasGmail = false;
        persist(undefined, undefined, undefined, false, undefined);
        self.renderDocumentUploadTasks(member, onToggleCriterion);
      };
    }

    // Toggle Punya/Belum NIB
    const btnNibYes = document.getElementById("btn_toggle_nib_yes");
    const btnNibNo = document.getElementById("btn_toggle_nib_no");
    if (btnNibYes && btnNibNo) {
      btnNibYes.onclick = () => {
        savedData.hasNib = true;
        persist(undefined, undefined, undefined, undefined, true);
        self.renderDocumentUploadTasks(member, onToggleCriterion);
      };
      btnNibNo.onclick = () => {
        savedData.hasNib = false;
        persist(undefined, undefined, undefined, undefined, false);
        self.renderDocumentUploadTasks(member, onToggleCriterion);
      };
    }

    // 1. Simpan Email
    const btnSaveEmail = document.getElementById("btn_save_email");
    const inputEmail = document.getElementById("input_email_task");
    if (btnSaveEmail && inputEmail) {
      btnSaveEmail.onclick = () => {
        const emailVal = inputEmail.value.trim();
        if (!emailVal || !emailVal.includes("@")) {
          alert("Harap masukkan alamat Gmail yang valid (misal: sitiaminah@gmail.com).");
          return;
        }
        savedData.email = emailVal;
        savedData.hasGmail = true;
        member.email = emailVal;
        persist(undefined, emailVal, undefined, true, undefined);
        self.renderDocumentUploadTasks(member, onToggleCriterion);
      };
    }

    // 2. Simpan NIB Text
    const btnSaveNib = document.getElementById("btn_save_nib");
    const inputNib = document.getElementById("input_nib_task");
    if (btnSaveNib && inputNib) {
      btnSaveNib.onclick = () => {
        const nibClean = inputNib.value.replace(/\D/g, "");
        if (nibClean.length < 9) {
          alert("Nomor NIB minimal terdiri dari 9 hingga 13 digit angka.");
          return;
        }
        member.nib = nibClean;
        member.hasValidNIB = true;
        savedData.nib = nibClean;
        savedData.hasNib = true;
        persist(undefined, undefined, nibClean, undefined, true);
        if (onToggleCriterion && !member.hasValidNIB) {
          onToggleCriterion("nib");
        } else {
          self.renderScoreGauge(member);
          self.renderDocumentUploadTasks(member, onToggleCriterion);
        }
      };
    }

    // 3. Tombol Unduh Template Resmi
    const bindOfficialDownload = (btnId, fileName, fallbackFn) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.onclick = () => {
          try {
            const link = document.createElement("a");
            link.href = `templates/${fileName}`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 100);
          } catch (e) {
            if (fallbackFn) fallbackFn(member);
          }
        };
      }
    };

    bindOfficialDownload("btn_dl_permohonan_docx", "Template_Surat_Permohonan_BPJPH.docx", this._downloadPermohonanDoc.bind(this));
    bindOfficialDownload("btn_dl_permohonan_pdf", "Template_Surat_Permohonan_BPJPH.pdf");
    bindOfficialDownload("btn_dl_manual_docx", "Template_Manual_SJPH_Lengkap_Resmi.docx", this._downloadManualSJPHDoc.bind(this));
    bindOfficialDownload("btn_dl_manual_pdf", "Panduan_Lengkap_SJPH_BPJPH.pdf");
    bindOfficialDownload("btn_dl_bahan_csv", "Template_Tabel_Daftar_Bahan_Baku.csv", this._downloadBahanCSV.bind(this));
    bindOfficialDownload("btn_dl_penyelia_docx", "Template_SK_Penetapan_Penyelia_Halal.docx", this._downloadSKPenyeliaDoc.bind(this));
    bindOfficialDownload("btn_dl_ikrar_doc", "Template_Surat_Pernyataan_Bebas_Babi_Ikrar.doc", this._downloadIkrarDoc.bind(this));

    // 4. Tombol Upload & Drag Drop untuk Tiap Task
    const tasks = ['nib', 'sihalal', 'permohonan', 'manual_sjph', 'daftar_bahan', 'surat_penyelia', 'ikrar_materai'];
    tasks.forEach((taskId) => {
      const fileInput = document.getElementById(`file_input_${taskId}`);
      const btnUp = document.getElementById(`btn_up_${taskId}`);
      const btnChange = document.getElementById(`btn_change_${taskId}`);
      const btnPreview = document.getElementById(`btn_preview_${taskId}`);
      const card = document.getElementById(`card_task_${taskId}`);

      if (btnUp && fileInput) btnUp.onclick = () => fileInput.click();
      if (btnChange && fileInput) btnChange.onclick = () => fileInput.click();

      if (btnPreview) {
        btnPreview.onclick = () => {
          const fData = savedData.files[taskId];
          self._openPreviewModal(fData, taskId);
        };
      }

      if (fileInput) {
        fileInput.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            self._handleFileSelect(taskId, e.target.files[0], member, onToggleCriterion, storageKey, savedData);
          }
        };
      }

      // Drag and Drop
      if (card) {
        card.ondragover = (e) => {
          e.preventDefault();
          card.classList.add("ring-2", "ring-nu-600", "bg-nu-50");
        };
        card.ondragleave = (e) => {
          e.preventDefault();
          card.classList.remove("ring-2", "ring-nu-600", "bg-nu-50");
        };
        card.ondrop = (e) => {
          e.preventDefault();
          card.classList.remove("ring-2", "ring-nu-600", "bg-nu-50");
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            self._handleFileSelect(taskId, e.dataTransfer.files[0], member, onToggleCriterion, storageKey, savedData);
          }
        };
      }
    });
  }

  _handleFileSelect(taskId, file, member, onToggleCriterion, storageKey, savedData) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`Berkas "${file.name}" melebihi batas 5MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Harap pilih file yang lebih kecil.`);
      return;
    }

    const progressBox = document.getElementById(`progress_box_${taskId}`);
    const progressBar = document.getElementById(`progress_bar_${taskId}`);
    const progressPct = document.getElementById(`progress_pct_${taskId}`);

    if (progressBox) progressBox.classList.remove("hidden");

    let progress = 15;
    const interval = setInterval(() => {
      progress += 28;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressPct) progressPct.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Buat objek record berkas
          const fileRecord = {
            name: file.name,
            size: file.size,
            formattedSize: `${Math.round(file.size / 1024)} KB`,
            type: file.type,
            uploadedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
          };

          // Simpan DataURL untuk gambar pratinjau jika foto
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (re) => {
              fileRecord.dataUrl = re.target.result;
              this._finishUpload(taskId, fileRecord, member, onToggleCriterion, storageKey, savedData);
            };
            reader.readAsDataURL(file);
          } else {
            this._finishUpload(taskId, fileRecord, member, onToggleCriterion, storageKey, savedData);
          }
        }, 300);
      }
    }, 250);
  }

  _finishUpload(taskId, fileRecord, member, onToggleCriterion, storageKey, savedData) {
    savedData.files[taskId] = fileRecord;
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedData));
    } catch (e) {
      console.warn("Gagal menyimpan berkas ke localStorage:", e);
    }

    // Trigger toggle criterion pada member model agar skor kesiapan otomatis naik!
    const criterionMap = {
      'nib': 'nib',
      'sihalal': 'sihalal',
      'permohonan': 'permohonan',
      'manual_sjph': 'manual_sjph',
      'daftar_bahan': 'daftar_bahan',
      'surat_penyelia': 'surat_penyelia',
      'ikrar_materai': 'ikrar_materai'
    };

    const criterionKey = criterionMap[taskId];
    if (criterionKey && !member[criterionKey] && onToggleCriterion) {
      onToggleCriterion(criterionKey);
    } else {
      // Re-render UI kartu
      this.renderDocumentUploadTasks(member, onToggleCriterion);
      this.renderScoreGauge(member);
    }
  }

  _openPreviewModal(fileData, taskId) {
    const modal = document.getElementById("documentPreviewModal");
    const titleEl = document.getElementById("previewDocTitle");
    const subEl = document.getElementById("previewDocSubtitle");
    const bodyEl = document.getElementById("previewDocBody");
    const closeBtn = document.getElementById("previewCloseBtn");
    const closeFooterBtn = document.getElementById("previewCloseFooterBtn");
    const downloadBtn = document.getElementById("previewDownloadBtn");

    if (!modal || !fileData) return;

    if (titleEl) titleEl.textContent = `Pratinjau: ${fileData.name}`;
    if (subEl) subEl.textContent = `Ukuran: ${fileData.formattedSize || '250 KB'} • Terunggah: ${fileData.uploadedAt || 'Terverifikasi'}`;

    if (bodyEl) {
      if (fileData.dataUrl) {
        bodyEl.innerHTML = `
          <div class="max-w-full text-center">
            <img src="${fileData.dataUrl}" alt="${fileData.name}" class="max-h-[50vh] max-w-full rounded-xl object-contain shadow-sm border border-slate-200 bg-white" />
            <p class="text-xs text-slate-500 mt-2">Foto dokumen asli berhasil diunggah dan terarsip aman.</p>
          </div>
        `;
      } else {
        const isPdf = /\.pdf$/i.test(fileData.name);
        bodyEl.innerHTML = `
          <div class="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-nu-50 border border-nu-200 flex items-center justify-center text-nu-700 font-mono text-sm font-bold">
              ${isPdf ? 'PDF' : 'DOCX'}
            </div>
            <h4 class="font-bold text-slate-800 text-sm sm:text-base break-words">${fileData.name}</h4>
            <div class="mt-3 text-xs text-slate-500">Berkas format resmi ${isPdf ? 'PDF' : 'Dokumen'} siap diverifikasi.</div>
          </div>
        `;
      }
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        if (fileData.dataUrl) {
          const a = document.createElement("a");
          a.href = fileData.dataUrl;
          a.download = fileData.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          alert(`Berkas ${fileData.name} tersimpan di memori SIM-HALAL.`);
        }
      };
    }

    const closeModal = () => {
      modal.classList.add("hidden");
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (closeFooterBtn) closeFooterBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    modal.classList.remove("hidden");
  }

  // ===================== TEMPLATE GENERATORS =====================

  _downloadPermohonanDoc(member) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Surat Permohonan Halal</title><style>body{font-family:'Times New Roman',serif;margin:2cm;font-size:12pt;line-height:1.5}.kop{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse}td{padding:4px 6px;vertical-align:top}</style></head><body><div class="kop"><h3>SURAT PERMOHONAN SERTIFIKASI HALAL BPJPH</h3><p>JALUR SELF-DECLARE - PENDAMPINGAN FATAYAT NU MERSI</p></div><p style="text-align:right">Banyumas, 2026</p><p>Kepada Yth. Kepala BPJPH Kemenag RI<br>di Tempat</p><p>Yang bertanda tangan di bawah ini:</p><table><tr><td style="width:180px">Nama Pelaku Usaha</td><td>: <strong>${member.nama}</strong></td></tr><tr><td>Nama Merek / Usaha</td><td>: <strong>${member.usaha}</strong></td></tr><tr><td>Nomor NIB</td><td>: ${member.nib || '................'}</td></tr><tr><td>Kategori</td><td>: ${member.kategori}</td></tr><tr><td>Alamat</td><td>: ${member.alamat}</td></tr></table><p>Dengan ini mengajukan permohonan sertifikasi halal jalur self-declare.</p><br><br><table style="width:100%"><tr><td style="width:50%;text-align:center">Pendamping Halal PPH<br><br><br><br>( ................................ )</td><td style="width:50%;text-align:center">Pemohon Pelaku Usaha<br><br><br><br><strong>( ${member.nama} )</strong></td></tr></table></body></html>`;
    this._triggerDl(html, `Surat_Permohonan_Halal_${this._cleanStr(member.nama)}.doc`, 'application/msword');
  }

  _downloadManualSJPHDoc(member) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Manual SJPH</title><style>body{font-family:Arial,sans-serif;margin:2cm;font-size:11pt;line-height:1.6}h2,h3{color:#143D1F}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#143D1F;color:white}</style></head><body><div style="text-align:center;border-bottom:2px solid #143D1F;padding-bottom:10px"><h2>MANUAL SISTEM JAMINAN PRODUK HALAL (SJPH)</h2><h3>PIMPINAN RANTING FATAYAT NU DESA MERSI</h3></div><p><strong>Nama Usaha:</strong> ${member.usaha}<br><strong>Pemilik:</strong> ${member.nama}<br><strong>Penyelia Halal:</strong> ${member.penyelia_nama || 'Muslim'}</p><h3>I. KOMITMEN KEBIJAKAN HALAL</h3><p>Kami berkomitmen memproduksi produk yang halal, suci, dan thayyib sesuai syariat Islam dan regulasi BPJPH.</p><h3>II. ALUR PROSES PENGOLAHAN HALAL</h3><table><tr><th>Tahap</th><th>SOP Halal</th></tr><tr><td>1. Pembelian Bahan</td><td>Bahan nabati positive list & bumbu berlabel halal resmi.</td></tr><tr><td>2. Produksi</td><td>Peralatan masak terpisah dari najis, air bersih standar konsumsi.</td></tr></table><br><br><p>Penyelia Halal: ( ${member.penyelia_nama || 'Muslim'} ) &nbsp;&nbsp;&nbsp;&nbsp; Pimpinan: ( ${member.nama} )</p></body></html>`;
    this._triggerDl(html, `Manual_SJPH_${this._cleanStr(member.usaha)}.doc`, 'application/msword');
  }

  _downloadBahanCSV(member) {
    const csv = `\uFEFF"FORMULIR RINCIAN BAHAN BAKU & BUMBU PRODUKSI"\r\n"Nama Usaha: ${member.usaha}","Pemilik: ${member.nama}"\r\n\r\n"No","Nama Bahan","Merek","Produsen/Toko","Status Halal / No Sertifikat","Keterangan"\r\n"1","Bahan Utama Nabati","Alami","Pasar Mersi","Positive List Kemenag","Bahan Segar"\r\n"2","Tepung Beras/Tapioka","Rose Brand / Gunung","Toko Barokah","ID0041000001234","Tersertifikasi"\r\n"3","Minyak Goreng","Bimoli / SunCo","Supermarket","ID0021000009876","Tersertifikasi"\r\n"4","Bumbu Rempah Segar","Bawang/Ketumbar","Pasar Wage","Positive List","Bumbu Alami"\r\n"5","Air Bersih","PDAM / Sumur Dapur","Sumber Mersi","Standar Air Minum","Sanitasi Bersih"\r\n`;
    this._triggerDl(csv, `Tabel_Bahan_Baku_${this._cleanStr(member.usaha)}.csv`, 'text/csv;charset=utf-8;');
  }

  _downloadSKPenyeliaDoc(member) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SK Penetapan Penyelia Halal</title><style>body{font-family:'Times New Roman',serif;margin:2cm;font-size:12pt;line-height:1.5}.kop{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse}td{padding:4px 6px;vertical-align:top}</style></head><body><div class="kop"><h3>SURAT KEPUTUSAN PENETAPAN PENYELIA HALAL</h3><p>USAHA ${member.usaha.toUpperCase()}</p></div><p>Menetapkan bahwa:</p><table><tr><td style="width:180px">Nama Penyelia</td><td>: <strong>${member.penyelia_nama || 'Ahmad Fauzi'}</strong></td></tr><tr><td>Agama</td><td>: Islam (Muslim)</td></tr><tr><td>Tugas</td><td>: Mengawasi kepatuhan proses produk halal di dapur produksi.</td></tr></table><br><br><table style="width:100%"><tr><td style="width:50%;text-align:center">Penyelia Halal,<br><br><br><br><strong>( ${member.penyelia_nama || 'Ahmad Fauzi'} )</strong></td><td style="width:50%;text-align:center">Pimpinan Usaha,<br><br><br><br><strong>( ${member.nama} )</strong></td></tr></table></body></html>`;
    this._triggerDl(html, `SK_Penyelia_Halal_${this._cleanStr(member.usaha)}.doc`, 'application/msword');
  }

  _downloadIkrarDoc(member) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Surat Ikrar Halal</title><style>body{font-family:'Times New Roman',serif;margin:2cm;font-size:12pt;line-height:1.6}.kop{text-align:center;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse}td{padding:4px 6px;vertical-align:top}.materai{border:1px dashed #777;width:120px;height:70px;margin:10px auto;font-size:8pt;text-align:center;line-height:70px;color:#888}</style></head><body><div class="kop"><h3>SURAT PERNYATAAN IKRAR HALAL PELAKU USAHA</h3><p>JALUR SELF-DECLARE BPJPH KEMENAG RI</p></div><p>Bismillahirrohmanirrohim,<br>Saya yang bertanda tangan di bawah ini:</p><table><tr><td style="width:180px">Nama Lengkap</td><td>: <strong>${member.nama}</strong></td></tr><tr><td>Nama Usaha</td><td>: <strong>${member.usaha}</strong></td></tr><tr><td>Alamat</td><td>: ${member.alamat}</td></tr></table><p>Dengan penuh kesadaran berikrar bahwa produk yang kami hasilkan adalah <strong>HALAL dan THAYYIB</strong>, bebas dari unsur najis dan barang haram.</p><br><br><table style="width:100%"><tr><td style="width:50%;text-align:center">Pendamping Halal Fatayat NU<br><br><br><br>( ................................ )</td><td style="width:50%;text-align:center">Yang Berikrar,<div class="materai">MATERAI Rp10.000</div><strong>( ${member.nama} )</strong></td></tr></table></body></html>`;
    this._triggerDl(html, `Ikrar_Halal_Materai_${this._cleanStr(member.nama)}.doc`, 'application/msword');
  }

  _triggerDl(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  _cleanStr(str) {
    return String(str || 'dokumen').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  }

  /**
   * Merender komparasi transparan 2 kolom: "Apa Aja yang Sudah Terlaksana [V]" vs "Belum Terlaksana [X]"
   * @param {Member} member 
   * @param {Function} onToggleCriterion 
   */
  renderCompletedAndPendingSummary(member, onToggleCriterion) {
    const completedContainer = document.getElementById("completedItemsContainer");
    const pendingContainer = document.getElementById("pendingItemsContainer");
    const completedBadge = document.getElementById("completedCountBadge");
    const pendingBadge = document.getElementById("pendingCountBadge");

    const completed = member.completedItems;
    const pending = member.pendingItems;

    if (completedBadge) completedBadge.textContent = `${completed.length} Syarat`;
    if (pendingBadge) pendingBadge.textContent = `${pending.length} Syarat`;

    // 1. Render Kolom Sudah Terlaksana [V]
    if (completedContainer) {
      completedContainer.innerHTML = "";
      if (completed.length === 0) {
        completedContainer.innerHTML = `
          <div class="py-8 text-center text-slate-400 text-xs italic">
            Belum ada indikator yang terpenuhi. Klik butir di bawah untuk melengkapi.
          </div>
        `;
      } else {
        completed.forEach((item) => {
          const div = document.createElement("div");
          div.className = "p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/90 flex items-start justify-between gap-3 transition-all hover:bg-emerald-100/70";
          div.innerHTML = `
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="mt-0.5 text-emerald-600 flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </span>
              <div class="min-w-0">
                <div class="text-xs font-bold text-emerald-950 truncate">${item.title}</div>
                <div class="text-[11px] text-emerald-700/90 leading-relaxed">${item.desc}</div>
              </div>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-200/80 text-emerald-800 flex-shrink-0">
              ${item.pillarBadge}
            </span>
          `;
          completedContainer.appendChild(div);
        });
      }
    }

    // 2. Render Kolom Belum Terlaksana [X]
    if (pendingContainer) {
      pendingContainer.innerHTML = "";
      if (pending.length === 0) {
        pendingContainer.innerHTML = `
          <div class="py-8 text-center text-emerald-700 text-xs font-bold bg-emerald-50/50 rounded-xl">
            <svg class="w-8 h-8 text-emerald-600 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Alhamdulillah! Seluruh persyaratan BPJPH telah terpenuhi sempurna (100%).
          </div>
        `;
      } else {
        pending.forEach((item) => {
          const div = document.createElement("div");
          div.className = "p-3 rounded-xl bg-rose-50/70 border border-rose-200/90 flex items-start justify-between gap-3 transition-all hover:bg-rose-100/70 cursor-pointer";
          div.title = "Klik untuk melengkapi/verifikasi syarat ini secara langsung";
          div.onclick = () => {
            if (onToggleCriterion) onToggleCriterion(item.fieldKey);
          };
          div.innerHTML = `
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="mt-0.5 text-rose-600 flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
              <div class="min-w-0">
                <div class="text-xs font-bold text-rose-950 truncate">${item.title}</div>
                <div class="text-[11px] text-rose-700/90 leading-relaxed">${item.action}</div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-rose-200/80 text-rose-800">
                ${item.pillarBadge}
              </span>
              <span class="text-[9px] font-extrabold text-nu-800 underline">Lengkapi [ + ]</span>
            </div>
          `;
          pendingContainer.appendChild(div);
        });
      }
    }
  }

  /**
   * Merender 4 Pilar Standar SJPH (18 Indikator)
   * @param {Member} member 
   * @param {Function} onToggleCriterion 
   */
  renderPillarsMatrix(member, onToggleCriterion) {
    AuditPillars.forEach(pillar => {
      pillar.items.forEach(item => {
        const isPassed = Boolean(member[item.fieldKey]);
        const clickHandler = () => {
          if (item.isLocked) {
            alert(`Kriteria "${item.title}" selalu terpenuhi otomatis untuk seluruh anggota resmi Fatayat NU.`);
            return;
          }
          if (onToggleCriterion) {
            onToggleCriterion(item.fieldKey);
          }
        };

        const desc = isPassed ? item.descPassed : item.descFailed;
        this._renderChecklistItem(`check_${item.fieldKey}`, isPassed, item.title, desc, clickHandler);
      });
    });
  }

  /**
   * Merender kotak rekomendasi dokumen (Action Box)
   * @param {Member} member 
   * @param {Function} onPrint 
   * @param {Function} onSendWhatsApp 
   */
  renderActionBox(member, onPrint, onSendWhatsApp) {
    const container = document.getElementById("actionBoxContainer");
    const icon = document.getElementById("actionBoxIcon");
    const title = document.getElementById("actionBoxTitle");
    const subtitle = document.getElementById("actionBoxSubtitle");
    const list = document.getElementById("actionItemsList");

    if (!container || !list) return;
    list.innerHTML = "";

    const btnPrint = document.getElementById("btnAuditPrint");
    if (btnPrint && onPrint) {
      btnPrint.onclick = onPrint;
    }
    const btnWa = document.getElementById("btnAuditWhatsApp");
    if (btnWa && onSendWhatsApp) {
      btnWa.onclick = onSendWhatsApp;
    }

    if (member.hambatan.length === 0) {
      container.className = "bg-white rounded-2xl border-2 border-emerald-400 shadow-nu p-5 sm:p-6 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30";
      if (icon) {
        icon.className = "w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5";
        icon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      }
      if (title) {
        title.textContent = "Alhamdulillah! Berkas & Persyaratan Halal Lengkap (100%)";
        title.className = "text-base sm:text-lg font-black text-emerald-900";
      }
      if (subtitle) {
        subtitle.textContent = "Seluruh dokumen telah memenuhi standar SJPH BPJPH. Silakan cetak lembar audit dan segera ajukan ke akun SIHALAL.";
      }

      list.innerHTML = `
        <li class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-semibold">
          <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          <span>Seluruh data telah siap! Segera koordinasikan dengan Pendamping Halal PPH Ranting Fatayat NU untuk input kode pendamping di portal ptsp.halal.go.id.</span>
        </li>
      `;
    } else {
      container.className = "bg-white rounded-2xl border-2 border-amber-300 shadow-nu p-5 sm:p-6 transition-all duration-300";
      if (icon) {
        icon.className = "w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5";
        icon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
      }
      if (title) {
        title.textContent = `Terdapat ${member.hambatan.length} Catatan Dokumen yang Harus Dilengkapi`;
        title.className = "text-base sm:text-lg font-black text-nu-900";
      }
      if (subtitle) {
        subtitle.textContent = "Berikut langkah-langkah praktis pendampingan untuk meloloskan audit BPJPH:";
      }

      member.hambatan.forEach((hambatan, index) => {
        const li = document.createElement("li");
        li.className = "p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-slate-800 text-xs sm:text-sm font-medium";
        li.innerHTML = `
          <span class="w-5 h-5 rounded-full bg-amber-500 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
            ${index + 1}
          </span>
          <span class="flex-1">${hambatan}</span>
        `;
        list.appendChild(li);
      });
    }
  }

  // ===================== PRIVATE HELPERS =====================

  _renderChecklistItem(elementId, isPassed, title, description, onClickCallback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const clone = el.cloneNode(false);
    el.parentNode.replaceChild(clone, el);
    clone.onclick = onClickCallback;

    if (isPassed) {
      clone.className = "pilar-item cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60";
      clone.innerHTML = `
        <div class="mt-0.5 text-emerald-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs sm:text-sm font-bold flex items-center justify-between">
            <span class="truncate">${title}</span>
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800 ml-2 flex-shrink-0">LOLOS [V]</span>
          </div>
          <p class="text-[11px] text-slate-600 mt-0.5">${description}</p>
        </div>
      `;
    } else {
      clone.className = "pilar-item cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 bg-rose-50/60 border-rose-200 text-rose-900 hover:bg-rose-100/60";
      clone.innerHTML = `
        <div class="mt-0.5 text-rose-600 flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs sm:text-sm font-bold flex items-center justify-between">
            <span class="truncate">${title}</span>
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-800 ml-2 flex-shrink-0">KURANG [X]</span>
          </div>
          <p class="text-[11px] text-rose-700/80 mt-0.5 font-medium">${description}</p>
        </div>
      `;
    }
  }

  _animateScore(element, start, end) {
    if (start === end) {
      element.textContent = end;
      return;
    }
    const startTime = performance.now();
    const duration = this.scoreAnimationDuration;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      element.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end;
      }
    };
    requestAnimationFrame(update);
  }

  _setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }
}

// Export ke namespace global
window.MemberDetailView = MemberDetailView;
