/**
 * Client-side audit calculator untuk SIM-HALAL BPJPH Self-Declare
 * Menjamin kalkulasi real-time yang akurat sesuai aturan resmi 4 Pilar BPJPH.
 */

export function recalculateMemberClient(member) {
  if (!member) return null;

  const m = { ...member };

  // 1. KTP Pemilik selalu valid untuk anggota
  m.ktp_pemilik = true;
  
  // Validasi NIB
  const nibStr = String(m.nib || '').trim();
  m.has_valid_nib = Boolean(nibStr && nibStr !== '-' && nibStr.length >= 9);

  if (!m.penyelia_nama) {
    m.penyelia_nama = m.nama || 'Ahmad Fauzi';
  }

  // Pilar 1 (25%): 5 item x 5%
  let p1 = 0;
  if (m.ktp_pemilik) p1++;
  if (m.has_valid_nib) p1++;
  if (m.kbli) p1++;
  if (m.sihalal) p1++;
  if (m.permohonan) p1++;
  const scoreP1 = p1 * 5.0;

  // Pilar 2 (35%): 4 item x 8.75%
  let p2 = 0;
  if (m.daftar_bahan) p2++;
  if (m.bahan_nonkritis) p2++;
  if (m.bahan_kritis_halal) p2++;
  if (m.air_bersih) p2++;
  const scoreP2 = p2 * 8.75;

  // Pilar 3 (25%): 4 item x 6.25%
  let p3 = 0;
  if (m.dapur_bersih) p3++;
  if (m.alat_khusus) p3++;
  if (m.manual_sjph) p3++;
  if (m.kemasan_higienis) p3++;
  const scoreP3 = p3 * 6.25;

  // Pilar 4 (15%): 5 item x 3%
  let p4 = 0;
  if (m.penyelia_nama) p4++;
  if (m.penyelia_ktp) p4++;
  if (m.surat_penyelia) p4++;
  if (m.ikrar_materai) p4++;
  if (m.nama_layak) p4++;
  const scoreP4 = p4 * 3.0;

  let total = Math.round(scoreP1 + scoreP2 + scoreP3 + scoreP4);

  // Aturan Prasyarat NIB: Tanpa NIB valid, skor maksimal 45% (Belum Siap)
  if (!m.has_valid_nib && total > 45) {
    total = 45;
  }

  if (total < 0) total = 0;
  if (total > 100) total = 100;

  m.skor = total;

  if (m.skor >= 80) {
    m.status = 'Siap Daftar';
  } else if (m.skor >= 50) {
    m.status = 'Perlu Pendampingan';
  } else {
    m.status = 'Belum Siap';
  }

  // Update milestone journey
  m.journey_milestones = [
    {
      step: 1,
      title: 'Legalitas Usaha & KBLI',
      desc: 'KTP, NIB OSS, KBLI Pangan',
      done: Boolean(m.has_valid_nib && m.kbli)
    },
    {
      step: 2,
      title: 'Bahan Baku & Bumbu',
      desc: 'Positive List & Sertifikat Halal',
      done: Boolean(m.daftar_bahan && m.bahan_nonkritis)
    },
    {
      step: 3,
      title: 'Alur Proses & Dapur',
      desc: 'Sanitasi, Pemisahan Alat & SJPH',
      done: Boolean(m.dapur_bersih && m.alat_khusus && m.manual_sjph)
    },
    {
      step: 4,
      title: 'Penyelia & Ikrar Materai',
      desc: 'SK Penyelia & Ikrar Halal',
      done: Boolean(m.surat_penyelia && m.ikrar_materai)
    },
    {
      step: 5,
      title: 'Akun SIHALAL BPJPH',
      desc: 'ptsp.halal.go.id & Siap Sidang',
      done: Boolean(m.sihalal && m.permohonan && m.skor >= 80)
    }
  ];

  return m;
}

