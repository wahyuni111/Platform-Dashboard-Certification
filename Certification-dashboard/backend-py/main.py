import os
import json
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="SIM-HALAL Fatayat NU Desa Mersi API",
    description="Backend API Kesiapan Audit Sertifikasi Halal BPJPH (Jalur Self-Declare)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "members.json")

def clean_phone(phone: str) -> str:
    clean = re.sub(r'[^0-9]', '', phone or '')
    if clean.startswith('0'):
        return '62' + clean[1:]
    if clean.startswith('62'):
        return clean
    return '62' + clean

def format_phone(phone: str) -> str:
    clean = re.sub(r'[^0-9]', '', phone or '')
    if len(clean) == 12:
        return f"{clean[:4]}-{clean[4:8]}-{clean[8:]}"
    return phone or '-'

def has_valid_nib(nib: str) -> bool:
    trim = (nib or '').strip()
    return trim != "" and trim != "-" and len(trim) >= 9

def recalculate_member(m: dict) -> dict:
    m["ktp_pemilik"] = True
    m["has_valid_nib"] = has_valid_nib(m.get("nib", ""))
    m["formatted_phone"] = format_phone(m.get("kontak", ""))
    m["clean_phone_wa"] = clean_phone(m.get("kontak", ""))

    if not m.get("penyelia_nama"):
        m["penyelia_nama"] = m.get("nama", "")

    # Pilar 1: 5 item x 5%
    p1 = (1 if m.get("ktp_pemilik") else 0) + \
         (1 if m.get("has_valid_nib") else 0) + \
         (1 if m.get("kbli") else 0) + \
         (1 if m.get("sihalal") else 0) + \
         (1 if m.get("permohonan") else 0)
    p1_score = p1 * 5.0

    # Pilar 2: 4 item x 8.75%
    p2 = (1 if m.get("daftar_bahan") else 0) + \
         (1 if m.get("bahan_nonkritis") else 0) + \
         (1 if m.get("bahan_kritis_halal") else 0) + \
         (1 if m.get("air_bersih") else 0)
    p2_score = p2 * 8.75

    # Pilar 3: 4 item x 6.25%
    p3 = (1 if m.get("dapur_bersih") else 0) + \
         (1 if m.get("alat_khusus") else 0) + \
         (1 if m.get("manual_sjph") else 0) + \
         (1 if m.get("kemasan_higienis") else 0)
    p3_score = p3 * 6.25

    # Pilar 4: 5 item x 3%
    p4 = (1 if m.get("penyelia_nama") else 0) + \
         (1 if m.get("penyelia_ktp") else 0) + \
         (1 if m.get("surat_penyelia") else 0) + \
         (1 if m.get("ikrar_materai") else 0) + \
         (1 if m.get("nama_layak") else 0)
    p4_score = p4 * 3.0

    raw_total = round(p1_score + p2_score + p3_score + p4_score)
    if not m.get("has_valid_nib") and raw_total > 45:
        raw_total = 45

    m["skor"] = max(0, min(100, raw_total))

    if m["skor"] >= 80:
        m["status"] = "Siap Daftar"
    elif m["skor"] >= 50:
        m["status"] = "Perlu Pendampingan"
    else:
        m["status"] = "Belum Siap"

    hambatan = []
    if not m.get("has_valid_nib"):
        hambatan.append("Segera buat NIB (Nomor Induk Berusaha) berbasis OSS-RBA melalui oss.go.id")
    if not m.get("kbli"):
        hambatan.append("Sesuaikan kode KBLI izin usaha ke bidang olahan pangan/kudapan")
    if not m.get("sihalal"):
        hambatan.append("Buat & aktivasi akun SIHALAL di portal ptsp.halal.go.id menggunakan NIB pemohon")
    if not m.get("permohonan"):
        hambatan.append("Lengkapi draf Surat Permohonan Sertifikasi Halal jalur self-declare")
    if not m.get("daftar_bahan"):
        hambatan.append("Tuliskan seluruh komposisi bahan dan bumbu dalam Formulir Rincian Bahan")
    if not m.get("bahan_nonkritis"):
        hambatan.append("Verifikasi bahan non-kritis masuk dalam Positive List Kemenag")
    if not m.get("bahan_kritis_halal"):
        hambatan.append("Kumpulkan foto label/nomor sertifikat halal kemasan bumbu olahan pabrikan")
    if not m.get("air_bersih"):
        hambatan.append("Pastikan sanitasi dan sumber air bersih memenuhi standar pangan")
    if not m.get("dapur_bersih"):
        hambatan.append("Bersihkan area dapur produksi agar terhindar dari najis & hewan peliharaan")
    if not m.get("alat_khusus"):
        hambatan.append("Pisahkan wadah dan alat masak khusus hanya untuk produksi halal")
    if not m.get("manual_sjph"):
        hambatan.append("Susun formulir Manual SJPH (SOP Komitmen Halal) standar Fatayat NU")
    if not m.get("kemasan_higienis"):
        hambatan.append("Gunakan kemasan tertutup rapat untuk mencegah kontaminasi produk")
    if not m.get("penyelia_nama"):
        hambatan.append("Tunjuk penyelia halal muslim yang bertanggung jawab atas proses produksi")
    if not m.get("penyelia_ktp"):
        hambatan.append("Lampirkan salinan fotokopi KTP penyelia halal yang ditunjuk")
    if not m.get("surat_penyelia"):
        hambatan.append("Tandatangani Surat Keputusan (SK) Penetapan Penyelia Halal")
    if not m.get("ikrar_materai"):
        hambatan.append("Tandatangani Surat Pernyataan Ikrar Halal bermaterai Rp10.000")
    if not m.get("nama_layak"):
        hambatan.append("Sesuaikan nama merek agar bebas dari konotasi yang diharamkan syariat")
    m["hambatan"] = hambatan

    # Milestones
    s1 = bool(m.get("ktp_pemilik") and m.get("has_valid_nib") and m.get("kbli"))
    s2 = bool(m.get("daftar_bahan") and m.get("bahan_nonkritis") and m.get("bahan_kritis_halal") and m.get("air_bersih"))
    s3 = bool(m.get("dapur_bersih") and m.get("alat_khusus") and m.get("manual_sjph") and m.get("kemasan_higienis"))
    s4 = bool(m.get("penyelia_nama") and m.get("surat_penyelia") and m.get("ikrar_materai") and m.get("nama_layak"))
    s5 = bool(m.get("sihalal") and m.get("permohonan") and m.get("skor", 0) >= 80)

    m["journey_milestones"] = [
        {"step": 1, "title": "Legalitas Usaha & KBLI", "desc": "KTP, NIB OSS, KBLI Pangan", "done": s1},
        {"step": 2, "title": "Bahan Baku & Bumbu", "desc": "Positive List & Sertifikat Halal", "done": s2},
        {"step": 3, "title": "Alur Proses & Dapur", "desc": "Sanitasi, Pemisahan Alat & SJPH", "done": s3},
        {"step": 4, "title": "Penyelia & Ikrar Materai", "desc": "SDM Muslim & Komitmen Halal", "done": s4},
        {"step": 5, "title": "Pengajuan Akun SIHALAL", "desc": "ptsp.halal.go.id & Submit BPJPH", "done": s5},
    ]

    # Completed items
    completed = []
    if m.get("ktp_pemilik"): completed.append({"key": "ktp_pemilik", "pilar": "Pilar 1: Legalitas", "label": "KTP Pemilik Usaha", "desc": "KTP-el pemohon terlampir dan aktif."})
    if m.get("has_valid_nib"): completed.append({"key": "nib", "pilar": "Pilar 1: Legalitas", "label": "NIB OSS-RBA", "desc": f"Nomor NIB: {m.get('nib')} terdaftar resmi."})
    if m.get("kbli"): completed.append({"key": "kbli", "pilar": "Pilar 1: Legalitas", "label": "KBLI Pangan Olahan", "desc": "Kode KBLI sesuai bidang pangan olahan."})
    if m.get("sihalal"): completed.append({"key": "sihalal", "pilar": "Pilar 1: Legalitas", "label": "Akun SIHALAL", "desc": "Akun BPJPH aktif di ptsp.halal.go.id."})
    if m.get("permohonan"): completed.append({"key": "permohonan", "pilar": "Pilar 1: Legalitas", "label": "Surat Permohonan", "desc": "Draf surat permohonan sertifikasi siap."})
    if m.get("daftar_bahan"): completed.append({"key": "daftar_bahan", "pilar": "Pilar 2: Bahan Baku", "label": "Rincian Bahan Baku", "desc": "Formula semua bahan telah didata lengkap."})
    if m.get("bahan_nonkritis"): completed.append({"key": "bahan_nonkritis", "pilar": "Pilar 2: Bahan Baku", "label": "Bahan Non-Kritis", "desc": "Komposisi nabati positive list verified."})
    if m.get("bahan_kritis_halal"): completed.append({"key": "bahan_kritis_halal", "pilar": "Pilar 2: Bahan Baku", "label": "Sertifikat Halal Bumbu", "desc": "Bukti sertifikat halal pabrikan telah disetor."})
    if m.get("air_bersih"): completed.append({"key": "air_bersih", "pilar": "Pilar 2: Bahan Baku", "label": "Air Bersih Higienis", "desc": "Sumber air bersih memenuhi standar pangan."})
    if m.get("dapur_bersih"): completed.append({"key": "dapur_bersih", "pilar": "Pilar 3: Proses PPH", "label": "Sanitasi Dapur Produksi", "desc": "Area dapur bersih dan bebas najis/hewan."})
    if m.get("alat_khusus"): completed.append({"key": "alat_khusus", "pilar": "Pilar 3: Proses PPH", "label": "Pemisahan Alat Masak", "desc": "Wajan & alat khusus pengolahan halal."})
    if m.get("manual_sjph"): completed.append({"key": "manual_sjph", "pilar": "Pilar 3: Proses PPH", "label": "Manual SJPH Tertulis", "desc": "SOP komitmen halal sederhana tersusun."})
    if m.get("kemasan_higienis"): completed.append({"key": "kemasan_higienis", "pilar": "Pilar 3: Proses PPH", "label": "Kemasan Rapat Higienis", "desc": "Kemasan tertutup rapat bebas kontaminasi."})
    if m.get("penyelia_nama"): completed.append({"key": "penyelia_nama", "pilar": "Pilar 4: Komitmen", "label": "Penyelia Halal Muslim", "desc": f"Penyelia ditunjuk: {m.get('penyelia_nama')}."})
    if m.get("penyelia_ktp"): completed.append({"key": "penyelia_ktp", "pilar": "Pilar 4: Komitmen", "label": "Salinan KTP Penyelia", "desc": "KTP penyelia telah diarsipkan pendamping."})
    if m.get("surat_penyelia"): completed.append({"key": "surat_penyelia", "pilar": "Pilar 4: Komitmen", "label": "SK Penetapan Penyelia", "desc": "Surat penetapan resmi telah ditandatangani."})
    if m.get("ikrar_materai"): completed.append({"key": "ikrar_materai", "pilar": "Pilar 4: Komitmen", "label": "Ikrar Halal Bermaterai", "desc": "Surat ikrar bermaterai Rp10.000 sah."})
    if m.get("nama_layak"): completed.append({"key": "nama_layak", "pilar": "Pilar 4: Komitmen", "label": "Nama Merek Halal", "desc": "Bebas dari konotasi haram/syaitan."})
    m["completed_items"] = completed

    # Pending items
    pending = []
    if not m.get("has_valid_nib"): pending.append({"key": "nib", "pilar": "Pilar 1: Legalitas", "label": "Belum Ada NIB OSS-RBA", "action": "Segera daftar NIB di portal oss.go.id dengan dibantu pendamping."})
    if not m.get("kbli"): pending.append({"key": "kbli", "pilar": "Pilar 1: Legalitas", "label": "KBLI Belum Sesuai", "action": "Ubah kode izin usaha ke KBLI pangan olahan/kudapan."})
    if not m.get("sihalal"): pending.append({"key": "sihalal", "pilar": "Pilar 1: Legalitas", "label": "Akun SIHALAL Belum Aktif", "action": "Buat akun di ptsp.halal.go.id menggunakan NIB pemilik."})
    if not m.get("permohonan"): pending.append({"key": "permohonan", "pilar": "Pilar 1: Legalitas", "label": "Surat Permohonan Belum Dibuat", "action": "Cetak formulir surat permohonan sertifikasi self-declare."})
    if not m.get("daftar_bahan"): pending.append({"key": "daftar_bahan", "pilar": "Pilar 2: Bahan Baku", "label": "Rincian Bahan Belum Ditulis", "action": "Tuliskan seluruh komposisi bahan dan bumbu dalam formulir."})
    if not m.get("bahan_nonkritis"): pending.append({"key": "bahan_nonkritis", "pilar": "Pilar 2: Bahan Baku", "label": "Bahan Belum Terverifikasi", "action": "Pastikan bahan nabati masuk daftar positive list Kemenag."})
    if not m.get("bahan_kritis_halal"): pending.append({"key": "bahan_kritis_halal", "pilar": "Pilar 2: Bahan Baku", "label": "Bukti Halal Bumbu Kurang", "action": "Kumpulkan foto kemasan/sertifikat halal bumbu olahan pabrik."})
    if not m.get("air_bersih"): pending.append({"key": "air_bersih", "pilar": "Pilar 2: Bahan Baku", "label": "Sumber Air Perlu Dicek", "action": "Pastikan air bebas bau dan layak standar higiene pangan."})
    if not m.get("dapur_bersih"): pending.append({"key": "dapur_bersih", "pilar": "Pilar 3: Proses PPH", "label": "Sanitasi Dapur Perlu Dibenahi", "action": "Bersihkan area dapur produksi agar terhindar dari najis/hewan."})
    if not m.get("alat_khusus"): pending.append({"key": "alat_khusus", "pilar": "Pilar 3: Proses PPH", "label": "Alat Masak Belum Terpisah", "action": "Sediakan wajan & pisau khusus hanya untuk produk halal."})
    if not m.get("manual_sjph"): pending.append({"key": "manual_sjph", "pilar": "Pilar 3: Proses PPH", "label": "Manual SJPH Belum Disusun", "action": "Isi formulir Manual SJPH sederhana panduan Fatayat NU."})
    if not m.get("kemasan_higienis"): pending.append({"key": "kemasan_higienis", "pilar": "Pilar 3: Proses PPH", "label": "Kemasan Belum Tertutup Rapat", "action": "Gunakan kemasan tertutup rapat untuk mencegah kontaminasi."})
    if not m.get("penyelia_nama"): pending.append({"key": "penyelia_nama", "pilar": "Pilar 4: Komitmen", "label": "Penyelia Belum Ditunjuk", "action": "Tunjuk salah satu pekerja/keluarga muslim sebagai penyelia."})
    if not m.get("penyelia_ktp"): pending.append({"key": "penyelia_ktp", "pilar": "Pilar 4: Komitmen", "label": "Salinan KTP Penyelia Kurang", "action": "Lampirkan fotokopi KTP penyelia halal."})
    if not m.get("surat_penyelia"): pending.append({"key": "surat_penyelia", "pilar": "Pilar 4: Komitmen", "label": "Surat Penetapan Belum Ada", "action": "Tandatangani SK Penetapan Penyelia Halal internal usaha."})
    if not m.get("ikrar_materai"): pending.append({"key": "ikrar_materai", "pilar": "Pilar 4: Komitmen", "label": "Ikrar Halal Belum Bermaterai", "action": "Bubuhkan materai Rp10.000 pada Surat Pernyataan Ikrar Halal."})
    if not m.get("nama_layak"): pending.append({"key": "nama_layak", "pilar": "Pilar 4: Komitmen", "label": "Nama Merek Mengandung Konotasi Dilarang", "action": "Sesuaikan nama merek agar bebas dari istilah yang dilarang."})
    m["pending_items"] = pending

    return m

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Database file not found at {DATA_PATH}")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [recalculate_member(item) for item in data]

