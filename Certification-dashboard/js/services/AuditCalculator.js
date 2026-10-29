/**
 * =============================================================================
 * SERVICE: AUDIT CALCULATOR
 * =============================================================================
 * Bertanggung jawab khusus (Single Responsibility Principle) atas perhitungan
 * matematis bobot resmi SJPH BPJPH, penetapan status kelayakan, analisis
 * titik hambatan (bottlenecks), dan agregat metrik KPI secara dinamis.
 */

class AuditCalculator {
  /**
   * Menghitung skor total terbobot anggota (0 - 100%) dan memperbarui statusnya
   * @param {Member} member 
   * @returns {Member} Objek member yang telah diperbarui
   */
  static calculate(member) {
    if (!member) return null;

    // Pilar 1 (Bobot 25%): 5 item x 5%
    const p1PassedCount = 
      (member.ktp_pemilik ? 1 : 0) +
      (member.hasValidNib ? 1 : 0) +
      (member.kbli ? 1 : 0) +
      (member.sihalal ? 1 : 0) +
      (member.permohonan ? 1 : 0);
    const p1Score = p1PassedCount * 5;

    // Pilar 2 (Bobot 35%): 4 item x 8.75%
    const p2PassedCount = 
      (member.daftar_bahan ? 1 : 0) +
      (member.bahan_nonkritis ? 1 : 0) +
      (member.bahan_kritis_halal ? 1 : 0) +
      (member.air_bersih ? 1 : 0);
    const p2Score = p2PassedCount * 8.75;

    // Pilar 3 (Bobot 25%): 4 item x 6.25%
    const p3PassedCount = 
      (member.dapur_bersih ? 1 : 0) +
      (member.alat_khusus ? 1 : 0) +
      (member.manual_sjph ? 1 : 0) +
      (member.kemasan_higienis ? 1 : 0);
    const p3Score = p3PassedCount * 6.25;

    // Pilar 4 (Bobot 15%): 5 item x 3%
    const p4PassedCount = 
      (Boolean(member.penyelia_nama) ? 1 : 0) +
      (member.penyelia_ktp ? 1 : 0) +
      (member.surat_penyelia ? 1 : 0) +
      (member.ikrar_materai ? 1 : 0) +
      (member.nama_layak ? 1 : 0);
    const p4Score = p4PassedCount * 3;

    // Total Skor (0 - 100%)
    let rawTotal = Math.round(p1Score + p2Score + p3Score + p4Score);

    // Regulasi Resmi BPJPH Self-Declare: Tanpa NIB OSS-RBA, usaha belum memiliki legalitas usaha
    // sehingga belum memenuhi kriteria dasar pendaftaran dan berstatus "Belum Siap" (< 50%)
    if (!member.hasValidNib) {
      rawTotal = Math.min(45, rawTotal);
    }

    member.skor = Math.min(100, Math.max(0, rawTotal));

    // Klasifikasi Status Kelayakan Resmi BPJPH
    if (member.skor >= 80) {
      member.status = "Siap Daftar";
    } else if (member.skor >= 50) {
      member.status = "Perlu Pendampingan";
    } else {
      member.status = "Belum Siap";
    }

    // Bangun Rekomendasi Dokumen Hambatan
    member.hambatan = this.buildActionRecommendations(member);

    return member;
  }

  /**
   * Menyusun daftar rekomendasi butir yang bernilai [X] (kurang)
   * @param {Member} member 
   * @returns {string[]}
   */
  static buildActionRecommendations(member) {
    const list = [];

    if (!member.hasValidNib) {
      list.push("Segera buat NIB (Nomor Induk Berusaha) berbasis OSS-RBA melalui oss.go.id");
    }
    if (!member.kbli) {
      list.push("Sesuaikan kode KBLI izin usaha ke bidang olahan pangan/kudapan");
    }
    if (!member.sihalal) {
      list.push("Buat & aktivasi akun SIHALAL di portal ptsp.halal.go.id menggunakan NIB pemohon");
    }
    if (!member.permohonan) {
      list.push("Lengkapi draf Surat Permohonan Sertifikasi Halal jalur self-declare");
    }
    if (!member.bahan_kritis_halal) {
      list.push("Kumpulkan foto label/nomor sertifikat halal kemasan bumbu olahan pabrikan");
    }
    if (!member.dapur_bersih) {
      list.push("Lakukan pembersihan dapur produksi agar higienis dan bebas najis/hewan");
    }
    if (!member.alat_khusus) {
      list.push("Pisahkan peralatan masak dan wadah khusus untuk pengolahan bahan halal");
    }
    if (!member.manual_sjph) {
      list.push("Susun dokumen Manual SJPH sederhana format panduan Fatayat NU");
    }
    if (!member.kemasan_higienis) {
      list.push("Gunakan kemasan tertutup rapat untuk mencegah kontaminasi silang");
    }
    if (!member.penyelia_nama) {
      list.push("Tunjuk salah seorang anggota keluarga/karyawan muslim sebagai penyelia halal");
    }
    if (!member.penyelia_ktp) {
      list.push("Lampirkan salinan KTP penyelia halal yang masih berlaku");
    }
    if (!member.surat_penyelia) {
      list.push("Buat Surat Keputusan (SK) Penetapan Penyelia Halal internal usaha");
    }
    if (!member.ikrar_materai) {
      list.push("Tandatangani Surat Pernyataan Ikrar Halal bermaterai Rp10.000 (Self-Declare)");
    }
    if (!member.nama_layak) {
      list.push("Sesuaikan nama produk/merek agar bebas dari unsur/istilah yang diharamkan");
    }

    return list;
  }

