/**
 * =============================================================================
 * DOMAIN MODEL: MEMBER ENTITY (Pelaku Usaha Anggota Fatayat NU)
 * =============================================================================
 * Mengimplementasikan prinsip Object-Oriented Programming (OOP):
 * - Enkapsulasi data profil dan butir-butir audit 4 pilar.
 * - Getters untuk formatting kontak, nomor NIB, dan status tampilan.
 * - Method untuk memilah butir yang "Sudah Terlaksana" vs "Belum Terlaksana"
 *   lengkap dengan key indikator agar dapat di-toggle secara interaktif.
 * - Perhitungan alur Milestone Halal Journey untuk Dashboard Mandiri.
 */

class Member {
  /**
   * @param {Object} raw - Data mentah objek anggota
   */
  constructor(raw = {}) {
    this.id = raw.id || "FTY-000";
    this.nama = raw.nama || "";
    this.usaha = raw.usaha || "";
    this.kategori = raw.kategori || "Kudapan Kering";
    this.kontak = raw.kontak || "";
    this.alamat = raw.alamat || "Desa Mersi, Purwokerto Timur";
    this.nib = raw.nib || "-";
    
    // Pilar 1: Legalitas Usaha
    this.ktp_pemilik = true; // KTP-el warga Desa Mersi terverifikasi
    this.kbli = Boolean(raw.kbli);
    this.sihalal = Boolean(raw.sihalal);
    this.permohonan = Boolean(raw.permohonan);

    // Pilar 2: Bahan Baku & Bumbu
    this.daftar_bahan = Boolean(raw.daftar_bahan);
    this.bahan_nonkritis = Boolean(raw.bahan_nonkritis);
    this.bahan_kritis_halal = Boolean(raw.bahan_kritis_halal);
    this.air_bersih = Boolean(raw.air_bersih);

    // Pilar 3: Alur Proses Halal (PPH)
    this.dapur_bersih = Boolean(raw.dapur_bersih);
    this.alat_khusus = Boolean(raw.alat_khusus);
    this.manual_sjph = Boolean(raw.manual_sjph);
    this.kemasan_higienis = Boolean(raw.kemasan_higienis);

    // Pilar 4: SDM & Komitmen Halal
    this.penyelia_nama = raw.penyelia_nama || this.nama;
    this.penyelia_ktp = raw.penyelia_ktp !== undefined ? Boolean(raw.penyelia_ktp) : true;
    this.surat_penyelia = Boolean(raw.surat_penyelia);
    this.ikrar_materai = Boolean(raw.ikrar_materai);
    this.nama_layak = raw.nama_layak !== undefined ? Boolean(raw.nama_layak) : true;

    // Metrik Hasil Audit
    this.skor = typeof raw.skor === "number" ? raw.skor : 0;
    this.status = raw.status || "Belum Siap";
    this.hambatan = Array.isArray(raw.hambatan) ? [...raw.hambatan] : [];
  }

  // ===================== GETTERS =====================

  /**
   * Mengembalikan nomor telepon dalam format tampilan yang ramah (0812-3456-7890)
   */
  get formattedPhone() {
    if (!this.kontak) return "-";
    const clean = this.kontak.replace(/[^0-9]/g, "");
    if (clean.length === 12) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
    return this.kontak;
  }

