import React from 'react';

export default function PrintGroupReport({ statusType, members = [] }) {
  const getGroupTitle = () => {
    switch (statusType) {
      case 'Siap Daftar':
        return {
          title: 'BERKAS REKAPITULASI PELAKU USAHA: SIAP DAFTAR SERTIFIKASI HALAL (SKOR ≥ 80%)',
          note: 'Daftar anggota yang telah memenuhi syarat SJPH BPJPH dan siap diajukan penerbitan Sertifikat Halal Self-Declare.'
        };
      case 'Perlu Pendampingan':
        return {
          title: 'BERKAS REKAPITULASI PELAKU USAHA: AGENDA PRIORITAS PENDAMPINGAN PPH (SKOR 50-79%)',
          note: 'Daftar anggota yang memerlukan pendampingan pengurusan NIB, manual SJPH, dan bukti halal bahan kritis pabrik.'
        };
      case 'Belum Siap':
        return {
          title: 'BERKAS REKAPITULASI PELAKU USAHA: TARGET FASILITASI DOKUMEN & LEGALITAS DASAR (SKOR < 50%)',
          note: 'Daftar anggota yang menjadi prioritas pembuatan NIB OSS-RBA dan edukasi higienitas dasar di Balai Desa.'
        };
      default:
        return {
          title: 'BERKAS REKAPITULASI SELURUH ANGGOTA PELAKU USAHA BINAAN FATAYAT NU',
          note: 'Daftar monitoring komprehensif seluruh anggota pelaku usaha terdata Pimpinan Ranting Fatayat NU Desa Mersi.'
        };
    }
  };

  const meta = getGroupTitle();
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div id="printGroupContainer" className="print-only p-4 bg-white text-slate-900 text-xs">
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
            {meta.title}
          </h4>
          <p className="text-[10px] text-slate-600 italic mt-0.5">
            {meta.note} &bull; Total Terlampir: <strong>{members.length} Usaha</strong>
          </p>
        </div>
      </div>

      {/* TABEL ANGGOTA KELOMPOK */}
      <table className="w-full border-collapse border border-slate-400 text-[10px] mb-6">
        <thead>
          <tr className="bg-slate-100 font-bold border-b border-slate-400 text-slate-800">
            <th className="border border-slate-400 p-1 w-7 text-center">No</th>
            <th className="border border-slate-400 p-1 w-16 text-center">ID Anggota</th>
            <th className="border border-slate-400 p-1 text-left">Nama Pelaku Usaha</th>
            <th className="border border-slate-400 p-1 text-left">Nama Merek / Usaha</th>
            <th className="border border-slate-400 p-1 text-center w-24">Kategori</th>
            <th className="border border-slate-400 p-1 text-center w-28">NIB OSS-RBA</th>
            <th className="border border-slate-400 p-1 text-center w-14">Skor</th>
            <th className="border border-slate-400 p-1 text-center w-28">Status BPJPH</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, idx) => (
            <tr key={m.id} className="border-b border-slate-300">
              <td className="border border-slate-300 p-1 text-center font-mono">{idx + 1}</td>
              <td className="border border-slate-300 p-1 text-center font-mono font-bold">{m.id}</td>
              <td className="border border-slate-300 p-1 font-semibold">{m.nama}</td>
              <td className="border border-slate-300 p-1">{m.usaha}</td>
              <td className="border border-slate-300 p-1 text-center">{m.kategori}</td>
              <td className="border border-slate-300 p-1 text-center font-mono text-[9px]">
                {m.has_valid_nib ? m.nib : '-'}
              </td>
              <td className="border border-slate-300 p-1 text-center font-bold font-mono">{m.skor}%</td>
              <td className="border border-slate-300 p-1 text-center font-bold text-[9px]">
                {m.status?.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* KOLOM PENGESAHAN 3 PIHAK */}
      <div className="mt-8 text-center text-[10px]">
        <p className="text-right text-slate-600 mb-4 pr-6">
          Ditetapkan di: Mersi, Purwokerto Timur &bull; Tanggal: {currentDate}
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-slate-600 mb-14">Koordinator Pendamping PPH,</p>
            <p className="font-bold underline text-slate-900">Hj. Siti Rohmah, S.Pd.</p>
            <p className="text-slate-500 text-[9px]">NIP. PPH-BPJPH-2026.04.019</p>
          </div>

          <div>
            <p className="text-slate-600 mb-14">Sekretaris Pimpinan Ranting,</p>
            <p className="font-bold underline text-slate-900">Nurul Latifah, S.E.</p>
            <p className="text-slate-500 text-[9px]">Pimpinan Ranting Fatayat NU Mersi</p>
          </div>

          <div>
            <p className="text-slate-600 mb-14">Ketua Pimpinan Ranting,</p>
            <p className="font-bold underline text-slate-900">Hj. Mutmainah, M.Pd.</p>
            <p className="text-slate-500 text-[9px]">Pimpinan Ranting Fatayat NU Mersi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
