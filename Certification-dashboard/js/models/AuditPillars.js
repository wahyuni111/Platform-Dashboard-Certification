/**
 * =============================================================================
 * DOMAIN MODEL: AUDIT PILLARS (Matriks 4 Pilar Standar SJPH BPJPH)
 * =============================================================================
 * Merepresentasikan skema kriteria audit resmi Sistem Jaminan Produk Halal (SJPH)
 * Kementerian Agama RI untuk jalur Self-Declare UMKM.
 */

class AuditPillars {
  /**
   * Mengembalikan konfigurasi lengkap 4 pilar beserta bobot dan item-itemnya
   */
  static getPillarsConfig() {
    return [
      {
        id: 1,
        title: "Pilar 1: Legalitas Usaha",
        subtitle: "Identitas resmi pelaku usaha mikro",
        weight: 25,
        badgeClass: "bg-nu-100 text-nu-800",
        items: [
          {
            key: "ktp_pemilik",
            title: "KTP Pemilik Usaha",
            check: (m) => true,
            passDesc: "KTP-el pemohon terlampir, warga Desa Mersi dan aktif.",
            failDesc: "KTP pemilik usaha belum terlampir."
          },
          {
            key: "nib",
            title: "NIB Berbasis OSS-RBA",
            check: (m) => m.hasValidNib,
            passDesc: (m) => `Nomor NIB: ${m.nib} terdaftar valid di OSS.`,
            failDesc: "Belum memiliki NIB / Perlu didaftarkan di OSS-RBA."
          },
          {
            key: "kbli",
            title: "Kode KBLI Sesuai Pangan Olahan",
            check: (m) => m.kbli,
            passDesc: "KBLI terdaftar sesuai kategori olahan pangan mikro.",
            failDesc: "KBLI belum sesuai dengan kategori olahan pangan halal."
          },
          {
            key: "sihalal",
            title: "Akun SIHALAL Aktif (ptsp.halal.go.id)",
            check: (m) => m.sihalal,
            passDesc: "Akun BPJPH aktif dan telah diverifikasi email.",
            failDesc: "Akun belum dibuat / belum diverifikasi di ptsp.halal.go.id."
          },
          {
            key: "permohonan",
            title: "Surat Permohonan Sertifikasi Halal",
            check: (m) => m.permohonan,
            passDesc: "Surat permohonan self-declare telah disiapkan.",
            failDesc: "Draf surat permohonan belum dibuat."
          }
        ]
      },
      {
        id: 2,
        title: "Pilar 2: Bahan Baku & Bumbu",
        subtitle: "Kepastian kehalalan komposisi pangan",
        weight: 35,
        badgeClass: "bg-amber-100 text-amber-800",
        items: [
          {
            key: "daftar_bahan",
            title: "Formulir Rincian Semua Bahan Baku",
            check: (m) => m.daftar_bahan,
            passDesc: "Daftar bahan baku & bahan pembantu terdokumentasi lengkap.",
            failDesc: "Belum merinci seluruh formula bahan baku."
          },
          {
            key: "bahan_nonkritis",
            title: "Verifikasi Bahan Non-Kritis (Positive List)",
            check: (m) => m.bahan_nonkritis,
            passDesc: "Bahan nabati murni (tepung, gula, garam, bumbu alami) verified.",
            failDesc: "Ada bahan yang belum jelas status non-kritisnya."
          },
          {
            key: "bahan_kritis_halal",
            title: "Bukti Sertifikat Halal Bahan Olahan Pabrikan",
            check: (m) => m.bahan_kritis_halal,
            passDesc: "Foto sertifikat halal bumbu/minyak/penyedap lengkap.",
            failDesc: "Belum ada bukti sertifikat halal bumbu olahan pabrik."
          },
          {
            key: "air_bersih",
            title: "Sumber Air Bersih Standar Pangan",
            check: (m) => m.air_bersih,
            passDesc: "Air sumur/PDAM jernih, tidak berbau, standar higiene pangan.",
            failDesc: "Kualitas air belum terverifikasi layak konsumsi."
          }
        ]
      },
      {
        id: 3,
        title: "Pilar 3: Alur Proses Halal (PPH)",
        subtitle: "Sanitasi, kebersihan dapur, & alat produksi",
        weight: 25,
        badgeClass: "bg-nu-100 text-nu-800",
        items: [
          {
            key: "dapur_bersih",
            title: "Dapur & Fasilitas Bersih Bebas Najis / Hewan",
            check: (m) => m.dapur_bersih,
            passDesc: "Area dapur higienis, tertutup, bebas najis/hewan peliharaan.",
            failDesc: "Dapur perlu dirapikan & dipastikan bebas dari najis."
          },
          {
            key: "alat_khusus",
            title: "Pemisahan Alat Masak Khusus Halal",
            check: (m) => m.alat_khusus,
            passDesc: "Wajan, pisau, dan wadah khusus hanya untuk produk halal.",
            failDesc: "Peralatan belum dipisahkan secara tegas."
          },
          {
            key: "manual_sjph",
            title: "Manual SJPH Sederhana Tertulis (SOP)",
            check: (m) => m.manual_sjph,
            passDesc: "Buku panduan komitmen halal sederhana telah diisi lengkap.",
            failDesc: "Manual SJPH belum disusun / belum diformalkan."
          },
          {
            key: "kemasan_higienis",
            title: "Kemasan Higienis & Tertutup Rapat",
            check: (m) => m.kemasan_higienis,
            passDesc: "Kemasan plastik food grade tertutup rapat (sealer/ziplock).",
            failDesc: "Kemasan masih terbuka dan rentan kontaminasi."
          }
        ]
      },
      {
        id: 4,
        title: "Pilar 4: SDM & Komitmen Halal",
        subtitle: "Penyelia halal & surat ikrar bermaterai",
        weight: 15,
        badgeClass: "bg-emerald-100 text-emerald-800",
        items: [
          {
            key: "penyelia_nama",
            title: "Nama Penyelia Halal (Wajib Beragama Islam)",
            check: (m) => Boolean(m.penyelia_nama),
            passDesc: (m) => `Penyelia ditunjuk: ${m.penyelia_nama} (Muslim).`,
            failDesc: "Belum menunjuk nama penyelia halal internal."
          },
          {
            key: "penyelia_ktp",
            title: "KTP Penyelia Halal Terlampir",
            check: (m) => m.penyelia_ktp,
            passDesc: "Salinan KTP penyelia telah diarsipkan pendamping.",
            failDesc: "Salinan KTP penyelia belum dikumpulkan."
          },
          {
            key: "surat_penyelia",
            title: "Surat Penetapan Penyelia Halal",
            check: (m) => m.surat_penyelia,
            passDesc: "SK Penetapan penyelia telah ditandatangani pelaku usaha.",
            failDesc: "Surat penetapan penyelia belum ditandatangani."
          },
          {
            key: "ikrar_materai",
            title: "Surat Pernyataan Ikrar Halal Bermaterai",
            check: (m) => m.ikrar_materai,
            passDesc: "Surat ikrar self-declare bermaterai Rp10.000 sah.",
            failDesc: "Surat ikrar belum bermaterai & belum ditandatangani."
          },
          {
            key: "nama_layak",
            title: "Nama Merek / Produk Bebas Konotasi Haram",
            check: (m) => m.nama_layak,
            passDesc: "Nama tidak mengandung unsur syaitan, miras, atau konotasi haram.",
            failDesc: "Nama merek mengandung istilah yang dilarang syariat."
          }
        ]
      }
    ];
  }

  /**
   * Menghasilkan daftar datar 18 indikator untuk lembar cetak laporan PDF
   * @param {Member} member 
   */
  static getFlatCriteriaList(member) {
    const pillars = this.getPillarsConfig();
    const flat = [];
    let counter = 1;

    pillars.forEach(pillar => {
      pillar.items.forEach(item => {
        const passed = item.check(member);
        flat.push({
          no: counter++,
          pilar: `Pilar ${pillar.id}`,
          title: item.title,
          passed: passed,
          desc: passed 
            ? (typeof item.passDesc === "function" ? item.passDesc(member) : item.passDesc)
            : item.failDesc
        });
      });
    });

    return flat;
  }
}

// Export ke namespace global
window.AuditPillars = AuditPillars;