export function calculateStatsClient(members = []) {
  const total = members.length;
  if (total === 0) {
    return {
      total: 0,
      siap_daftar: 0,
      pendampingan: 0,
      belum_siap: 0,
      siap_daftar_pct: 0,
      pendampingan_pct: 0,
      belum_siap_pct: 0
    };
  }

  let siap = 0;
  let pendampingan = 0;
  let belum = 0;

  members.forEach((m) => {
    if (m.skor >= 80) siap++;
    else if (m.skor >= 50) pendampingan++;
    else belum++;
  });

  const calcPct = (count) => Math.round((count * 100) / total);

  return {
    total,
    siap_daftar: siap,
    pendampingan,
    belum_siap: belum,
    siap_daftar_pct: calcPct(siap),
    pendampingan_pct: calcPct(pendampingan),
    belum_siap_pct: calcPct(belum)
  };
}

export function calculateBottlenecksClient(members = []) {
  const total = members.length;
  if (total === 0) return [];

  let nibCount = 0;
  let bumbuCount = 0;
  let sjphCount = 0;
  let sihalalCount = 0;
  let ikrarCount = 0;

  members.forEach((m) => {
    const nibStr = String(m.nib || '').trim();
    const hasValidNib = Boolean(nibStr && nibStr !== '-' && nibStr.length >= 9);
    if (!hasValidNib) nibCount++;
    if (!m.bahan_kritis_halal) bumbuCount++;
    if (!m.manual_sjph) sjphCount++;
    if (!m.sihalal) sihalalCount++;
    if (!m.ikrar_materai) ikrarCount++;
  });

  const calcPct = (count) => Math.round((count * 100) / total);

  return [
    {
      label: 'NIB Belum Ada / Belum OSS-RBA',
      percent: calcPct(nibCount),
      count: nibCount,
      color: 'from-red-500 to-rose-600',
      dot: 'bg-red-500',
      note: 'Perlu fasilitasi pendampingan pembuatan akun OSS di balai desa.'
    },
    {
      label: 'Bukti Halal Bumbu Olahan Belum Lengkap',
      percent: calcPct(bumbuCount),
      count: bumbuCount,
      color: 'from-amber-500 to-orange-500',
      dot: 'bg-amber-500',
      note: 'Pengumpulan foto kemasan / nomor sertifikat halal bahan pabrikan.'
    },
    {
      label: 'Belum Ada Manual SJPH Tertulis (SOP PPH)',
      percent: calcPct(sjphCount),
      count: sjphCount,
      color: 'from-yellow-400 to-amber-500',
      dot: 'bg-yellow-500',
      note: 'Dibantu dengan formulir template SJPH standar Fatayat NU.'
    },
    {
      label: 'Akun SIHALAL Belum Aktif (ptsp.halal.go.id)',
      percent: calcPct(sihalalCount),
      count: sihalalCount,
      color: 'from-blue-500 to-indigo-600',
      dot: 'bg-blue-500',
      note: 'Registrasi email pemilik usaha dan sinkronisasi data NIB.'
    },
    {
      label: 'Belum Tanda Tangan Surat Ikrar Halal Bermaterai',
      percent: calcPct(ikrarCount),
      count: ikrarCount,
      color: 'from-emerald-500 to-green-700',
      dot: 'bg-emerald-500',
      note: 'Pemberian materai Rp10.000 dan penandatanganan kolektif ranting.'
    }
  ];
}

export function calculateCategoriesClient(members = []) {
  const total = members.length;
  if (total === 0) {
    return {
      labels: ['Kudapan Kering', 'Makanan Basah', 'Minuman'],
      data: [0, 0, 0],
      percentages: [0, 0, 0],
      colors: ['#1E4D2B', '#D97706', '#3B82F6']
    };
  }

  let kudapan = 0;
  let basah = 0;
  let minuman = 0;

  members.forEach((m) => {
    switch (m.kategori) {
      case 'Kudapan Kering':
        kudapan++;
        break;
      case 'Makanan Basah':
        basah++;
        break;
      case 'Minuman':
        minuman++;
        break;
      default:
        break;
    }
  });

  const calcPct = (count) => Math.round((count * 100) / total);

  return {
    labels: ['Kudapan Kering', 'Makanan Basah', 'Minuman'],
    data: [kudapan, basah, minuman],
    percentages: [calcPct(kudapan), calcPct(basah), calcPct(minuman)],
    colors: ['#1E4D2B', '#D97706', '#3B82F6']
  };
}
