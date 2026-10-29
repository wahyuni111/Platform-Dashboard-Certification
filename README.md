# SIM-HALAL FATAYAT NU DESA MERSI (Sains Data untuk Masyarakat 2026)
> **Portal Monitoring & Dashboard Mandiri Kesiapan Audit Sertifikasi Halal BPJPH (Jalur Self-Declare)**  
> *Pimpinan Ranting Fatayat Nahdlatul Ulama Desa Mersi, Purwokerto Timur, Kabupaten Banyumas*

---

## 🚀 Tech Stack Modern (v2.0)

Aplikasi ini telah dimodernisasi dari berkas statis & `.bat` lama menjadi arsitektur modern yang nyaman bagi developer di **macOS, Linux, dan Windows**:

- **Frontend**: **React 18** + **Vite 6** + **Tailwind CSS v3** + **Lucide React** + **Chart.js** + **Canvas Confetti**.
- **Backend Utama**: **Golang (Go 1.25)** REST API — *ultra-fast, typed, zero external dependencies, no virtualenv hassle*.
- **Backend Alternatif**: **Python 3 (FastAPI & Uvicorn)** — *opsional jika ingin menggunakan stack Python Data Science*.
- **Runner Mac/Linux**: Skrip otomatis `dev.sh` (1-baris perintah tanpa perlu file `.bat`).

---

## 💻 Cara Menjalankan di MacBook (macOS) / Linux

Tidak perlu lagi menjalankan file `.bat`! Anda cukup menjalankan salah satu cara berikut:

### Opsi 1: Menggunakan NPM (Rekomendasi)
Buka Terminal di folder proyek, lalu jalankan:
```bash
# Menjalankan Go Backend (port 8080) & React Vite Frontend (port 5173) sekaligus
npm run dev
```

Browser di MacBook Anda akan otomatis terbuka ke `http://localhost:5173`!

### Opsi 2: Menggunakan Skrip Langsung
```bash
./dev.sh
```

### Opsi 3: Menggunakan Python FastAPI Backend (Jika Lebih Menyukai Python)
Jika Anda ingin backend berjalan menggunakan Python FastAPI:
```bash
# Setup venv & install dependencies FastAPI (hanya sekali di awal)
cd Certification-dashboard/backend-py
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cd ../..

# Jalankan fullstack dengan backend Python
npm run dev:py
# atau: ./dev.sh --py
```

### Opsi 4: Menggunakan Makefile
```bash
make dev      # Fullstack Go + React
make dev-py   # Fullstack Python + React
make build    # Build bundle produksi
```

---

## 🌟 Fitur Utama Aplikasi

### 1. 📊 Tab 1: Ringkasan Pengurus (Executive Monitoring)
- **Filter Reaktif**: Filter Kategori Produk (*Kudapan Kering, Makanan Basah, Minuman*), Status BPJPH (*Siap Daftar, Perlu Pendampingan, Belum Siap*), dan Pencarian Nama/Merek/NIB.
- **4 Kartu Metrik KPI Interaktif**:
  1. *Siap Daftar (Skor ≥ 80%)* &mdash; 14 Usaha (31%)
  2. *Perlu Pendampingan (Skor 50–79%)* &mdash; 22 Usaha (49%)
  3. *Belum Siap (Skor < 50%)* &mdash; 9 Usaha (20%)
  4. *Total Terdata* &mdash; 45 Usaha
  - **Drilldown Modal**: Klik salah satu kartu KPI untuk membuka daftar anggota berstatus tersebut dan mencetak berkas rekapitulasi.
- **Analisis Titik Hambatan (Bottlenecks)**: Indikator kendala terbesar (NIB, bukti bumbu pabrik, SOP SJPH, akun SIHALAL, materai ikrar).
- **Diagram Distribusi Kategori Produk**: Doughnut Chart interaktif.
- **Tabel Master Monitoring UMKM**: Menampilkan seluruh pelaku usaha lengkap dengan tombol pintas Audit dan WhatsApp Reminder.

### 2. 👩‍💼 Tab 2: Dashboard Mandiri per Anggota UMKM
- **Sambutan Personal**: Identitas pelaku usaha, nama merek, kategori, nomor kontak, alamat dapur, dan nomor NIB.
- **Pelacak Milestone Halal Journey**:
  1. *Legalitas Usaha & KBLI* (KTP, NIB OSS, KBLI Pangan)
  2. *Bahan Baku & Bumbu* (Positive List & Sertifikat Halal Bumbu Pabrik)
  3. *Alur Proses & Dapur* (Sanitasi, Pemisahan Alat Masak & SJPH)
  4. *Penyelia & Ikrar Materai* (SDM Muslim & Komitmen Halal)
  5. *Pengajuan Akun SIHALAL* (ptsp.halal.go.id & Submit BPJPH)
- **Komparasi 2 Kolom Transparan**:
  - *Kolom Hijau [V]*: Syarat yang sudah terpenuhi & terverifikasi.
  - *Kolom Amber/Merah [X]*: Syarat yang masih kurang beserta instruksi tindakan nyata.
