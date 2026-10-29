/**
 * =============================================================================
 * UI VIEW: AUTH VIEW (HALAMAN MASUK & PENDAFTARAN SIM-HALAL)
 * =============================================================================
 * Menangani halaman autentikasi sebelum masuk dashboard:
 * - Login sebagai Pengurus Fatayat NU (Akses penuh seluruh fitur & dropdown)
 * - Login sebagai Pelaku Usaha UMKM (Akses eksklusif Tab 2 Dashboard Mandiri,
 *   dropdown terkunci pada usahanya sendiri)
 * - Pendaftaran Pelaku Usaha UMKM baru di Desa Mersi
 */

class AuthView {
  constructor() {
    this.container = document.getElementById("authPageContainer");
    this.mainWrapper = document.getElementById("appMainWrapper");
    this.activeTab = "member"; // "member", "admin", "register"
  }

  /**
   * Menampilkan halaman login dan menyembunyikan dashboard utama
   * @param {Member[]} members - Daftar anggota UMKM
   * @param {Object} callbacks - { onLogin, onRegister }
   */
  render(members, callbacks = {}) {
    if (!this.container) return;

    if (this.mainWrapper) {
      this.mainWrapper.classList.add("hidden");
    }
    this.container.classList.remove("hidden");

    this.container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-nu-900 via-nu-950 to-slate-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <!-- Ornamen Halal di Latar Belakang -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
        </div>

        <div class="relative max-w-xl w-full z-10">
          
          <!-- Logo & Judul Aplikasi -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-nu-800 to-nu-600 text-white shadow-xl shadow-nu-950/50 ring-4 ring-nu-500/30 mb-4">
              <svg class="w-10 h-10 text-amber-300 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z"/>
                <path d="M12 8v5" stroke="currentColor" stroke-width="2.2"/>
                <circle cx="12" cy="15.5" r="0.7" fill="currentColor"/>
              </svg>
            </div>

            <div class="flex items-center justify-center gap-2 mb-1">
              <span class="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-nu-800/80 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
                Portal Akses SIM-HALAL
              </span>
              <span class="text-xs text-emerald-300 font-semibold">
                PR Fatayat NU Desa Mersi
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sistem Informasi Manajemen Halal
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Pendampingan Proses Produk Halal (PPH) Jalur <em>Self-Declare</em> BPJPH Kemenag RI
            </p>
          </div>

          <!-- Kartu Utama Pilihan Peran -->
          <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <!-- Tab Switcher (Pelaku Usaha / Pengurus / Daftar Baru) -->
            <div class="grid grid-cols-3 bg-slate-100/90 p-1.5 border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                id="authTabMemberBtn"
                class="min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${this.activeTab === 'member' ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'}"
              >
                <svg class="w-4 h-4 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>Pelaku Usaha</span>
              </button>

              <button
                type="button"
                id="authTabAdminBtn"
                class="min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${this.activeTab === 'admin' ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'}"
              >
                <svg class="w-4 h-4 text-nu-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span>Pengurus Fatayat</span>
              </button>

              <button
                type="button"
                id="authTabRegisterBtn"
                class="min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${this.activeTab === 'register' ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'}"
              >
                <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Daftar Baru</span>
              </button>
            </div>

            <div class="p-6 sm:p-8">
              
              <!-- ------------------------------------------------------------- -->
              <!-- TAB 1: FORM MASUK PELAKU USAHA (MEMBER UMKM)                  -->
              <!-- ------------------------------------------------------------- -->
              <div id="authContentMember" class="${this.activeTab === 'member' ? '' : 'hidden'} space-y-4">
                
                <!-- 1. Pilih Nama Pelaku Usaha -->
                <div>
                  <label for="authSelectMember" class="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Nama Ibu/Bapak atau Nama Usaha:
                  </label>
                  <select id="authSelectMember" class="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 hover:border-nu-500 text-slate-900 rounded-2xl p-3.5 focus:ring-2 focus:ring-nu-600/30 focus:border-nu-700 outline-none transition-all cursor-pointer">
                    ${members.map(m => `
                      <option value="${m.id}">[${m.id}] ${m.nama} &bull; ${m.usaha} (${m.kategori})</option>
                    `).join('')}
                  </select>
                </div>

                <!-- 2. Password / PIN Pelaku Usaha -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="authMemberPassword" class="block text-xs font-bold text-slate-700">
                      Kata Sandi / PIN Pelaku Usaha:
                    </label>
                    <span class="text-[11px] text-slate-400 font-medium">
                      PIN Standar: <strong class="text-nu-800 font-mono">123456</strong>
                    </span>
                  </div>
                  <div class="relative">
                    <input
                      type="password"
                      id="authMemberPassword"
                      value="123456"
                      placeholder="Masukkan PIN (standar: 123456)"
                      class="w-full text-xs sm:text-sm font-mono px-3.5 py-3 rounded-2xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none pr-10"
                    />
                    <button
                      type="button"
                      id="authMemberTogglePass"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Lihat / Sembunyikan PIN"
                    >
                      <svg id="authMemberEyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Contoh Masuk Cepat 1-Klik -->
                <div class="pt-1">
                  <span class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contoh Masuk Cepat (1-Klik):
                  </span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button type="button" id="quickLoginSiti" class="min-h-[44px] text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group">
                      <div>
                        <div class="font-extrabold text-slate-900 group-hover:text-emerald-800">Ibu Siti Aminah</div>
                        <div class="text-[11px] text-slate-500">Keripik Tempe Barokah</div>
                      </div>
                      <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>

                    <button type="button" id="quickLoginFaizah" class="min-h-[44px] text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group">
                      <div>
                        <div class="font-extrabold text-slate-900 group-hover:text-emerald-800">Ibu Faizah</div>
                        <div class="text-[11px] text-slate-500">Roti & Pastry Mersi</div>
                      </div>
                      <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="btnSubmitMemberLogin"
                  class="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-nu-800 hover:bg-nu-900 active:scale-98 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2"
                >
                  <span>Buka Dashboard Mandiri Saya</span>
                  <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </div>

              <!-- ------------------------------------------------------------- -->
              <!-- TAB 2: FORM MASUK PENGURUS FATAYAT NU (ADMIN AKSES PENUH)     -->
              <!-- ------------------------------------------------------------- -->
              <div id="authContentAdmin" class="${this.activeTab === 'admin' ? '' : 'hidden'} space-y-4">
                <div class="p-4 bg-nu-50/80 border border-nu-200 rounded-2xl flex items-start gap-3">
                  <svg class="w-5 h-5 text-nu-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  <div class="text-xs text-nu-950 leading-relaxed">
                    <strong class="block text-nu-900 font-extrabold mb-0.5">
                      Akses Penuh Pengurus & Pendamping PPH
                    </strong>
                    Membuka seluruh fitur: <strong>Tab 1 Ringkasan Eksekutif</strong>, monitoring 45 UMKM, grafik status, pemilihan bebas dropdown seluruh anggota, dan cetak berkas audit.
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Username / Email Pengurus:
                  </label>
                  <input
                    type="text"
                    id="inputAdminUsername"
                    value="pengurus.mersi"
                    placeholder="misal: pengurus.mersi"
                    class="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi / PIN Pengurus:
                  </label>
                  <input
                    type="password"
                    id="inputAdminPassword"
                    value="fatayat2026"
                    placeholder="••••••••"
                    class="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                  />
                </div>

                <div class="pt-2">
                  <button
                    type="button"
                    id="btnSubmitAdminLogin"
                    class="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-nu-800 to-nu-700 hover:from-nu-900 hover:to-nu-800 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <svg class="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Masuk sebagai Pengurus (Akses Penuh)</span>
                  </button>
                </div>

                <div class="text-center pt-1">
                  <button
                    type="button"
                    id="btnQuickAdminLogin"
                    class="text-xs font-bold text-nu-800 hover:text-nu-900 underline"
                  >
                    Klik di Sini untuk Masuk Cepat (Mode Demo Pengurus)
                  </button>
                </div>
              </div>

              <!-- ------------------------------------------------------------- -->
              <!-- TAB 3: FORM DAFTAR ANGGOTA BARU (REGISTRASI)                 -->
              <!-- ------------------------------------------------------------- -->
              <div id="authContentRegister" class="${this.activeTab === 'register' ? '' : 'hidden'} space-y-4">
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 leading-relaxed">
                  <strong class="block text-amber-900 font-extrabold mb-0.5">
                    Pendaftaran UMKM Binaan Baru Fatayat NU
                  </strong>
                  Isi data usaha Anda di Desa Mersi. Akun akan langsung dibuat dan Anda dapat mulai mengisi draf persyaratan halal.
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Pemilik:
                    </label>
                    <input
                      type="text"
                      id="regInputNama"
                      placeholder="contoh: Ibu Nurul Hidayah"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Nama Usaha / Merek:
                    </label>
                    <input
                      type="text"
                      id="regInputUsaha"
                      placeholder="contoh: Sambel Roa Mersi"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Produk:
                    </label>
                    <select
                      id="regInputKategori"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    >
                      <option value="Kudapan Kering">Kudapan Kering / Keripik</option>
                      <option value="Makanan Basah">Makanan Basah / Roti</option>
                      <option value="Minuman">Minuman Segar / Jamu</option>
                      <option value="Olahan Sambal">Olahan Sambal / Bumbu</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Aktif:
                    </label>
                    <input
                      type="text"
                      id="regInputKontak"
                      placeholder="081234567899"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Dapur / Produksi di Desa Mersi:
                  </label>
                  <input
                    type="text"
                    id="regInputAlamat"
                    value="Desa Mersi RT 02 RW 01, Kec. Purwokerto Timur"
                    class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                  />
                </div>

                <button
                  type="button"
                  id="btnSubmitRegister"
                  class="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-nu-800 hover:bg-nu-900 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>Daftarkan Usaha & Buka Dashboard Mandiri</span>
                </button>
              </div>

            </div>

            <!-- Footer Kartu -->
            <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-nu-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <span>Fasilitasi Sertifikasi Halal Gratis (SEHATI) Fatayat NU Banyumas</span>
            </div>

          </div>

        </div>

      </div>
    `;

    this._bindEvents(members, callbacks);
  }

  _bindEvents(members, callbacks) {
    const tabMemberBtn = document.getElementById("authTabMemberBtn");
    const tabAdminBtn = document.getElementById("authTabAdminBtn");
    const tabRegisterBtn = document.getElementById("authTabRegisterBtn");

    const contentMember = document.getElementById("authContentMember");
    const contentAdmin = document.getElementById("authContentAdmin");
    const contentRegister = document.getElementById("authContentRegister");

    const switchAuthTab = (tab) => {
      this.activeTab = tab;
      [contentMember, contentAdmin, contentRegister].forEach(c => c && c.classList.add("hidden"));
      [tabMemberBtn, tabAdminBtn, tabRegisterBtn].forEach(b => {
        if (b) {
          b.className = "min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center text-slate-600 hover:text-slate-900";
        }
      });

      if (tab === "member" && contentMember && tabMemberBtn) {
        contentMember.classList.remove("hidden");
        tabMemberBtn.className = "min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80";
      } else if (tab === "admin" && contentAdmin && tabAdminBtn) {
        contentAdmin.classList.remove("hidden");
        tabAdminBtn.className = "min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80";
      } else if (tab === "register" && contentRegister && tabRegisterBtn) {
        contentRegister.classList.remove("hidden");
        tabRegisterBtn.className = "min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80";
      }
    };

    if (tabMemberBtn) tabMemberBtn.onclick = () => switchAuthTab("member");
    if (tabAdminBtn) tabAdminBtn.onclick = () => switchAuthTab("admin");
    if (tabRegisterBtn) tabRegisterBtn.onclick = () => switchAuthTab("register");

    // Toggle Password Visibility
    const passInput = document.getElementById("authMemberPassword");
    const togglePassBtn = document.getElementById("authMemberTogglePass");
    if (passInput && togglePassBtn) {
      togglePassBtn.onclick = () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
      };
    }

    // Login Member Submit
    const btnSubmitMember = document.getElementById("btnSubmitMemberLogin");
    const selectMember = document.getElementById("authSelectMember");
    if (btnSubmitMember && selectMember) {
      btnSubmitMember.onclick = () => {
        const passVal = passInput ? passInput.value.trim() : "";
        if (!passVal) {
          alert("Harap masukkan Kata Sandi / PIN Pelaku Usaha (PIN Standar: 123456).");
          if (passInput) passInput.focus();
          return;
        }

        const memberId = selectMember.value;
        const target = members.find(m => m.id === memberId) || members[0];
        if (callbacks.onLogin && target) {
          callbacks.onLogin({
            role: "member",
            memberId: target.id,
            userName: target.nama,
            businessName: target.usaha
          });
        }
      };
    }

    // Quick Login Siti
    const quickSiti = document.getElementById("quickLoginSiti");
    if (quickSiti) {
      quickSiti.onclick = () => {
        if (passInput) passInput.value = "123456";
        const target = members.find(m => m.id === "FTY-001") || members[0];
        if (callbacks.onLogin && target) {
          callbacks.onLogin({
            role: "member",
            memberId: target.id,
            userName: target.nama,
            businessName: target.usaha
          });
        }
      };
    }

    // Quick Login Faizah
    const quickFaizah = document.getElementById("quickLoginFaizah");
    if (quickFaizah) {
      quickFaizah.onclick = () => {
        if (passInput) passInput.value = "123456";
        const target = members.find(m => m.id === "FTY-002") || members[1] || members[0];
        if (callbacks.onLogin && target) {
          callbacks.onLogin({
            role: "member",
            memberId: target.id,
            userName: target.nama,
            businessName: target.usaha
          });
        }
      };
    }

    // Login Admin Submit
    const btnSubmitAdmin = document.getElementById("btnSubmitAdminLogin");
    const btnQuickAdmin = document.getElementById("btnQuickAdminLogin");
    const handleAdminLogin = () => {
      if (callbacks.onLogin) {
        callbacks.onLogin({
          role: "admin",
          memberId: null,
          userName: "Pengurus Fatayat NU Mersi",
          businessName: "Sekretariat PPH Fatayat NU"
        });
      }
    };
    if (btnSubmitAdmin) btnSubmitAdmin.onclick = handleAdminLogin;
    if (btnQuickAdmin) btnQuickAdmin.onclick = handleAdminLogin;

    // Register Submit
    const btnSubmitReg = document.getElementById("btnSubmitRegister");
    const inputNama = document.getElementById("regInputNama");
    const inputUsaha = document.getElementById("regInputUsaha");
    const inputKategori = document.getElementById("regInputKategori");
    const inputKontak = document.getElementById("regInputKontak");
    const inputAlamat = document.getElementById("regInputAlamat");

    if (btnSubmitReg) {
      btnSubmitReg.onclick = () => {
        const nama = inputNama?.value.trim() || "";
        const usaha = inputUsaha?.value.trim() || "";
        if (!nama || !usaha) {
          alert("Harap lengkapi nama pemilik dan nama usaha.");
          return;
        }

        const newId = `FTY-${String(members.length + 1).padStart(3, "0")}`;
        const newMember = {
          id: newId,
          nama: nama,
          usaha: usaha,
          kategori: inputKategori?.value || "Kudapan Kering",
          kontak: inputKontak?.value.trim() || "081234567899",
          alamat: inputAlamat?.value.trim() || "Desa Mersi, Purwokerto Timur",
          hasValidNIB: false,
          nib: "-",
          penyelia_nama: "Muslim Terverifikasi",
          skor: 20,
          status: "Target Edukasi",
          kbli: true,
          permohonan: false,
          manual_sjph: false,
          daftar_bahan: false,
          surat_penyelia: false,
          ikrar_materai: false,
          sihalal: false
        };

        if (callbacks.onRegister) {
          callbacks.onRegister(newMember);
        }
        if (callbacks.onLogin) {
          callbacks.onLogin({
            role: "member",
            memberId: newId,
            userName: newMember.nama,
            businessName: newMember.usaha
          });
        }
      };
    }
  }

  /**
   * Menyembunyikan tampilan auth dan menampilkan dashboard utama
   */
  hide() {
    if (this.container) {
      this.container.classList.add("hidden");
    }
    if (this.mainWrapper) {
      this.mainWrapper.classList.remove("hidden");
    }
  }
}

window.AuthView = AuthView;
