/**
 * Generator template berkas resmi SIM-HALAL Fatayat NU Desa Mersi
 * Menghasilkan file Word (.doc/docx compatible) dan Excel (.csv/xls) yang langsung
 * bisa diunduh dan diedit oleh pelaku usaha UMKM.
 */

export function downloadPermohonanTemplate(member = {}) {
  const memberName = member.nama || 'Ibu Pelaku Usaha';
  const businessName = member.usaha || 'UMKM Binaan Fatayat NU';
  const category = member.kategori || 'Olahan Pangan / Kudapan';
  const address = member.alamat || 'Desa Mersi, Kec. Purwokerto Timur';
  const nib = member.nib || '.....................';

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Permohonan Sertifikasi Halal BPJPH</title>
<style>
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
  .kop { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  td { padding: 4px 6px; vertical-align: top; }
  .ttd-box { margin-top: 40px; }
</style>
</head>
<body>

<div class="kop text-center">
  <h3 style="margin:0; text-transform:uppercase;">FORMULIR PERMOHONAN SERTIFIKASI HALAL</h3>
  <h4 style="margin:4px 0; font-weight:normal;">BADAN PENYELENGGARA JAMINAN PRODUK HALAL (BPJPH) KEMENAG RI</h4>
  <p style="margin:0; font-size:10pt;">JALUR PERNYATAAN PELAKU USAHA (SELF-DECLARE) - PENDAMPINGAN FATAYAT NU MERSI</p>
</div>

<p class="text-right">Banyumas, ......................... 2026</p>

<p>
Kepada Yth.<br>
<strong>Kepala BPJPH Kementerian Agama RI</strong><br>
c.q. Pendamping PPH Pimpinan Ranting Fatayat NU Desa Mersi<br>
di Tempat
</p>

<p>Dengan hormat,<br>
Yang bertanda tangan di bawah ini:</p>

<table>
  <tr>
    <td style="width: 200px;">1. Nama Pelaku Usaha</td>
    <td style="width: 20px;">:</td>
    <td><strong>${memberName}</strong></td>
  </tr>
  <tr>
    <td>2. Nama Usaha / Merek</td>
    <td>:</td>
    <td><strong>${businessName}</strong></td>
  </tr>
  <tr>
    <td>3. Nomor Induk Berusaha (NIB)</td>
    <td>:</td>
    <td><strong>${nib}</strong></td>
  </tr>
  <tr>
    <td>4. Jenis Produk / Kategori</td>
    <td>:</td>
    <td>${category}</td>
  </tr>
  <tr>
    <td>5. Alamat Tempat Produksi</td>
    <td>:</td>
    <td>${address}</td>
  </tr>
  <tr>
    <td>6. Nomor WhatsApp / Kontak</td>
    <td>:</td>
    <td>${member.kontak || '08....................'}</td>
  </tr>
</table>

<p style="margin-top: 15px; text-align: justify;">
Dengan ini mengajukan permohonan penerbitan <strong>Sertifikat Halal</strong> melalui program Sehati (Sertifikasi Halal Gratis) Jalur Self-Declare. Bersama surat ini kami lampirkan:
</p>

<ol>
  <li>Salinan NIB berbasis OSS-RBA dan KTP Pelaku Usaha;</li>
  <li>Daftar Rincian Bahan Baku dan Bumbu Olahan;</li>
  <li>Dokumen Manual SJPH Sederhana Standar Fatayat NU;</li>
  <li>Surat Penetapan Penyelia Halal dan Salinan KTP Penyelia Muslim;</li>
  <li>Surat Pernyataan Bebas Najis & Ikrar Halal Bermaterai Rp10.000.</li>
</ol>

<p>Demikian surat permohonan ini dibuat dengan sebenar-benarnya untuk diproses sesuai ketentuan syariat dan perundang-undangan.</p>

<div class="ttd-box">
  <table style="width: 100%;">
    <tr>
      <td style="width: 50%; text-align: center;">
        Mengetahui,<br>
        Pendamping Halal PPH Fatayat NU
        <div style="height: 70px;"></div>
        ( .................................................. )
      </td>
      <td style="width: 50%; text-align: center;">
        Pemohon Pelaku Usaha,
        <div style="height: 70px;"></div>
        <strong>( ${memberName} )</strong><br>
        <em>${businessName}</em>
      </td>
    </tr>
  </table>
</div>

</body>
</html>`;

  triggerDownload(content, `Draf_Surat_Permohonan_Sertifikasi_Halal_${cleanFilename(memberName)}.doc`, 'application/msword');
}

export function downloadPanduanSJPH(member = {}) {
  const memberName = member.nama || 'Pelaku Usaha';
  const businessName = member.usaha || 'Keripik Tempe Barokah';

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Panduan Manual SJPH Sederhana - Fatayat NU</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 2.5cm; }
  h2, h3 { color: #143D1F; }
  .box { border: 1px solid #1E4D2B; background: #EBF3ED; padding: 12px; border-radius: 6px; margin: 15px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  th { background: #143D1F; color: white; }
</style>
</head>
<body>

<div style="text-align: center; border-bottom: 2px solid #143D1F; padding-bottom: 10px;">
  <h2>MANUAL SISTEM JAMINAN PRODUK HALAL (SJPH) SEDERHANA</h2>
  <h3>UNTUK USAHA MIKRO DAN KECIL (JALUR SELF-DECLARE BPJPH)</h3>
  <p><strong>Pimpinan Ranting Fatayat NU Desa Mersi - Purwokerto Timur</strong></p>
</div>

<div class="box">
  <strong>Identitas Pelaku Usaha:</strong><br>
  Nama Usaha: <strong>${businessName}</strong><br>
  Nama Pemilik: <strong>${memberName}</strong><br>
  Alamat Dapur: ${member.alamat || 'Desa Mersi'}<br>
  Penyelia Halal: ${member.penyelia_nama || 'Muslim Terverifikasi'}
</div>

<h3>I. KOMITMEN KEBIJAKAN HALAL</h3>
<p>
Kami berkomitmen secara sungguh-sungguh untuk:
<ol>
  <li>Hanya memproduksi pangan yang halal, suci, higienis, dan tidak membahayakan kesehatan (Thayyib).</li>
  <li>Hanya menggunakan bahan baku, bahan tambahan, dan bahan penolong yang bersumber halal dan telah memiliki sertifikat halal / tercatat dalam Positive List BPJPH.</li>
  <li>Memisahkan secara mutlak peralatan masak, wadah, dan tempat penyimpanan dari segala bentuk najis dan bahan non-halal.</li>
  <li>Memastikan seluruh proses produksi diawasi oleh Penyelia Halal Muslim.</li>
</ol>
</p>

<h3>II. DAFTAR BAHAN & KRITERIA KEHALALAN</h3>
<p>Semua bahan yang digunakan pada produk <strong>${businessName}</strong> wajib memenuhi kriteria:</p>
<ul>
  <li><strong>Bahan Nabati Murni:</strong> Tepung beras, tepung terigu, kedelai, gula murni, garam, bawang, cabai, minyak kelapa sawit (Positive List).</li>
  <li><strong>Bumbu Olahan Pabrik:</strong> Wajib memiliki label halal resmi BPJPH / MUI aktif pada kemasannya.</li>
  <li><strong>Sumber Air:</strong> Air bersih layak konsumsi standar sanitasi dapur bersih.</li>
</ul>

<h3>III. SOP ALUR PROSES PENGOLAHAN HALAL (PPH)</h3>
<table>
  <tr>
    <th style="width: 30%;">Tahapan</th>
    <th>Standar Prosedur Operasional (SOP) Halal</th>
  </tr>
  <tr>
    <td><strong>1. Pembelian Bahan</strong></td>
    <td>Membeli bahan dari toko/pasar yang jelas kebersihannya; memeriksa keutuhan kemasan dan logo halal resmi.</td>
  </tr>
  <tr>
    <td><strong>2. Penerimaan & Penyimpanan</strong></td>
    <td>Bahan disimpan di rak/wadah tertutup, berjarak dari lantai, tidak tercampur barang najis atau bahan kimia pembersih.</td>
  </tr>
  <tr>
    <td><strong>3. Pengolahan / Memasak</strong></td>
    <td>Peralatan dicuci suci dengan air bersih mengalir; dapur bebas dari hewan piaraan (kucing/unggas) dan serangga.</td>
  </tr>
  <tr>
    <td><strong>4. Pengemasan & Pelabelan</strong></td>
    <td>Dikemas dalam kemasan bersih dan tertutup rapat; mencantumkan nama merek yang sopan dan tidak mengarah ke barang haram.</td>
  </tr>
</table>

<div style="margin-top: 40px;">
  <p>Ditetapkan di Desa Mersi pada tanggal: ......................... 2026</p>
  <table style="width: 100%; border: none;">
    <tr style="border: none;">
      <td style="border: none; width: 50%; text-align: center;">
        Penyelia Halal,
        <div style="height: 60px;"></div>
        <strong>( ${member.penyelia_nama || 'Ahmad Fauzi'} )</strong>
      </td>
      <td style="border: none; width: 50%; text-align: center;">
        Pimpinan Usaha,
        <div style="height: 60px;"></div>
        <strong>( ${memberName} )</strong>
      </td>
    </tr>
  </table>
</div>

</body>
</html>`;

  triggerDownload(content, `Panduan_Manual_SJPH_Fatayat_NU_${cleanFilename(businessName)}.doc`, 'application/msword');
}

export function downloadBahanTemplate(member = {}) {
  const businessName = member.usaha || 'Keripik Tempe Barokah';
  
  // Format CSV kompatibel dengan Microsoft Excel
  const rows = [
    ['FORMULIR RINCIAN BAHAN BAKU DAN BUMBU PRODUKSI'],
    [`Nama Usaha: ${businessName}`, `Pemilik: ${member.nama || 'Ibu Pelaku Usaha'}`],
    ['Tanggal Pengisian: 2026', 'Standar Jalur Self-Declare BPJPH'],
    [],
    ['No', 'Nama Bahan Baku / Bumbu', 'Merek Dagang', 'Nama Produsen / Toko Pembelian', 'Status Halal / No. Sertifikat BPJPH', 'Masa Berlaku Halal', 'Kategori (Bahan Utama/Bumbu/Penolong)'],
    ['1', 'Tempe Kedelai Segar', 'Pengrajin Mersi', 'Pengrajin Tempe Desa Mersi', 'Bahan Segar Nabati (Positive List)', 'Alami', 'Bahan Baku Utama'],
    ['2', 'Tepung Beras', 'Rose Brand', 'PT Budi Starch & Sweetener', 'ID0041000001234', 'Aktif s/d 2028', 'Bahan Utama'],
    ['3', 'Tepung Tapioka', 'Gunung Agung', 'Toko Bahan Kue Barokah', 'ID0011000005678', 'Aktif s/d 2027', 'Bahan Penolong'],
    ['4', 'Minyak Goreng Sawit', 'Bimoli / SunCo', 'Supermarket / Pasar Wage', 'ID0021000009876', 'Aktif s/d 2028', 'Media Penggorengan'],
    ['5', 'Bawang Putih Segar', 'Bawang Brebes', 'Pasar Tradisional Purwokerto', 'Bahan Nabati Murni (Positive List)', 'Alami', 'Bumbu Halus'],
    ['6', 'Ketumbar Bubuk', 'Desaku', 'PT Motasa Indonesia', 'ID0031000004321', 'Aktif s/d 2027', 'Bumbu Olahan'],
    ['7', 'Garam Beryodium', 'Dolphin / Daun', 'PT Susanti Megah', 'ID0011000008765', 'Aktif s/d 2028', 'Bumbu'],
    ['8', 'Air Bersih', 'Air Sumur Masak / PDAM', 'Sumber Sanitasi Rumah Mersi', 'Air Bersih Standar Pangan (Jernih/Tidak Berbau)', 'Harian', 'Bahan Pencampur'],
    ['9', '[Tuliskan bahan lain jika ada]', '...', '...', '...', '...', '...']
  ];

  const csvContent = '\uFEFF' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  triggerDownload(csvContent, `Tabel_Rincian_Bahan_Baku_${cleanFilename(businessName)}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadSKPenyeliaTemplate(member = {}) {
  const memberName = member.nama || 'Ibu Pelaku Usaha';
  const supervisorName = member.penyelia_nama || 'Ahmad Fauzi';
  const businessName = member.usaha || 'Keripik Tempe Barokah';

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Keputusan Penetapan Penyelia Halal</title>
<style>
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; }
  .text-center { text-align: center; }
  .kop { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  td { padding: 4px 6px; vertical-align: top; }
</style>
</head>
<body>

<div class="kop text-center">
  <h3 style="margin:0; text-transform:uppercase;">SURAT KEPUTUSAN PIMPINAN USAHA</h3>
  <h4 style="margin:4px 0;">TENTANG PENETAPAN PENYELIA HALAL INTERNAL</h4>
  <p style="margin:0; font-size:10pt;">Nomor: 001/SK-PH/${cleanFilename(businessName)}/X/2026</p>
</div>

<p>Menimbang bahwa dalam rangka memenuhi persyaratan Sistem Jaminan Produk Halal (SJPH) BPJPH Kemenag RI jalur Self-Declare, maka dipandang perlu menetapkan Penyelia Halal pada usaha <strong>${businessName}</strong>.</p>

<p>Mengingat: Undang-Undang Nomor 33 Tahun 2014 tentang Jaminan Produk Halal dan Peraturan Pemerintah Nomor 39 Tahun 2021.</p>

<div class="text-center" style="margin: 20px 0;">
  <strong>MEMUTUSKAN:</strong>
</div>

<p><strong>Menetapkan:</strong></p>
<table>
  <tr>
    <td style="width: 220px;">Nama Penyelia Halal</td>
    <td style="width: 20px;">:</td>
    <td><strong>${supervisorName}</strong></td>
  </tr>
  <tr>
    <td>Agama</td>
    <td>:</td>
    <td><strong>Islam (Muslim Taat)</strong></td>
  </tr>
  <tr>
    <td>Nomor KTP / NIK</td>
    <td>:</td>
    <td>3302........................</td>
  </tr>
  <tr>
    <td>Jabatan dalam Usaha</td>
    <td>:</td>
    <td>Koordinator Produksi / Penyelia Halal</td>
  </tr>
  <tr>
    <td>Nama Usaha</td>
    <td>:</td>
    <td>${businessName}</td>
  </tr>
</table>

<p style="margin-top: 15px; text-align: justify;">
Tugas dan Tanggung Jawab Penyelia Halal:
<ol>
  <li>Mengawasi proses produksi agar senantiasa bersih, suci, dan halal;</li>
  <li>Memeriksa setiap bahan baku yang dibeli telah memenuhi kriteria halal;</li>
  <li>Mendampingi proses kunjungan verifikasi lapangan oleh Pendamping Halal PPH Fatayat NU.</li>
</ol>
</p>

<p>Surat Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila di kemudian hari terdapat kekeliruan akan diperbaiki sebagaimana mestinya.</p>

<div style="margin-top: 40px;">
  <table style="width: 100%;">
    <tr>
      <td style="width: 50%; text-align: center;">
        Yang Menerima Tugas (Penyelia Halal),
        <div style="height: 60px;"></div>
        <strong>( ${supervisorName} )</strong>
      </td>
      <td style="width: 50%; text-align: center;">
        Ditetapkan di: Mersi, Purwokerto<br>
        Pimpinan Usaha,
        <div style="height: 60px;"></div>
        <strong>( ${memberName} )</strong>
      </td>
    </tr>
  </table>
</div>

</body>
</html>`;

  triggerDownload(content, `SK_Penetapan_Penyelia_Halal_${cleanFilename(businessName)}.doc`, 'application/msword');
}

export function downloadIkrarTemplate(member = {}) {
  const memberName = member.nama || 'Ibu Pelaku Usaha';
  const businessName = member.usaha || 'Keripik Tempe Barokah';
  const address = member.alamat || 'Desa Mersi RT 02 RW 01, Purwokerto Timur';

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Surat Ikrar Pernyataan Bebas Najis & Kehalalan Produk</title>
<style>
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; margin: 2.5cm; }
  .text-center { text-align: center; }
  .kop { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  td { padding: 4px 6px; vertical-align: top; }
  .materai-box {
    border: 1px dashed #777;
    width: 130px;
    height: 80px;
    margin: 10px auto;
    font-size: 8pt;
    text-align: center;
    line-height: 80px;
    color: #888;
  }
</style>
</head>
<body>

<div class="kop text-center">
  <h3 style="margin:0; text-transform:uppercase;">SURAT PERNYATAAN / IKRAR HALAL PELAKU USAHA</h3>
  <h4 style="margin:4px 0;">PERNYATAAN KEHALALAN PRODUK JALUR SELF-DECLARE BPJPH</h4>
  <p style="margin:0; font-size:10pt;">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
</div>

<p>Bismillahirrohmanirrohim,<br>
Yang bertanda tangan di bawah ini:</p>

<table>
  <tr>
    <td style="width: 220px;">Nama Lengkap</td>
    <td style="width: 20px;">:</td>
    <td><strong>${memberName}</strong></td>
  </tr>
  <tr>
    <td>Nomor Induk Kependudukan (NIK)</td>
    <td>:</td>
    <td>3302........................</td>
  </tr>
  <tr>
    <td>Nama Merek / Usaha</td>
    <td>:</td>
    <td><strong>${businessName}</strong></td>
  </tr>
  <tr>
    <td>Nomor Induk Berusaha (NIB)</td>
    <td>:</td>
    <td>${member.nib || '.....................'}</td>
  </tr>
  <tr>
    <td>Alamat Usaha</td>
    <td>:</td>
    <td>${address}</td>
  </tr>
</table>

<p style="margin-top: 20px; text-align: justify;">
Dengan sungguh-sungguh dan penuh kesadaran di hadapan Allah SWT berikrar bahwa:
</p>

<ol style="text-align: justify;">
  <li>Seluruh produk olahan pangan yang kami produksi dan pasarkan adalah <strong>HALAL</strong> dan <strong>THAYYIB</strong> sesuai dengan syariat Islam;</li>
  <li>Bahan yang digunakan tidak mengandung unsur babi, khamr, darah, bangkai, maupun turunan yang diharamkan;</li>
  <li>Proses pengolahan, peralatan masak, sanitasi dapur, dan wadah penyimpanan bebas dari kontaminasi najis lahir maupun batin;</li>
  <li>Kami bersedia dilakukan pemeriksaan/verifikasi mendadak oleh Pendamping Halal Fatayat NU maupun Auditor Halal BPJPH Kemenag RI;</li>
  <li>Apabila di kemudian hari pernyataan ini terbukti tidak benar, kami bersedia dituntut secara hukum sesuai peraturan perundang-undangan yang berlaku di Indonesia.</li>
</ol>

<p>Demikian surat ikrar ini kami buat dengan sebenarnya tanpa paksaan dari pihak mana pun.</p>

<div style="margin-top: 30px;">
  <table style="width: 100%;">
    <tr>
      <td style="width: 40%; text-align: center;">
        Saksi Pendamping Halal PPH,<br>
        PR Fatayat NU Desa Mersi
        <div style="height: 70px;"></div>
        <strong>( .................................................. )</strong>
      </td>
      <td style="width: 20%;"></td>
      <td style="width: 40%; text-align: center;">
        Mersi, .................................... 2026<br>
        Yang Membuat Pernyataan,
        <div class="materai-box">MATERAI Rp10.000</div>
        <strong>( ${memberName} )</strong><br>
        <em>Pimpinan ${businessName}</em>
      </td>
    </tr>
  </table>
</div>

</body>
</html>`;

  triggerDownload(content, `Draf_Ikrar_Halal_Bermaterai_${cleanFilename(memberName)}.doc`, 'application/msword');
}

function cleanFilename(str) {
  return String(str || 'dokumen')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
