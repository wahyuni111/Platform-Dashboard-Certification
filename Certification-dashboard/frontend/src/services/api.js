const API_BASE = '/api';

export async function fetchMembers(category = 'ALL', status = 'ALL', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (status && status !== 'ALL') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/members?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat daftar anggota');
  return res.json();
}

export async function fetchMember(id) {
  const res = await fetch(`${API_BASE}/members/${id}`);
  if (!res.ok) throw new Error(`Anggota ${id} tidak ditemukan`);
  return res.json();
}

export async function toggleCriterion(id, field) {
  const res = await fetch(`${API_BASE}/members/${id}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field })
  });
  if (!res.ok) throw new Error('Gagal memperbarui kriteria audit');
  return res.json();
}

export async function updateMember(id, data) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal memperbarui data anggota');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Gagal memuat statistik');
  return res.json();
}

export async function fetchBottlenecks() {
  const res = await fetch(`${API_BASE}/bottlenecks`);
  if (!res.ok) throw new Error('Gagal memuat bottlenecks');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Gagal memuat data kategori');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Gagal mereset database');
  return res.json();
}
