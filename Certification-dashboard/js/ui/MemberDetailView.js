/**
 * =============================================================================
 * UI VIEW: MEMBER DETAIL VIEW (TAB 2 - DASHBOARD MANDIRI ANGGOTA UMKM)
 * =============================================================================
 * Menangani rendering visual untuk Dashboard Mandiri per Anggota:
 * - Header Sambutan Hangat Pelaku Usaha
 * - Profil Usaha & Skor Kesiapan Terbobot
 * - Milestone Tracker "Syarat Sertifikasi Udah Sampe Mana Aja?" (5 Tahapan)
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
        // Cek apakah step ini adalah step pertama yang belum selesai (tahap aktif)
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
        completedContainer.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">Belum ada syarat yang diverifikasi memenuhi standar.</div>`;
      } else {
        completed.forEach(item => {
          const div = document.createElement("div");
          div.className = "p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start justify-between gap-2.5 transition-all hover:bg-emerald-100/60 cursor-pointer";
          div.title = "Klik untuk membatalkan verifikasi (simulasi audit)";
          div.innerHTML = `
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-bold text-emerald-950">${item.label}</span>
                  <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">${item.pilar}</span>
                </div>
                <p class="text-[11px] text-emerald-800/90 mt-0.5 leading-snug">${item.desc}</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-200 text-emerald-900 flex-shrink-0">[ V ] Lolos</span>
          `;

          div.onclick = () => {
            if (typeof onToggleCriterion === "function" && item.key) {
              onToggleCriterion(item.key);
            }
          };

          completedContainer.appendChild(div);
        });
      }
    }

    // 2. Render Kolom Belum Terlaksana [X]
    if (pendingContainer) {
      pendingContainer.innerHTML = "";
      if (pending.length === 0) {
        pendingContainer.innerHTML = `
          <div class="p-6 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <svg class="w-8 h-8 mx-auto text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div class="text-xs sm:text-sm font-bold">Alhamdulillah! Tidak Ada Kekurangan Berkas</div>
            <div class="text-[11px] text-emerald-600 mt-0.5">Semua syarat sertifikasi telah terpenuhi 100%.</div>
          </div>
        `;
      } else {
        pending.forEach(item => {
          const div = document.createElement("div");
          div.className = "p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-start justify-between gap-2.5 transition-all hover:bg-rose-100/60 cursor-pointer";
          div.title = "Klik jika syarat ini telah selesai dipenuhi";
          div.innerHTML = `
            <div class="flex items-start gap-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-bold text-rose-950">${item.label}</span>
                  <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-rose-200/80 text-rose-900">${item.pilar}</span>
                </div>
                <p class="text-[11px] text-rose-800/90 mt-0.5 leading-snug"><strong>Tindakan:</strong> ${item.action}</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-200 text-rose-900 flex-shrink-0">[ X ] Kurang</span>
          `;

          div.onclick = () => {
            if (typeof onToggleCriterion === "function" && item.key) {
              onToggleCriterion(item.key);
            }
          };

          pendingContainer.appendChild(div);
        });
      }
    }
  }

  /**
   * Merender daftar checklist 4 pilar standar SJPH BPJPH (18 Indikator)
   * @param {Member} member 
   * @param {Function} onToggleCriterion 
   */
  renderPillarsMatrix(member, onToggleCriterion) {
    const pillars = AuditPillars.getPillarsConfig();

    pillars.forEach(pillar => {
      pillar.items.forEach(item => {
        const passed = item.check(member);
        const desc = passed 
          ? (typeof item.passDesc === "function" ? item.passDesc(member) : item.passDesc)
          : item.failDesc;

        this._renderChecklistItem(`check_${item.key}`, passed, item.title, desc, () => {
          if (typeof onToggleCriterion === "function") {
            onToggleCriterion(item.key);
          }
        });
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

    // Pasang handler tombol cetak & whatsapp
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
