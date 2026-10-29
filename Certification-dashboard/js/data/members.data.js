/**
 * =============================================================================
 * DATA LAYER: DATASET MASTER 45 UMKM FATAYAT NU DESA MERSI
 * =============================================================================
 * File ini mengisolasi seluruh data mentah aplikasi agar mudah dipelihara (maintainable),
 * diperbarui, atau diintegrasikan dengan REST API / Database di masa mendatang.
 *
 * Menggabungkan 4 data primer spesifik dari instruksi dan 41 data realistis anggota
 * ranting (Total: 45 Unit Usaha: 14 Siap Daftar, 22 Perlu Pendampingan, 9 Belum Siap).
 */

const RAW_MEMBERS_DATA = [
  {
    id: "FTY-001",
    nama: "Siti Aminah",
    usaha: "Keripik Tempe Barokah",
    kategori: "Kudapan Kering",
    kontak: "081234567801",
    alamat: "RT 02 RW 01 Desa Mersi",
    nib: "1234567890123",
    kbli: true,
    sihalal: false,
    permohonan: false,
    daftar_bahan: true,
    bahan_nonkritis: true,
    bahan_kritis_halal: false,
    air_bersih: true,
    dapur_bersih: true,
    alat_khusus: true,
    manual_sjph: false,
    kemasan_higienis: true,
    penyelia_nama: "Ahmad Fauzi",
    penyelia_ktp: true,
    surat_penyelia: true,
    ikrar_materai: false,
    nama_layak: true,
    skor: 70,
    status: "Perlu Pendampingan",
    hambatan: [
      "Akun SIHALAL belum dibuat di ptsp.halal.go.id",
      "Bukti halal tepung beras/penyedap belum disetor",
      "Manual SJPH belum disusun",
      "Surat ikrar belum ditandatangani bermaterai"
    ]
  },
  {
    id: "FTY-002",
    nama: "Nur Hidayah",
    usaha: "Dapur Ibu Nur (Kue Basah & Lemper)",
    kategori: "Makanan Basah",
    kontak: "081234567802",
    alamat: "RT 01 RW 02 Desa Mersi",
    nib: "9876543210987",
    kbli: true,
    sihalal: true,
    permohonan: true,
    daftar_bahan: true,
    bahan_nonkritis: true,
    bahan_kritis_halal: true,
    air_bersih: true,
    dapur_bersih: true,
    alat_khusus: true,
    manual_sjph: true,
    kemasan_higienis: true,
    penyelia_nama: "Nur Hidayah",
    penyelia_ktp: true,
    surat_penyelia: true,
    ikrar_materai: true,
    nama_layak: true,
    skor: 95,
    status: "Siap Daftar",
    hambatan: []
  },
  {
    id: "FTY-003",
    nama: "Khotimatun",
    usaha: "Rempeyek Mbak Khotim",
    kategori: "Kudapan Kering",
    kontak: "081234567803",
    alamat: "RT 03 RW 01 Desa Mersi",
    nib: "-",
    kbli: false,
    sihalal: false,
    permohonan: false,
    daftar_bahan: true,
    bahan_nonkritis: true,
    bahan_kritis_halal: false,
    air_bersih: true,
    dapur_bersih: true,
    alat_khusus: true,
    manual_sjph: false,
    kemasan_higienis: true,
    penyelia_nama: "Khotimatun",
    penyelia_ktp: true,
    surat_penyelia: false,
    ikrar_materai: false,
    nama_layak: true,
    skor: 40,
    status: "Belum Siap",
    hambatan: [
      "Belum memiliki NIB OSS-RBA",
      "Belum ada akun SIHALAL",
      "Bukti sertifikat minyak & bumbu belum ada",
      "Manual SJPH dan Ikrar Halal belum dibuat"
    ]
  },
  {
    id: "FTY-004",
    nama: "Tri Wahyuni",
    usaha: "Jamu Beras Kencur Tradisional Mersi",
    kategori: "Minuman",
    kontak: "081234567804",
    alamat: "RT 04 RW 03 Desa Mersi",
    nib: "5432167890123",
    kbli: true,
    sihalal: true,
    permohonan: true,
    daftar_bahan: true,
    bahan_nonkritis: true,
    bahan_kritis_halal: true,
    air_bersih: true,
    dapur_bersih: true,
    alat_khusus: true,
    manual_sjph: true,
    kemasan_higienis: true,
    penyelia_nama: "Bambang S",
    penyelia_ktp: true,
    surat_penyelia: true,
    ikrar_materai: true,
    nama_layak: true,
    skor: 100,
    status: "Siap Daftar",
    hambatan: []
  }
];

