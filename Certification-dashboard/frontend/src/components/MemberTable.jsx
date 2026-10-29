import React from 'react';
import { ExternalLink, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { openWhatsApp } from '../services/whatsapp';

export default function MemberTable({ members = [], onSelectMember }) {
  const getStatusBadge = (skor) => {
    if (skor >= 80) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        bar: 'bg-gradient-to-r from-emerald-500 to-nu-700',
        text: 'Siap Daftar'
      };
    }
    if (skor >= 50) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        bar: 'bg-gradient-to-r from-amber-500 to-amber-600',
        text: 'Perlu Pendampingan'
      };
    }
    return {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      bar: 'bg-gradient-to-r from-rose-500 to-red-600',
      text: 'Belum Siap'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nu-100 rounded-xl text-nu-800">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Tabel Master Monitoring Kesiapan Anggota
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {members.length} pelaku usaha berdasarkan filter pencarian
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 sm:px-4 text-center w-12">No</th>
              <th className="py-3 px-3 sm:px-4">ID & Pelaku Usaha</th>
              <th className="py-3 px-3 sm:px-4">Kategori & Alamat</th>
              <th className="py-3 px-3 sm:px-4">NIB OSS-RBA</th>
              <th className="py-3 px-3 sm:px-4">Skor & Kelayakan BPJPH</th>
              <th className="py-3 px-3 sm:px-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Tidak ada anggota yang sesuai dengan kriteria filter saat ini.
                </td>
              </tr>
            ) : (
              members.map((m, idx) => {
                const badge = getStatusBadge(m.skor);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="font-bold text-slate-900">{m.nama}</div>
                      <div className="text-xs text-nu-700 font-medium">{m.usaha}</div>
                      <div className="text-[11px] font-mono text-slate-400">{m.id}</div>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {m.kategori}
                      </span>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">
                        {m.alamat}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 font-mono text-xs">
                      {m.has_valid_nib ? (
                        <span className="text-emerald-700 font-semibold">{m.nib}</span>
                      ) : (
                        <span className="text-rose-500 font-semibold italic">Belum Ada</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 min-w-[180px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badge}`}>
                          {badge.text}
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {m.skor}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${badge.bar} rounded-full`}
                          style={{ width: `${m.skor}%` }}
                        ></div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectMember(m.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-nu-700 hover:bg-nu-800 text-white shadow-sm transition-all"
                          title="Buka Dashboard Mandiri & Simulasi Audit"
                        >
                          <span>Audit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => openWhatsApp(m)}
                          className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="Kirim Lembar Hasil ke WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
