import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../backend/data/members.json');
const outputPath = path.resolve(__dirname, '../supabase_schema.sql');

const members = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sql = `-- ==============================================================================
-- SIM-HALAL FATAYAT NU DESA MERSI (SDUM 2026)
-- SUPABASE POSTGRESQL SCHEMA & RBAC CONFIGURATION
-- ==============================================================================
-- Petunjuk:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Buat "New Query", paste seluruh isi file ini, lalu klik "RUN".
-- ==============================================================================

-- 1. HAPUS TABEL LAMA JIKA SUDAH PERNAH DIBUAT (CLEAN START)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- 2. BUAT TABEL MASTER UMKM (MEMBERS)
CREATE TABLE public.members (
    id VARCHAR(20) PRIMARY KEY,
    nama TEXT NOT NULL,
    usaha TEXT NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    kontak VARCHAR(50),
    alamat TEXT,
    nib VARCHAR(50) DEFAULT '-',
    
    -- Pilar 1: Legalitas Usaha
    ktp_pemilik BOOLEAN DEFAULT TRUE,
    kbli BOOLEAN DEFAULT FALSE,
    sihalal BOOLEAN DEFAULT FALSE,
    permohonan BOOLEAN DEFAULT FALSE,

    -- Pilar 2: Bahan Baku & Bumbu
    daftar_bahan BOOLEAN DEFAULT FALSE,
    bahan_nonkritis BOOLEAN DEFAULT FALSE,
    bahan_kritis_halal BOOLEAN DEFAULT FALSE,
    air_bersih BOOLEAN DEFAULT TRUE,

    -- Pilar 3: Alur Proses Halal (PPH)
    dapur_bersih BOOLEAN DEFAULT FALSE,
    alat_khusus BOOLEAN DEFAULT FALSE,
    manual_sjph BOOLEAN DEFAULT FALSE,
    kemasan_higienis BOOLEAN DEFAULT TRUE,

    -- Pilar 4: SDM & Komitmen Halal
    penyelia_nama TEXT,
    penyelia_ktp BOOLEAN DEFAULT FALSE,
    surat_penyelia BOOLEAN DEFAULT FALSE,
    ikrar_materai BOOLEAN DEFAULT FALSE,
    nama_layak BOOLEAN DEFAULT TRUE,

    -- Hasil Penilaian & Status
    skor INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Belum Siap',
    
    -- Relasi ke User Supabase Auth (Opsional jika anggota punya akun login)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUAT TABEL PROFILES & ROLE-BASED ACCESS CONTROL (RBAC)
-- Role yang tersedia: 'admin' (Pengurus Fatayat), 'auditor' (Pendamping Halal), 'member' (Pelaku Usaha)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'auditor', 'member')),
    member_id VARCHAR(20) REFERENCES public.members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function: Ambil Role Pengguna Aktif
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'anon');
$$;

-- Helper Function: Ambil Member ID Pengguna Aktif
CREATE OR REPLACE FUNCTION public.get_my_member_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT member_id FROM public.profiles WHERE id = auth.uid()), '');
$$;

-- KEBIJAKAN AKSES TABEL MEMBERS:
-- 1. Siapapun (termasuk anonim & user login) dapat membaca seluruh master data UMKM untuk statistik monitoring
CREATE POLICY "Public & authenticated can view members"
    ON public.members FOR SELECT
    USING (true);

-- 2. Update data: Admin & Auditor bebas update siapa saja. Member hanya boleh update datanya sendiri.
CREATE POLICY "Admin & Auditor can update any member"
    ON public.members FOR UPDATE
    TO authenticated
    USING (public.get_my_role() IN ('admin', 'auditor'))
    WITH CHECK (public.get_my_role() IN ('admin', 'auditor'));

CREATE POLICY "Member can update own data"
    ON public.members FOR UPDATE
    TO authenticated
    USING (public.get_my_role() = 'member' AND id = public.get_my_member_id())
    WITH CHECK (public.get_my_role() = 'member' AND id = public.get_my_member_id());

-- 3. Insert & Delete: Hanya Admin
CREATE POLICY "Admin can insert members"
    ON public.members FOR INSERT
    TO authenticated
    WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admin can delete members"
    ON public.members FOR DELETE
    TO authenticated
    USING (public.get_my_role() = 'admin');

-- KEBIJAKAN AKSES TABEL PROFILES:
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- 5. TRIGGER OTOMATIS: BUAT PROFIL SAAT ADA REGISTER DI SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, member_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anggota Baru'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    NEW.raw_user_meta_data->>'member_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 6. SEED DATA MASTER 45 UMKM FATAYAT NU DESA MERSI
-- ==============================================================================
INSERT INTO public.members (
    id, nama, usaha, kategori, kontak, alamat, nib,
    ktp_pemilik, kbli, sihalal, permohonan,
    daftar_bahan, bahan_nonkritis, bahan_kritis_halal, air_bersih,
    dapur_bersih, alat_khusus, manual_sjph, kemasan_higienis,
    penyelia_nama, penyelia_ktp, surat_penyelia, ikrar_materai, nama_layak,
    skor, status
) VALUES
`;

const valueRows = members.map((m) => {
  const escapeStr = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "''");
  return `(
    ${escapeStr(m.id)},
    ${escapeStr(m.nama)},
    ${escapeStr(m.usaha)},
    ${escapeStr(m.kategori)},
    ${escapeStr(m.kontak)},
    ${escapeStr(m.alamat)},
    ${escapeStr(m.nib || '-')},
    ${Boolean(m.ktp_pemilik)},
    ${Boolean(m.kbli)},
    ${Boolean(m.sihalal)},
    ${Boolean(m.permohonan)},
    ${Boolean(m.daftar_bahan)},
    ${Boolean(m.bahan_nonkritis)},
    ${Boolean(m.bahan_kritis_halal)},
    ${Boolean(m.air_bersih)},
    ${Boolean(m.dapur_bersih)},
    ${Boolean(m.alat_khusus)},
    ${Boolean(m.manual_sjph)},
    ${Boolean(m.kemasan_higienis)},
    ${escapeStr(m.penyelia_nama || m.nama)},
    ${Boolean(m.penyelia_ktp)},
    ${Boolean(m.surat_penyelia)},
    ${Boolean(m.ikrar_materai)},
    ${Boolean(m.nama_layak)},
    ${Number(m.skor) || 0},
    ${escapeStr(m.status || 'Belum Siap')}
)`;
});

sql += valueRows.join(',\n') + ';\n\n';

sql += `-- Selesai! Seluruh 45 data UMKM berhasil di-seed ke Supabase PostgreSQL.\n`;

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`✅ Berhasil membuat ${outputPath} dengan ${members.length} data UMKM!`);
