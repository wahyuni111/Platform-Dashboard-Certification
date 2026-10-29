import React from 'react';

export default function PrintMemberReport({ member }) {
  if (!member) return null;

  const allItems = [
    ...(member.completed_items || []).map(i => ({ ...i, passed: true })),
    ...(member.pending_items || []).map(i => ({ ...i, passed: false }))
  ];

  return (
    <div id="printReportContainer" className="print-only p-4 bg-white text-slate-900 text-xs">
      {/* KOP SURAT RESMI */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
        <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
          PIMPINAN RANTING FATAYAT NAHDLATUL ULAMA DESA MERSI
        </h2>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          KECAMATAN PURWOKERTO TIMUR &bull; KABUPATEN BANYUMAS
        </h3>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Sekretariat: Balai Pertemuan RW 01 Desa Mersi, Purwokerto Timur &bull; Program Sains Data untuk Masyarakat 2026
        </p>
        <div className="mt-2 border-t border-slate-400 pt-1">
          <h4 className="text-xs font-black uppercase tracking-wide underline">
            LEMBAR HASIL AUDIT MANDIRI KESIAPAN SERTIFIKASI HALAL BPJPH (JALUR SELF-DECLARE)
          </h4>
        </div>
      </div>

      {/* PROFIL USAHA */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4 text-[11px] bg-slate-50 p-3 rounded border border-slate-300">
        <div><strong>ID Registrasi:</strong> {member.id}</div>
        <div><strong>Kategori Produk:</strong> {member.kategori}</div>
        <div><strong>Nama Pemilik:</strong> {member.nama}</div>
        <div><strong>Nomor NIB OSS:</strong> {member.nib || '-'}</div>
        <div><strong>Nama Merek/Usaha:</strong> {member.usaha}</div>
        <div><strong>Status Kelayakan:</strong> <span className="font-bold">{member.status?.toUpperCase()} ({member.skor}%)</span></div>
        <div className="col-span-2"><strong>Alamat Dapur:</strong> {member.alamat}</div>
      </div>

      {/* TABEL 18 INDIKATOR */}
      <table className="w-full border-collapse border border-slate-400 text-[10px] mb-4">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-400 text-slate-800">
            <th className="border border-slate-400 p-1 w-8 text-center">No</th>
            <th className="border border-slate-400 p-1 text-left">Indikator Kriteria Sistem Jaminan Produk Halal (SJPH)</th>
            <th className="border border-slate-400 p-1 w-36 text-center">Pilar Standar</th>
            <th className="border border-slate-400 p-1 w-28 text-center">Hasil Verifikasi</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-300">
              <td className="border border-slate-300 p-1 text-center font-mono">{idx + 1}</td>
              <td className="border border-slate-300 p-1 font-medium">{item.label}</td>
              <td className="border border-slate-300 p-1 text-center font-semibold text-[9px]">{item.pilar}</td>
              <td className={`border border-slate-300 p-1 text-center font-bold ${item.passed ? 'text-emerald-800' : 'text-red-700'}`}>
                {item.passed ? '[ V ] MEMENUHI' : '[ X ] KURANG'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CATATAN TINDAKAN REKOMENDASI */}
      <div className="border border-slate-300 p-2.5 rounded bg-slate-50 mb-6 text-[10px]">
        <h5 className="font-bold text-slate-800 mb-1">Catatan Tindakan / Rekomendasi Dokumen:</h5>
        {member.hambatan && member.hambatan.length > 0 ? (
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
            {member.hambatan.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
        ) : (
          <p className="text-emerald-800 font-bold">
            Alhamdulillah, seluruh 18 butir syarat dokumen telah lengkap 100%. Pelaku usaha siap diajukan proses penerbitan Sertifikat Halal ke portal BPJPH.
          </p>
        )}
      </div>

      {/* TANDA TANGAN */}
      <div className="grid grid-cols-2 text-center text-[10px] mt-6 pt-4">
        <div>
          <p className="text-slate-600 mb-14">Pelaku Usaha Pemohon,</p>
          <p className="font-bold underline text-slate-900">{member.nama}</p>
          <p className="text-slate-500 text-[9px]">Pemilik Usaha {member.usaha}</p>
        </div>
        <div>
          <p className="text-slate-600 mb-14">Koordinator Pendamping Halal PPH Fatayat NU,</p>
          <p className="font-bold underline text-slate-900">Hj. Siti Rohmah, S.Pd.</p>
          <p className="text-slate-500 text-[9px]">NIP. PPH-BPJPH-2026.04.019</p>
        </div>
      </div>
    </div>
  );
}
