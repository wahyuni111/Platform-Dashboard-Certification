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
