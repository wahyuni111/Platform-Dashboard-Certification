import React from 'react';
import { X, Printer, Users, ExternalLink } from 'lucide-react';

export default function DrilldownModal({
  isOpen,
  statusType,
  members = [],
  onClose,
  onPrintGroup,
  onSelectMember
}) {
  if (!isOpen) return null;

  const getModalMeta = () => {
    switch (statusType) {
      case 'Siap Daftar':
        return {
          title: 'Nominasi Pelaku Usaha: Siap Daftar BPJPH (Skor ≥ 80%)',
          sub: 'Daftar anggota yang telah memenuhi syarat SJPH BPJPH dan siap diajukan penerbitan Sertifikat Halal Self-Declare.',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'Perlu Pendampingan':
        return {
          title: 'Agenda Prioritas: Pelaku Usaha Perlu Pendampingan Teknis (Skor 50-79%)',
          sub: 'Daftar anggota yang memerlukan pendampingan pengurusan NIB, manual SJPH, dan bukti halal bumbu pabrik.',
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'Belum Siap':
        return {
          title: 'Target Fasilitasi Dokumen Dasar: Belum Siap (Skor < 50%)',
          sub: 'Daftar anggota prioritas fasilitasi pembuatan NIB OSS-RBA dan edukasi higienitas dasar di Balai Desa.',
          badge: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      default:
        return {
          title: 'Rekapitulasi Seluruh Pelaku Usaha Terdata (Total 45 UMKM)',
          sub: 'Daftar monitoring komprehensif seluruh anggota pelaku usaha terdata Pimpinan Ranting Fatayat NU Desa Mersi.',
          badge: 'bg-nu-100 text-nu-800 border-nu-300'
        };
    }
  };

  const meta = getModalMeta();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-nu-800 text-white rounded-xl shadow-sm mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border mb-1.5 ${meta.badge}`}>
                {statusType === 'ALL' ? 'Semua Anggota' : statusType} ({members.length} Usaha)
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {meta.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {meta.sub}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">No</th>
                <th className="py-2.5 px-3">ID & Nama Pemilik</th>
                <th className="py-2.5 px-3">Nama Usaha / Merek</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">NIB OSS-RBA</th>
                <th className="py-2.5 px-3 text-center">Skor SJPH</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{m.nama}</div>
                    <div className="font-mono text-[11px] text-slate-400">{m.id}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-nu-800">{m.usaha}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {m.kategori}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">
                    {m.has_valid_nib ? m.nib : <span className="text-rose-500 font-semibold italic">Belum Ada</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                    {m.skor}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectMember(m.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-nu-50 text-nu-800 hover:bg-nu-100 border border-nu-200 transition-colors"
                    >
                      <span>Detail</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Dokumen cetak resmi memuat Kop Surat Ranting & Kolom Tanda Tangan 3 Pihak
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={() => onPrintGroup(statusType)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-nu-800 hover:bg-nu-900 text-white shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh Berkas Rekap (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