  /**
   * Menghasilkan nomor telepon berawalan kode negara 62 untuk integrasi WhatsApp
   */
  get cleanPhoneForWhatsApp() {
    const clean = this.kontak.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      return "62" + clean.slice(1);
    }
    if (clean.startsWith("62")) {
      return clean;
    }
    return "62" + clean;
  }

  /**
   * Cek validitas nomor NIB
   */
  get hasValidNib() {
    return this.nib !== "-" && Boolean(this.nib) && this.nib.trim().length >= 9;
  }

  /**
   * Mengembalikan kelas warna badge status
   */
  get statusBadgeStyle() {
    if (this.skor >= 80) {
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        bar: "bg-gradient-to-r from-emerald-500 to-nu-700",
        text: "text-emerald-700",
        bgLight: "bg-emerald-50"
      };
    }
    if (this.skor >= 50) {
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        bar: "bg-gradient-to-r from-amber-500 to-amber-600",
        text: "text-amber-600",
        bgLight: "bg-amber-50"
      };
    }
    return {
      badge: "bg-red-100 text-red-800 border-red-300",
      bar: "bg-gradient-to-r from-red-500 to-rose-600",
      text: "text-red-600",
      bgLight: "bg-red-50"
    };
  }

  /**
   * Mengembalikan butir-butir syarat sertifikasi yang SUDAH TERLAKSANA [V]
   * @returns {Array}
   */
  get completedItems() {
    const list = [];
    if (this.ktp_pemilik) list.push({ key: "ktp_pemilik", pilar: "Pilar 1: Legalitas", label: "KTP Pemilik Usaha", desc: "KTP-el pemohon terlampir dan aktif." });
    if (this.hasValidNib) list.push({ key: "nib", pilar: "Pilar 1: Legalitas", label: "NIB OSS-RBA", desc: `Nomor NIB: ${this.nib} terdaftar resmi.` });
    if (this.kbli) list.push({ key: "kbli", pilar: "Pilar 1: Legalitas", label: "KBLI Pangan Olahan", desc: "Kode KBLI sesuai bidang pangan olahan." });
    if (this.sihalal) list.push({ key: "sihalal", pilar: "Pilar 1: Legalitas", label: "Akun SIHALAL", desc: "Akun BPJPH aktif di ptsp.halal.go.id." });
    if (this.permohonan) list.push({ key: "permohonan", pilar: "Pilar 1: Legalitas", label: "Surat Permohonan", desc: "Draf surat permohonan sertifikasi siap." });

    if (this.daftar_bahan) list.push({ key: "daftar_bahan", pilar: "Pilar 2: Bahan Baku", label: "Rincian Bahan Baku", desc: "Formula semua bahan telah didata lengkap." });
    if (this.bahan_nonkritis) list.push({ key: "bahan_nonkritis", pilar: "Pilar 2: Bahan Baku", label: "Bahan Non-Kritis", desc: "Komposisi nabati positive list verified." });
    if (this.bahan_kritis_halal) list.push({ key: "bahan_kritis_halal", pilar: "Pilar 2: Bahan Baku", label: "Sertifikat Halal Bumbu", desc: "Bukti sertifikat halal pabrikan telah disetor." });
    if (this.air_bersih) list.push({ key: "air_bersih", pilar: "Pilar 2: Bahan Baku", label: "Air Bersih Higienis", desc: "Sumber air bersih memenuhi standar pangan." });

    if (this.dapur_bersih) list.push({ key: "dapur_bersih", pilar: "Pilar 3: Proses PPH", label: "Sanitasi Dapur Produksi", desc: "Area dapur bersih dan bebas najis/hewan." });
    if (this.alat_khusus) list.push({ key: "alat_khusus", pilar: "Pilar 3: Proses PPH", label: "Pemisahan Alat Masak", desc: "Wajan & alat khusus pengolahan halal." });
    if (this.manual_sjph) list.push({ key: "manual_sjph", pilar: "Pilar 3: Proses PPH", label: "Manual SJPH Tertulis", desc: "SOP komitmen halal sederhana tersusun." });
    if (this.kemasan_higienis) list.push({ key: "kemasan_higienis", pilar: "Pilar 3: Proses PPH", label: "Kemasan Rapat Higienis", desc: "Kemasan tertutup rapat bebas kontaminasi." });

    if (this.penyelia_nama) list.push({ key: "penyelia_nama", pilar: "Pilar 4: Komitmen", label: "Penyelia Halal Muslim", desc: `Penyelia ditunjuk: ${this.penyelia_nama}.` });
    if (this.penyelia_ktp) list.push({ key: "penyelia_ktp", pilar: "Pilar 4: Komitmen", label: "Salinan KTP Penyelia", desc: "KTP penyelia telah diarsipkan pendamping." });
    if (this.surat_penyelia) list.push({ key: "surat_penyelia", pilar: "Pilar 4: Komitmen", label: "SK Penetapan Penyelia", desc: "Surat penetapan resmi telah ditandatangani." });
    if (this.ikrar_materai) list.push({ key: "ikrar_materai", pilar: "Pilar 4: Komitmen", label: "Ikrar Halal Bermaterai", desc: "Surat ikrar bermaterai Rp10.000 sah." });
    if (this.nama_layak) list.push({ key: "nama_layak", pilar: "Pilar 4: Komitmen", label: "Nama Merek Halal", desc: "Bebas dari konotasi haram/syaitan." });

    return list;
  }

  /**
   * Mengembalikan butir-butir syarat sertifikasi yang BELUM TERLAKSANA [X]
   * @returns {Array}
   */
  get pendingItems() {
    const list = [];
    if (!this.hasValidNib) list.push({ key: "nib", pilar: "Pilar 1: Legalitas", label: "Belum Ada NIB OSS-RBA", action: "Segera daftar NIB di portal oss.go.id dengan dibantu pendamping." });
    if (!this.kbli) list.push({ key: "kbli", pilar: "Pilar 1: Legalitas", label: "KBLI Belum Sesuai", action: "Ubah kode izin usaha ke KBLI pangan olahan/kudapan." });
    if (!this.sihalal) list.push({ key: "sihalal", pilar: "Pilar 1: Legalitas", label: "Akun SIHALAL Belum Aktif", action: "Buat akun di ptsp.halal.go.id menggunakan NIB pemilik." });
    if (!this.permohonan) list.push({ key: "permohonan", pilar: "Pilar 1: Legalitas", label: "Surat Permohonan Belum Dibuat", action: "Cetak formulir surat permohonan sertifikasi self-declare." });

    if (!this.daftar_bahan) list.push({ key: "daftar_bahan", pilar: "Pilar 2: Bahan Baku", label: "Rincian Bahan Belum Ditulis", action: "Tuliskan seluruh komposisi bahan dan bumbu dalam formulir." });
    if (!this.bahan_nonkritis) list.push({ key: "bahan_nonkritis", pilar: "Pilar 2: Bahan Baku", label: "Bahan Belum Terverifikasi", action: "Pastikan bahan nabati masuk daftar positive list Kemenag." });
    if (!this.bahan_kritis_halal) list.push({ key: "bahan_kritis_halal", pilar: "Pilar 2: Bahan Baku", label: "Bukti Halal Bumbu Kurang", action: "Kumpulkan foto kemasan/sertifikat halal bumbu olahan pabrik." });
    if (!this.air_bersih) list.push({ key: "air_bersih", pilar: "Pilar 2: Bahan Baku", label: "Sumber Air Perlu Dicek", action: "Pastikan air bebas bau dan layak standar higiene pangan." });

    if (!this.dapur_bersih) list.push({ key: "dapur_bersih", pilar: "Pilar 3: Proses PPH", label: "Sanitasi Dapur Perlu Dibenahi", action: "Bersihkan area dapur produksi agar terhindar dari najis/hewan." });
    if (!this.alat_khusus) list.push({ key: "alat_khusus", pilar: "Pilar 3: Proses PPH", label: "Alat Masak Belum Terpisah", action: "Sediakan wajan & pisau khusus hanya untuk produk halal." });
    if (!this.manual_sjph) list.push({ key: "manual_sjph", pilar: "Pilar 3: Proses PPH", label: "Manual SJPH Belum Disusun", action: "Isi formulir Manual SJPH sederhana panduan Fatayat NU." });
    if (!this.kemasan_higienis) list.push({ key: "kemasan_higienis", pilar: "Pilar 3: Proses PPH", label: "Kemasan Belum Tertutup Rapat", action: "Gunakan kemasan tertutup rapat untuk mencegah kontaminasi." });

    if (!this.penyelia_nama) list.push({ key: "penyelia_nama", pilar: "Pilar 4: Komitmen", label: "Penyelia Belum Ditunjuk", action: "Tunjuk salah satu pekerja/keluarga muslim sebagai penyelia." });
    if (!this.penyelia_ktp) list.push({ key: "penyelia_ktp", pilar: "Pilar 4: Komitmen", label: "Salinan KTP Penyelia Kurang", action: "Lampirkan fotokopi KTP penyelia halal." });
    if (!this.surat_penyelia) list.push({ key: "surat_penyelia", pilar: "Pilar 4: Komitmen", label: "Surat Penetapan Belum Ada", action: "Tandatangani SK Penetapan Penyelia Halal internal usaha." });
    if (!this.ikrar_materai) list.push({ key: "ikrar_materai", pilar: "Pilar 4: Komitmen", label: "Ikrar Halal Belum Bermaterai", action: "Bubuhkan materai Rp10.000 pada Surat Pernyataan Ikrar Halal." });
    if (!this.nama_layak) list.push({ key: "nama_layak", pilar: "Pilar 4: Komitmen", label: "Nama Merek Mengandung Konotasi Dilarang", action: "Sesuaikan nama merek agar bebas dari istilah yang dilarang." });

    return list;
  }

  /**
   * Menghitung status 5 tahapan Milestone Halal Journey untuk Dashboard Mandiri
   */
  get journeyMilestones() {
    const s1 = (this.ktp_pemilik && this.hasValidNib && this.kbli);
    const s2 = (this.daftar_bahan && this.bahan_nonkritis && this.bahan_kritis_halal && this.air_bersih);
    const s3 = (this.dapur_bersih && this.alat_khusus && this.manual_sjph && this.kemasan_higienis);
    const s4 = (Boolean(this.penyelia_nama) && this.surat_penyelia && this.ikrar_materai && this.nama_layak);
    const s5 = (this.sihalal && this.permohonan && this.skor >= 80);

    return [
      { step: 1, title: "Legalitas Usaha & KBLI", desc: "KTP, NIB OSS, KBLI Pangan", done: s1 },
      { step: 2, title: "Bahan Baku & Bumbu", desc: "Positive List & Sertifikat Halal", done: s2 },
      { step: 3, title: "Alur Proses & Dapur", desc: "Sanitasi, Pemisahan Alat & SJPH", done: s3 },
      { step: 4, title: "Penyelia & Ikrar Materai", desc: "SDM Muslim & Komitmen Halal", done: s4 },
      { step: 5, title: "Pengajuan Akun SIHALAL", desc: "ptsp.halal.go.id & Submit BPJPH", done: s5 }
    ];
  }

  // ===================== MUTATORS =====================

  /**
   * Melakukan toggle nilai field kriteria audit
   * @param {string} fieldKey 
   */
  toggleCriterion(fieldKey) {
    if (fieldKey === "nib") {
      this.nib = this.hasValidNib ? "-" : "1234567890123";
    } else if (Object.prototype.hasOwnProperty.call(this, fieldKey)) {
      this[fieldKey] = !this[fieldKey];
    }
  }

  clone() {
    return new Member(JSON.parse(JSON.stringify(this)));
  }
}

// Export ke namespace global
window.Member = Member;