- **Matriks 4 Pilar Standar SJPH (18 Indikator)**:
  - Interaktif: Klik butir kriteria untuk melakukan simulasi audit live! Skor BPJPH dan status akan langsung terhitung dan tersimpan di backend.
- **Pusat Aksi**:
  - *Kirim / Konsul WhatsApp*: Membuka template pesan santun & resmi Fatayat NU langsung ke nomor WA pelaku usaha.
  - *Cetak Lembar Audit (PDF)*: Menghasilkan lembar audit format resmi A4 PDF dengan kop surat dan tanda tangan pengesahan.

---

## 🖨️ Panduan Cetak PDF Resmi Berstandar A4

Aplikasi telah dilengkapi **print stylesheet** profesional untuk:
1. **Lembar Hasil Audit Mandiri Anggota**: Klik tombol **"Cetak Lembar Audit (PDF)"** di Tab 2.
2. **Berkas Rekapitulasi Kelompok**: Klik kartu KPI di Tab 1 (misal kartu **"Siap Daftar"**), lalu klik **"Cetak / Unduh Berkas Rekap (PDF)"**.

### Pengaturan Dialog Cetak Browser:
- **Tujuan / Printer**: *Save as PDF*
- **Ukuran Kertas**: *A4*
- **Tata Letak**: *Portrait*
- **Margin**: *Default* atau *Minimum*
- **Opsi Penting**: Centang **"Background graphics"** (Grafis Latar Belakang) agar warna badge kop surat tercetak jelas.

---

## 📂 Struktur Direktori Proyek

```
Web-Certification-Dashboard/
├── dev.sh                           # 1-Klik runner untuk macOS / Linux
├── package.json                     # Root manifest untuk npm run dev
├── Certification-dashboard/
│   ├── dev.sh                       # Script runner level subfolder
│   ├── Makefile                     # Make commands (dev, dev-py, build, clean)
│   ├── package.json                 # Manifest project utama
│   │
│   ├── backend/                     # Golang REST API Server (Go 1.25)
│   │   ├── go.mod
│   │   ├── main.go                  # Model, SJPH Calculator, CORS, In-memory Store
│   │   └── data/
│   │       └── members.json         # Master database 45 UMKM Mersi
│   │
│   ├── backend-py/                  # Alternatif Python FastAPI Server
│   │   ├── main.py                  # FastAPI implementation (identik dengan Go)
│   │   └── requirements.txt
│   │
│   ├── frontend/                    # Modern React 18 + Vite + Tailwind CSS
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx              # Central state & orchestrator
│   │       ├── index.css            # Custom scrollbar, animations & A4 print CSS
│   │       ├── services/
│   │       │   ├── api.js           # REST API client
│   │       │   └── whatsapp.js      # Generator pesan WA islami santun
│   │       └── components/
│   │           ├── Header.jsx
│   │           ├── TabNavigation.jsx
│   │           ├── ExecutiveSummaryView.jsx
│   │           ├── KPICards.jsx
│   │           ├── BottleneckList.jsx
│   │           ├── CategoryChart.jsx
│   │           ├── MemberTable.jsx
│   │           ├── MemberDetailView.jsx
│   │           ├── HalalMilestones.jsx
│   │           ├── ComparisonColumns.jsx
│   │           ├── AuditChecklist.jsx
│   │           ├── ActionBox.jsx
│   │           ├── DrilldownModal.jsx
│   │           ├── PrintMemberReport.jsx
│   │           └── PrintGroupReport.jsx
│   │
│   ├── js/                          # (Legacy) Berkas vanilla JS asli untuk arsip
│   ├── css/                         # (Legacy) Berkas CSS lama
│   ├── buka-aplikasi.bat            # (Legacy) File Windows lama
│   └── jalankan-server.bat          # (Legacy) File Windows lama
```

---

## ⚖️ Standar Penilaian BPJPH (Jalur Self-Declare)

Perhitungan kesiapan sertifikasi halal mengacu pada bobot resmi Sistem Jaminan Produk Halal (SJPH):
1. **Pilar 1: Legalitas Usaha (Bobot 25%)**: KTP Pemilik, NIB OSS-RBA, KBLI Pangan Olahan, Akun SIHALAL aktif, Surat Permohonan.
2. **Pilar 2: Bahan Baku & Bumbu (Bobot 35%)**: Formulir rincian bahan, verifikasi *positive list* non-kritis, bukti sertifikat halal bumbu pabrik, sumber air bersih.
3. **Pilar 3: Alur Proses Halal / PPH (Bobot 25%)**: Sanitasi dapur, pemisahan alat masak khusus, Manual SJPH tertulis, kemasan higienis tertutup.
4. **Pilar 4: SDM & Komitmen Halal (Bobot 15%)**: Penyelia halal muslim, salinan KTP penyelia, SK penetapan, ikrar bermaterai Rp10.000, nama merek bebas konotasi haram.

*Prasyarat Wajib*: Usaha yang belum memiliki NIB OSS-RBA otomatis dibatasi skor maksimal 45% (*Belum Siap*) karena belum memiliki dasar legalitas usaha.