def save_data(data):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

MEMBERS_DB = load_data()

class TogglePayload(BaseModel):
    field: str

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "SIM-HALAL Fatayat NU Mersi API (FastAPI)", "version": "2.0.0", "members": len(MEMBERS_DB)}

@app.get("/api/stats")
def get_stats():
    total = len(MEMBERS_DB)
    siap = sum(1 for m in MEMBERS_DB if m.get("skor", 0) >= 80)
    pendampingan = sum(1 for m in MEMBERS_DB if 50 <= m.get("skor", 0) < 80)
    belum = sum(1 for m in MEMBERS_DB if m.get("skor", 0) < 50)
    return {
        "total": total,
        "siap_daftar": siap,
        "pendampingan": pendampingan,
        "belum_siap": belum,
        "siap_daftar_pct": round(siap * 100 / total) if total else 0,
        "pendampingan_pct": round(pendampingan * 100 / total) if total else 0,
        "belum_siap_pct": round(belum * 100 / total) if total else 0
    }

@app.get("/api/bottlenecks")
def get_bottlenecks():
    total = len(MEMBERS_DB)
    if not total: return []
    nib = sum(1 for m in MEMBERS_DB if not m.get("has_valid_nib"))
    bumbu = sum(1 for m in MEMBERS_DB if not m.get("bahan_kritis_halal"))
    sjph = sum(1 for m in MEMBERS_DB if not m.get("manual_sjph"))
    sihalal = sum(1 for m in MEMBERS_DB if not m.get("sihalal"))
    ikrar = sum(1 for m in MEMBERS_DB if not m.get("ikrar_materai"))
    calc = lambda c: round(c * 100 / total)
    return [
        {"label": "NIB Belum Ada / Belum OSS-RBA", "percent": calc(nib), "count": nib, "color": "from-red-500 to-rose-600", "dot": "bg-red-500", "note": "Perlu fasilitasi pendampingan pembuatan akun OSS di balai desa."},
        {"label": "Bukti Halal Bumbu Olahan Belum Lengkap", "percent": calc(bumbu), "count": bumbu, "color": "from-amber-500 to-orange-500", "dot": "bg-amber-500", "note": "Pengumpulan foto kemasan / nomor sertifikat halal bahan pabrikan."},
        {"label": "Belum Ada Manual SJPH Tertulis (SOP PPH)", "percent": calc(sjph), "count": sjph, "color": "from-yellow-400 to-amber-500", "dot": "bg-yellow-500", "note": "Dibantu dengan formulir template SJPH standar Fatayat NU."},
        {"label": "Akun SIHALAL Belum Aktif (ptsp.halal.go.id)", "percent": calc(sihalal), "count": sihalal, "color": "from-blue-500 to-indigo-600", "dot": "bg-blue-500", "note": "Registrasi email pemilik usaha dan sinkronisasi data NIB."},
        {"label": "Belum Tanda Tangan Surat Ikrar Halal Bermaterai", "percent": calc(ikrar), "count": ikrar, "color": "from-emerald-500 to-green-700", "dot": "bg-emerald-500", "note": "Pemberian materai Rp10.000 dan penandatanganan kolektif ranting."}
    ]

