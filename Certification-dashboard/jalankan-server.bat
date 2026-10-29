@echo off
echo ============================================================
echo   SIM-HALAL FATAYAT NU DESA MERSI (Sains Data untuk Masyarakat)
echo   Menjalankan Local Server & Membuka Browser Otomatis...
echo ============================================================

REM Buka tab browser ke localhost:3000 secara otomatis
start "" "http://localhost:3000"

REM Jalankan server python di port 3000 (Gunakan http.server, BUKAN https.server)
python -m http.server 3000
