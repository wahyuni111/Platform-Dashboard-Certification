import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Users,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  HeartHandshake,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';

export default function AuthPage({ members = [], onLogin, onRegisterNewMember }) {
  const [activeTab, setActiveTab] = useState('member'); // 'member', 'admin', 'register'

  // Member login state
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id || 'FTY-001'
  );
  const [memberPassword, setMemberPassword] = useState('123456');
  const [showMemberPass, setShowMemberPass] = useState(false);
  const [memberError, setMemberError] = useState('');

  // Admin login state
  const [adminUsername, setAdminUsername] = useState('pengurus.mersi');
  const [adminPassword, setAdminPassword] = useState('fatayat2026');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Register state
  const [regForm, setRegForm] = useState({
    nama: '',
    usaha: '',
    kategori: 'Kudapan Kering',
    kontak: '',
    alamat: 'Desa Mersi RT 02 RW 01, Kec. Purwokerto Timur',
    password: '123456',
    hasNIB: false,
    nib: ''
  });
  const [regError, setRegError] = useState('');

  // Handler Login Member
  const handleMemberSubmit = (e) => {
    if (e) e.preventDefault();
    setMemberError('');
    if (!memberPassword) {
      setMemberError('Harap masukkan kata sandi / PIN akun Anda (PIN standar: 123456).');
      return;
    }
    const target = members.find((m) => m.id === selectedMemberId) || members[0];
    if (!target) return;
    onLogin({
      role: 'member',
      memberId: target.id,
      userName: target.nama,
      businessName: target.usaha
    });
  };

  // Quick Demo Login for Member
  const handleQuickMemberLogin = (memberId) => {
    const target = members.find((m) => m.id === memberId) || members[0];
    if (!target) return;
    setSelectedMemberId(memberId);
    setMemberPassword('123456');
    onLogin({
      role: 'member',
      memberId: target.id,
      userName: target.nama,
      businessName: target.usaha
    });
  };

  // Handler Login Admin
  const handleAdminSubmit = (e) => {
    if (e) e.preventDefault();
    setAdminError('');
    if (!adminUsername || !adminPassword) {
      setAdminError('Harap masukkan username dan kata sandi pengurus.');
      return;
    }
    onLogin({
      role: 'admin',
      memberId: null,
      userName: 'Pengurus Fatayat NU Mersi',
      businessName: 'Sekretariat PPH Fatayat NU'
    });
  };

  // Handler Register Member Baru
  const handleRegisterSubmit = (e) => {
    if (e) e.preventDefault();
    setRegError('');

    if (!regForm.nama.trim() || !regForm.usaha.trim()) {
      setRegError('Nama pemilik dan nama usaha wajib diisi.');
      return;
    }

    const newId = `FTY-${String(members.length + 1).padStart(3, '0')}`;
    const newMemberData = {
      id: newId,
      nama: regForm.nama.trim(),
      usaha: regForm.usaha.trim(),
      kategori: regForm.kategori,
      kontak: regForm.kontak.trim() || '081234567899',
      alamat: regForm.alamat.trim() || 'Desa Mersi, Purwokerto Timur',
      has_valid_nib: regForm.hasNIB && Boolean(regForm.nib),
      nib: regForm.hasNIB ? regForm.nib : '-',
      penyelia_nama: 'Muslim Terverifikasi',
      skor: 20,
      status: 'Target Edukasi',
      kbli: true,
      permohonan: false,
      manual_sjph: false,
      daftar_bahan: false,
      surat_penyelia: false,
      ikrar_materai: false,
      sihalal: false
    };

    if (onRegisterNewMember) {
      onRegisterNewMember(newMemberData);
    }

    onLogin({
      role: 'member',
      memberId: newId,
      userName: newMemberData.nama,
      businessName: newMemberData.usaha
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nu-900 via-nu-950 to-slate-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Background Decorative Halal Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
      </div>

      <div className="relative max-w-xl w-full">
        
        {/* App Logo & Header Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-nu-800 to-nu-600 text-white shadow-xl shadow-nu-950/50 ring-4 ring-nu-500/30 mb-4">
            <svg className="w-10 h-10 text-amber-300 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z"/>
              <path d="M12 8v5" stroke="currentColor" strokeWidth="2.2"/>
              <circle cx="12" cy="15.5" r="0.7" fill="currentColor"/>
            </svg>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-nu-800/80 text-amber-300 border border-amber-400/30 uppercase tracking-widest">
              Portal Akses SIM-HALAL
            </span>
            <span className="text-xs text-emerald-300 font-semibold">
              PR Fatayat NU Desa Mersi
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sistem Informasi Manajemen Halal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
            Pendampingan Proses Produk Halal (PPH) Jalur <em>Self-Declare</em> BPJPH Kemenag RI
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Tab Selection Header (3 Pilihan: Member, Pengurus, Daftar Baru) */}
          <div className="grid grid-cols-3 bg-slate-100/80 p-1.5 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('member')}
              className={`min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${
                activeTab === 'member'
                  ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Pelaku Usaha</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${
                activeTab === 'admin'
                  ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-nu-700 flex-shrink-0" />
              <span>Pengurus Fatayat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`min-h-[44px] py-2.5 px-2 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center ${
                activeTab === 'register'
                  ? 'bg-white text-nu-900 shadow-sm font-extrabold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Daftar Baru</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* ========================================================================= */}
            {/* TAB 1: LOGIN SEBAGAI PELAKU USAHA (MEMBER UMKM)                           */}
            {/* Kalimat "Ruang Mandiri Pelaku Usaha UMKM..." telah dihapus sesuai request */}
            {/* ========================================================================= */}
            {activeTab === 'member' && (
              <form onSubmit={handleMemberSubmit} className="space-y-4">
                
                {memberError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                    {memberError}
                  </div>
                )}

                {/* 1. Pilih Nama Pelaku Usaha */}
                <div>
                  <label htmlFor="selectMemberAuth" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Ibu/Bapak atau Nama Usaha:
                  </label>
                  <div className="relative">
                    <select
                      id="selectMemberAuth"
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 hover:border-nu-500 text-slate-900 rounded-2xl p-3.5 focus:ring-2 focus:ring-nu-600/30 focus:border-nu-700 outline-none transition-all cursor-pointer"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama} &bull; {m.usaha} ({m.kategori})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Password / PIN Pelaku Usaha */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="memberPasswordInput" className="block text-xs font-bold text-slate-700">
                      Kata Sandi / PIN Pelaku Usaha:
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      PIN Standar: <strong className="text-nu-800 font-mono">123456</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="memberPasswordInput"
                      type={showMemberPass ? 'text' : 'password'}
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      placeholder="Masukkan PIN (standar: 123456)"
                      className="w-full text-xs sm:text-sm font-mono px-3.5 py-3 rounded-2xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPass(!showMemberPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showMemberPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Access Badges for Easy 1-Click Login */}
                <div className="pt-1">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Contoh Masuk Cepat (1-Klik):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickMemberLogin('FTY-001')}
                      className="min-h-[44px] text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">
                          Ibu Siti Aminah
                        </div>
                        <div className="text-[11px] text-slate-500">Keripik Tempe Barokah</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickMemberLogin('FTY-002')}
                      className="min-h-[44px] text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 group-hover:text-emerald-800">
                          Ibu Faizah
                        </div>
                        <div className="text-[11px] text-slate-500">Roti & Pastry Mersi</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-nu-800 hover:bg-nu-900 active:scale-98 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2"
                  >
                    <span>Buka Dashboard Mandiri Saya</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </div>

              </form>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: LOGIN SEBAGAI PENGURUS FATAYAT NU (ADMIN AKSES PENUH)               */}
            {/* ========================================================================= */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                
                <div className="p-4 bg-nu-50/80 border border-nu-200 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-nu-800 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-nu-950 leading-relaxed">
                    <strong className="block text-nu-900 font-extrabold mb-0.5">
                      Akses Penuh Pengurus & Pendamping PPH
                    </strong>
                    Membuka seluruh fitur: <strong>Tab 1 Ringkasan Eksekutif</strong>, monitoring 45 UMKM, grafik status, pemilihan bebas dropdown seluruh anggota, dan cetak berkas audit.
                  </div>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                    {adminError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username / Email Pengurus:
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="misal: pengurus.mersi"
                    className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi / PIN Pengurus:
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-nu-800 to-nu-700 hover:from-nu-900 hover:to-nu-800 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>Masuk sebagai Pengurus (Akses Penuh)</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername('pengurus.mersi');
                      setAdminPassword('fatayat2026');
                      handleAdminSubmit();
                    }}
                    className="text-xs font-bold text-nu-800 hover:text-nu-900 underline"
                  >
                    Klik di Sini untuk Masuk Cepat (Mode Demo Pengurus)
                  </button>
                </div>

              </form>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: DAFTAR AKUN BARU (REGISTRASI PESERTA UMKM)                         */}
            {/* ========================================================================= */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 leading-relaxed">
                  <strong className="block text-amber-900 font-extrabold mb-0.5">
                    Pendaftaran UMKM Binaan Baru Fatayat NU
                  </strong>
                  Isi data usaha Anda di Desa Mersi. Akun akan langsung dibuat dan Anda dapat mulai mengisi draf persyaratan halal.
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap Pemilik:
                    </label>
                    <input
                      type="text"
                      value={regForm.nama}
                      onChange={(e) => setRegForm({ ...regForm, nama: e.target.value })}
                      placeholder="contoh: Ibu Nurul Hidayah"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Usaha / Merek:
                    </label>
                    <input
                      type="text"
                      value={regForm.usaha}
                      onChange={(e) => setRegForm({ ...regForm, usaha: e.target.value })}
                      placeholder="contoh: Sambel Roa Mersi"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Produk:
                    </label>
                    <select
                      value={regForm.kategori}
                      onChange={(e) => setRegForm({ ...regForm, kategori: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    >
                      <option value="Kudapan Kering">Kudapan Kering / Keripik</option>
                      <option value="Makanan Basah">Makanan Basah / Roti</option>
                      <option value="Minuman">Minuman Segar / Jamu</option>
                      <option value="Olahan Sambal">Olahan Sambal / Bumbu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Aktif:
                    </label>
                    <input
                      type="text"
                      value={regForm.kontak}
                      onChange={(e) => setRegForm({ ...regForm, kontak: e.target.value })}
                      placeholder="081234567899"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Dapur / Produksi di Desa Mersi:
                  </label>
                  <input
                    type="text"
                    value={regForm.alamat}
                    onChange={(e) => setRegForm({ ...regForm, alamat: e.target.value })}
                    placeholder="contoh: RT 03 RW 02 Desa Mersi, Purwokerto Timur"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-nu-800 hover:bg-nu-900 text-white font-black text-sm transition-all shadow-md shadow-nu-900/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Daftarkan Usaha & Buka Dashboard Mandiri</span>
                </button>

              </form>
            )}

          </div>

          {/* Footer of Card */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <HeartHandshake className="w-4 h-4 text-nu-700" />
            <span>Fasilitasi Sertifikasi Halal Gratis (SEHATI) Fatayat NU Banyumas</span>
          </div>

        </div>

      </div>

    </div>
  );
}