// Data tambahan realistis anggota Fatayat NU Desa Mersi (FTY-005 s/d FTY-045)
const ADDITIONAL_MEMBERS_CONFIG = [
  // 12 Siap Daftar (Total Siap Daftar jadi 14)
  { nama: "Hj. Mutmainah", usaha: "Getuk Goreng Rasa Berkah", kat: "Kudapan Kering", skor: 90, stat: "Siap Daftar" },
  { nama: "Siti Fatimah", usaha: "Kue Lapis Legit Mersi", kat: "Makanan Basah", skor: 85, stat: "Siap Daftar" },
  { nama: "Endang Supriyati", usaha: "Keripik Pisang Tanduk Gurih", kat: "Kudapan Kering", skor: 95, stat: "Siap Daftar" },
  { nama: "Sri Rahayu", usaha: "Sirup Jahe Rempah Mersi", kat: "Minuman", skor: 90, stat: "Siap Daftar" },
  { nama: "Mar'atus Sholihah", usaha: "Bakpia Pathok Barokah Mersi", kat: "Kudapan Kering", skor: 85, stat: "Siap Daftar" },
  { nama: "Dwi Astuti", usaha: "Kacang Bawang Renyah RT 02", kat: "Kudapan Kering", skor: 90, stat: "Siap Daftar" },
  { nama: "Rohmatun Nisa", usaha: "Brownies Kukus Cokelat Lumer", kat: "Makanan Basah", skor: 85, stat: "Siap Daftar" },
  { nama: "Budi Lestari", usaha: "Kerupuk Tenggiri Mersi", kat: "Kudapan Kering", skor: 95, stat: "Siap Daftar" },
  { nama: "Umi Salamah", usaha: "Kue Talam & Putu Ayu Mbak Umi", kat: "Makanan Basah", skor: 90, stat: "Siap Daftar" },
  { nama: "Wartini", usaha: "Stik Bawang Daun Mersi", kat: "Kudapan Kering", skor: 85, stat: "Siap Daftar" },
  { nama: "Yuliana", usaha: "Puding Buah Segar Ny. Yuli", kat: "Makanan Basah", skor: 85, stat: "Siap Daftar" },
  { nama: "Muntamah", usaha: "Sambel Pecel Khas Mersi", kat: "Kudapan Kering", skor: 100, stat: "Siap Daftar" },

  // 21 Perlu Pendampingan (Total Pendampingan jadi 22)
  { nama: "Kusmiati", usaha: "Kue Cubit & Pancong Barokah", kat: "Makanan Basah", skor: 75, stat: "Perlu Pendampingan" },
  { nama: "Titik Nurjanah", usaha: "Keripik Singkong Balado", kat: "Kudapan Kering", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Sulastri", usaha: "Nagasari & Mendut Mbak Las", kat: "Makanan Basah", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Wakhidah", usaha: "Kembang Goyang Manis Gurih", kat: "Kudapan Kering", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Siti Maryam", usaha: "Pastel Abon Renyah Mersi", kat: "Kudapan Kering", skor: 75, stat: "Perlu Pendampingan" },
  { nama: "Suparni", usaha: "Kue Lumpur Kentang Istimewa", kat: "Makanan Basah", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Zubaedah", usaha: "Dawet Ayu Gula Aren Mersi", kat: "Minuman", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Kuswati", usaha: "Arem-arem Isi Daging Ayam", kat: "Makanan Basah", skor: 60, stat: "Perlu Pendampingan" },
  { nama: "Sunarti", usaha: "Enting-enting Wijen Barokah", kat: "Kudapan Kering", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Rini Handayani", usaha: "Bolu Gulung Pandan Mersi", kat: "Makanan Basah", skor: 75, stat: "Perlu Pendampingan" },
  { nama: "Masitoh", usaha: "Sale Pisang Basah Manis", kat: "Kudapan Kering", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Uswatun Hasanah", usaha: "Kue Sus Fla Vanila Mersi", kat: "Makanan Basah", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Mursidah", usaha: "Kacang Telur Gurih Mbak Mur", kat: "Kudapan Kering", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Chamidah", usaha: "Kerupuk Bawang Renyah Mersi", kat: "Kudapan Kering", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Suwarti", usaha: "Keripik Talas Gurih", kat: "Kudapan Kering", skor: 60, stat: "Perlu Pendampingan" },
  { nama: "Ropingah", usaha: "Risol Mayo Segar Dapur Ropi", kat: "Makanan Basah", skor: 75, stat: "Perlu Pendampingan" },
  { nama: "Kasiati", usaha: "Keripik Sukun Gurih Mersi", kat: "Kudapan Kering", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Muslikhah", usaha: "Kacang Madu Gurih Mersi", kat: "Kudapan Kering", skor: 70, stat: "Perlu Pendampingan" },
  { nama: "Siti Mu'awanah", usaha: "Peyek Rebon Renyah", kat: "Kudapan Kering", skor: 75, stat: "Perlu Pendampingan" },
  { nama: "Alifah", usaha: "Kue Semprit Mentega Barokah", kat: "Kudapan Kering", skor: 65, stat: "Perlu Pendampingan" },
  { nama: "Wiji Rahayu", usaha: "Kue Apem Kukus Menul", kat: "Makanan Basah", skor: 70, stat: "Perlu Pendampingan" },

  // 8 Belum Siap (Total Belum Siap jadi 9)
  { nama: "Partini", usaha: "Keripik Tahu Renyah Mersi", kat: "Kudapan Kering", skor: 35, stat: "Belum Siap" },
  { nama: "Sumiyati", usaha: "Krupuk Rambak Bawang Mersi", kat: "Kudapan Kering", skor: 40, stat: "Belum Siap" },
  { nama: "Sudarmi", usaha: "Es Lilin Kacang Hijau", kat: "Minuman", skor: 45, stat: "Belum Siap" },
  { nama: "Tarminah", usaha: "Leker Crispy Manis", kat: "Kudapan Kering", skor: 30, stat: "Belum Siap" },
  { nama: "Sukesi", usaha: "Tape Ketan Daun Jambu", kat: "Makanan Basah", skor: 45, stat: "Belum Siap" },
  { nama: "Karsinah", usaha: "Kue Pukis Tradisional", kat: "Makanan Basah", skor: 35, stat: "Belum Siap" },
  { nama: "Mundiroh", usaha: "Peyek Teri Asin Mersi", kat: "Kudapan Kering", skor: 40, stat: "Belum Siap" },
  { nama: "Khotijah", usaha: "Serabi Solo Santan Manis", kat: "Makanan Basah", skor: 45, stat: "Belum Siap" }
];

// Inisialisasi penggabungan dataset ke format objek
function buildFullDataset() {
  const dataset = JSON.parse(JSON.stringify(RAW_MEMBERS_DATA));
  let count = 5;

  ADDITIONAL_MEMBERS_CONFIG.forEach(item => {
    const padId = String(count).padStart(3, "0");
    const isSiap = item.stat === "Siap Daftar";
    const isPendampingan = item.stat === "Perlu Pendampingan";

    dataset.push({
      id: `FTY-${padId}`,
      nama: item.nama,
      usaha: item.usaha,
      kategori: item.kat,
      kontak: `081234567${padId}`,
      alamat: `RT 0${(count % 5) + 1} RW 0${(count % 3) + 1} Desa Mersi`,
      nib: isSiap || isPendampingan ? `820349281${padId}` : "-",
      kbli: isSiap || isPendampingan,
      sihalal: isSiap,
      permohonan: isSiap,
      daftar_bahan: true,
      bahan_nonkritis: true,
      bahan_kritis_halal: isSiap,
      air_bersih: true,
      dapur_bersih: isSiap || isPendampingan,
      alat_khusus: isSiap || isPendampingan,
      manual_sjph: isSiap,
      kemasan_higienis: true,
      penyelia_nama: item.nama,
      penyelia_ktp: true,
      surat_penyelia: isSiap || isPendampingan,
      ikrar_materai: isSiap,
      nama_layak: true,
      skor: item.skor,
      status: item.stat,
      hambatan: isSiap ? [] : (isPendampingan 
        ? ["Akun SIHALAL perlu diaktifkan di portal BPJPH", "Kumpulkan foto sertifikat halal bumbu olahan", "Manual SJPH perlu difinalkan"]
        : ["Belum memiliki NIB OSS-RBA", "Belum ada akun SIHALAL", "Bukti halal bahan belum lengkap", "Manual SJPH dan Ikrar belum ada"]
      )
    });
    count++;
  });

  return dataset;
}

// Data Metrik Bottleneck (Persentase Hambatan Terbesar)
const BOTTLENECK_STATS = [
  { label: "NIB Belum Ada / Belum OSS-RBA", percent: 65, count: 29, color: "from-red-500 to-rose-600", dot: "bg-red-500", note: "Perlu fasilitasi pendampingan pembuatan akun OSS di balai desa." },
  { label: "Bukti Halal Bumbu Olahan Belum Lengkap", percent: 55, count: 25, color: "from-amber-500 to-orange-500", dot: "bg-amber-500", note: "Pengumpulan foto kemasan / nomor sertifikat halal bahan pabrikan." },
  { label: "Belum Ada Manual SJPH Tertulis (SOP PPH)", percent: 45, count: 20, color: "from-yellow-400 to-amber-500", dot: "bg-yellow-500", note: "Dibantu dengan formulir template SJPH standar Fatayat NU." },
  { label: "Akun SIHALAL Belum Aktif (ptsp.halal.go.id)", percent: 30, count: 14, color: "from-blue-500 to-indigo-600", dot: "bg-blue-500", note: "Registrasi email pemilik usaha dan sinkronisasi data NIB." },
  { label: "Belum Tanda Tangan Surat Ikrar Halal Bermaterai", percent: 20, count: 9, color: "from-emerald-500 to-nu-700", dot: "bg-emerald-500", note: "Pemberian materai Rp10.000 dan penandatanganan kolektif ranting." }
];

// Data Distribusi Kategori Produk
const PRODUCT_CATEGORIES_DATA = {
  labels: ["Kudapan Kering", "Makanan Basah", "Minuman"],
  data: [25, 16, 4],
  percentages: [55, 35, 10],
  colors: ["#1E4D2B", "#D97706", "#3B82F6"]
};

// Export ke namespace global window agar kompatibel dengan sistem browser modular
window.SimHalalData = {
  getMembers: buildFullDataset,
  bottlenecks: BOTTLENECK_STATS,
  categories: PRODUCT_CATEGORIES_DATA
};