@app.get("/api/categories")
def get_categories():
    total = len(MEMBERS_DB)
    kudapan = sum(1 for m in MEMBERS_DB if m.get("kategori") == "Kudapan Kering")
    basah = sum(1 for m in MEMBERS_DB if m.get("kategori") == "Makanan Basah")
    minuman = sum(1 for m in MEMBERS_DB if m.get("kategori") == "Minuman")
    calc = lambda c: round(c * 100 / total) if total else 0
    return {
        "labels": ["Kudapan Kering", "Makanan Basah", "Minuman"],
        "data": [kudapan, basah, minuman],
        "percentages": [calc(kudapan), calc(basah), calc(minuman)],
        "colors": ["#1E4D2B", "#D97706", "#3B82F6"]
    }

@app.get("/api/members")
def get_members(category: Optional[str] = Query(None), status: Optional[str] = Query(None), search: Optional[str] = Query(None)):
    res = MEMBERS_DB
    if category and category != "ALL":
        res = [m for m in res if m.get("kategori") == category]
    if status and status != "ALL":
        res = [m for m in res if m.get("status") == status]
    if search:
        s = search.lower().strip()
        res = [m for m in res if s in m.get("nama", "").lower() or s in m.get("usaha", "").lower() or s in m.get("id", "").lower() or s in m.get("nib", "").lower()]
    return res

@app.get("/api/members/{member_id}")
def get_member(member_id: str):
    for m in MEMBERS_DB:
        if m.get("id", "").lower() == member_id.lower():
            return m
    raise HTTPException(status_code=404, detail="Member not found")

@app.post("/api/members/{member_id}/toggle")
def toggle_member_criterion(member_id: str, payload: TogglePayload):
    for m in MEMBERS_DB:
        if m.get("id", "").lower() == member_id.lower():
            field = payload.field
            if field == "nib":
                m["nib"] = "-" if has_valid_nib(m.get("nib", "")) else "820349281999"
            elif field in m:
                m[field] = not bool(m[field])
            else:
                raise HTTPException(status_code=400, detail=f"Unknown field: {field}")
            recalculate_member(m)
            save_data(MEMBERS_DB)
            return m
    raise HTTPException(status_code=404, detail="Member not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