  /**
   * Menghitung metrik agregat KPI untuk kumpulan anggota terfilter
   * @param {Member[]} members - Array anggota terfilter
   * @returns {Object} { total, ready, readyPct, needHelp, needHelpPct, notReady, notReadyPct }
   */
  static computeAggregates(members = []) {
    const total = members.length;
    if (total === 0) {
      return {
        total: 0,
        ready: 0,
        readyPct: 0,
        needHelp: 0,
        needHelpPct: 0,
        notReady: 0,
        notReadyPct: 0
      };
    }

    const ready = members.filter(m => m.skor >= 80).length;
    const needHelp = members.filter(m => m.skor >= 50 && m.skor < 80).length;
    const notReady = members.filter(m => m.skor < 50).length;

    return {
      total,
      ready,
      readyPct: Math.round((ready / total) * 100),
      needHelp,
      needHelpPct: Math.round((needHelp / total) * 100),
      notReady,
      notReadyPct: Math.round((notReady / total) * 100)
    };
  }

  /**
   * Menghitung persentase titik hambatan (bottleneck) secara dinamis dari anggota terfilter
   * @param {Member[]} members - Array anggota terfilter
   * @returns {Array} Daftar hambatan dengan persentase dan warna bar
   */
  static computeBottlenecks(members = []) {
    const total = members.length;
    if (total === 0) return [];

    const noNibCount = members.filter(m => !m.hasValidNib).length;
    const noBumbuCount = members.filter(m => !m.bahan_kritis_halal).length;
    const noSjphCount = members.filter(m => !m.manual_sjph).length;
    const noSihalalCount = members.filter(m => !m.sihalal).length;
    const noIkrarCount = members.filter(m => !m.ikrar_materai).length;

    const roundPct = (count) => Math.round((count / total) * 100);

    return [
      {
        id: "nib",
        label: "NIB Belum Ada (OSS-RBA)",
        count: noNibCount,
        percent: roundPct(noNibCount),
        barColor: "from-red-500 to-rose-600",
        dot: "bg-red-500",
        note: "Kendala utama: Pelaku usaha mikro belum memahami pendaftaran izin usaha OSS."
      },
      {
        id: "bumbu",
        label: "Bukti Halal Bumbu Olahan Belum Lengkap",
        count: noBumbuCount,
        percent: roundPct(noBumbuCount),
        barColor: "from-amber-500 to-orange-500",
        dot: "bg-amber-500",
        note: "Bumbu racik curah atau saus belum memiliki nomor sertifikat halal pabrikan."
      },
      {
        id: "sjph",
        label: "Belum Ada Manual SJPH Tertulis (SOP)",
        count: noSjphCount,
        percent: roundPct(noSjphCount),
        barColor: "from-amber-400 to-yellow-500",
        dot: "bg-amber-400",
        note: "Perlu bimbingan pengisian formulir SOP sistem jaminan produk halal sederhana."
      },
      {
        id: "sihalal",
        label: "Akun SIHALAL Belum Aktif (ptsp.halal.go.id)",
        count: noSihalalCount,
        percent: roundPct(noSihalalCount),
        barColor: "from-blue-500 to-indigo-600",
        dot: "bg-blue-500",
        note: "Membutuhkan NIB dan email aktif sebelum registrasi di portal BPJPH."
      },
      {
        id: "ikrar",
        label: "Belum TTD Ikrar Halal Bermaterai",
        count: noIkrarCount,
        percent: roundPct(noIkrarCount),
        barColor: "from-slate-500 to-slate-700",
        dot: "bg-slate-500",
        note: "Format surat pernyataan pernyataan halal self-declare bermaterai Rp10.000."
      }
    ];
  }
}

// Export ke namespace global
window.AuditCalculator = AuditCalculator;
