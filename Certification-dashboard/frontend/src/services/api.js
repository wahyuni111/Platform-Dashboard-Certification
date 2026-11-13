import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  recalculateMemberClient,
  calculateStatsClient,
  calculateBottlenecksClient,
  calculateCategoriesClient
} from '../utils/auditCalculator';

const API_BASE = '/api';

/**
 * Fetch wrapper dengan auto-retry untuk local backend
 */
async function fetchWithRetry(url, options = {}, retries = 3, delay = 600) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if ((res.status === 502 || res.status === 503) && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Helper: Bersihkan dan format nomor HP
 */
function enrichMemberPhone(m) {
  const kontak = m.kontak || '';
  const clean = kontak.replace(/[^0-9]/g, '');
  let cleanWa = clean;
  if (clean.startsWith('0')) cleanWa = '62' + clean.slice(1);
  else if (!clean.startsWith('62')) cleanWa = '62' + clean;

  let formatted = kontak;
  if (clean.length === 12) {
    formatted = `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
  }

  return {
    ...m,
    formatted_phone: formatted,
    clean_phone_wa: cleanWa
  };
}

/**
 * 1. Ambil Semua Daftar Anggota
 */
export async function fetchMembers(category = 'ALL', status = 'ALL', search = '') {
  // Coba ambil dari Supabase terlebih dahulu
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('members').select('*').order('id', { ascending: true });

      if (category && category !== 'ALL') {
        query = query.eq('kategori', category);
      }
      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        let results = data.map((item) =>
          recalculateMemberClient(enrichMemberPhone(item))
        );

        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          results = results.filter(
            (m) =>
              (m.nama && m.nama.toLowerCase().includes(q)) ||
              (m.usaha && m.usaha.toLowerCase().includes(q)) ||
              (m.nib && m.nib.toLowerCase().includes(q))
          );
        }
        return results;
      }
    } catch (err) {
      console.warn('Supabase fetchMembers fallback ke local backend:', err.message);
    }
  }

  // Fallback ke Local Backend API
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (status && status !== 'ALL') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetchWithRetry(`${API_BASE}/members?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat daftar anggota');
  return res.json();
}

/**
 * 2. Ambil Detail Anggota Berdasarkan ID
 */
export async function fetchMember(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return recalculateMemberClient(enrichMemberPhone(data));
      }
    } catch (err) {
      console.warn('Supabase fetchMember fallback:', err.message);
    }
  }

  const res = await fetchWithRetry(`${API_BASE}/members/${id}`);
  if (!res.ok) throw new Error(`Anggota ${id} tidak ditemukan`);
  return res.json();
}

/**
 * 3. Toggle Kriteria Audit Langsung ke Supabase
 */
export async function toggleCriterion(id, field) {
  if (isSupabaseConfigured && supabase) {
    try {
      // Ambil record saat ini
      const { data: current, error: getErr } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (!getErr && current) {
        const updatedRaw = { ...current };

        if (field === 'nib') {
          const nibStr = String(current.nib || '').trim();
          const hasNib = Boolean(nibStr && nibStr !== '-' && nibStr.length >= 9);
          updatedRaw.nib = hasNib ? '-' : '1234567890123';
        } else {
          updatedRaw[field] = !current[field];
        }

        // Kalkulasi skor & status baru
        const recalculated = recalculateMemberClient(updatedRaw);

        // Update ke database Supabase
        const { data: saved, error: updateErr } = await supabase
          .from('members')
          .update({
            [field === 'nib' ? 'nib' : field]: updatedRaw[field === 'nib' ? 'nib' : field],
            skor: recalculated.skor,
            status: recalculated.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (!updateErr && saved) {
          return recalculateMemberClient(enrichMemberPhone(saved));
        }
      }
    } catch (err) {
      console.warn('Supabase toggleCriterion fallback:', err.message);
    }
  }

  // Fallback
  const res = await fetchWithRetry(`${API_BASE}/members/${id}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field })
  });
  if (!res.ok) throw new Error('Gagal memperbarui kriteria audit');
  return res.json();
}

/**
 * 4. Update Seluruh Data Profil Anggota
 */
export async function updateMember(id, data) {
  if (isSupabaseConfigured && supabase) {
    try {
      const recalculated = recalculateMemberClient(data);
      const { data: saved, error } = await supabase
        .from('members')
        .update({
          ...data,
          skor: recalculated.skor,
          status: recalculated.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && saved) {
        return recalculateMemberClient(enrichMemberPhone(saved));
      }
    } catch (err) {
      console.warn('Supabase updateMember fallback:', err.message);
    }
  }

  const res = await fetchWithRetry(`${API_BASE}/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal memperbarui data anggota');
  return res.json();
}

/**
 * 5. Ambil Statistik Global KPI
 */
export async function fetchStats() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const enriched = data.map((m) => recalculateMemberClient(m));
        return calculateStatsClient(enriched);
      }
    } catch (err) {
      console.warn('Supabase fetchStats fallback:', err.message);
    }
  }

  const res = await fetchWithRetry(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Gagal memuat statistik');
  return res.json();
}

/**
 * 6. Ambil Bottlenecks Kesiapan
 */
export async function fetchBottlenecks() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const enriched = data.map((m) => recalculateMemberClient(m));
        return calculateBottlenecksClient(enriched);
      }
    } catch (err) {
      console.warn('Supabase fetchBottlenecks fallback:', err.message);
    }
  }

  const res = await fetchWithRetry(`${API_BASE}/bottlenecks`);
  if (!res.ok) throw new Error('Gagal memuat bottlenecks');
  return res.json();
}

/**
 * 7. Ambil Distribusi Kategori
 */
export async function fetchCategories() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return calculateCategoriesClient(data);
      }
    } catch (err) {
      console.warn('Supabase fetchCategories fallback:', err.message);
    }
  }

  const res = await fetchWithRetry(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Gagal memuat data kategori');
  return res.json();
}

/**
 * 8. Reset Database
 */
export async function resetDatabase() {
  const res = await fetchWithRetry(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Gagal mereset database');
  return res.json();
}
