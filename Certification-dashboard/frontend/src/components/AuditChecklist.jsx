import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export default function AuditChecklist({ member, onToggleCriterion }) {
  if (!member) return null;

  const pillars = [
    {
      id: 1,
      title: 'Pilar 1: Legalitas Usaha & Komitmen',
      subtitle: 'Identitas hukum pelaku usaha mikro & izin edar',
      weight: '25%',
      badgeClass: 'bg-nu-100 text-nu-800 border-nu-200',
      items: [
        {
          key: 'ktp_pemilik',
          title: 'KTP Pemilik Usaha',
          desc: 'KTP-el warga Desa Mersi terverifikasi aktif.',
          passed: member.ktp_pemilik,
          isLocked: true // Selalu terpenuhi untuk anggota
        },
        {
          key: 'nib',
          title: 'NIB Berbasis OSS-RBA',
          desc: member.has_valid_nib
            ? `Nomor NIB: ${member.nib} terdaftar valid.`
            : 'Belum memiliki NIB OSS-RBA (Prasyarat Wajib).',
          passed: member.has_valid_nib,
          isLocked: false
        },
        {
          key: 'kbli',
          title: 'Kode KBLI Sesuai Pangan Olahan',
          desc: member.kbli
            ? 'KBLI sesuai kelompok pangan/kudapan.'
            : 'Kode KBLI belum terdaftar sesuai olahan pangan.',
          passed: member.kbli,
          isLocked: false
        },
        {
          key: 'sihalal',
          title: 'Akun SIHALAL Aktif (ptsp.halal.go.id)',
          desc: member.sihalal
            ? 'Akun BPJPH aktif dan tersinkronisasi.'
            : 'Akun belum dibuat atau belum diverifikasi.',
          passed: member.sihalal,
          isLocked: false
        },
        {
          key: 'permohonan',
          title: 'Surat Permohonan Sertifikasi Halal',
          desc: member.permohonan
            ? 'Draf permohonan self-declare telah siap.'
            : 'Formulir permohonan belum dicetak/ditandatangani.',
          passed: member.permohonan,
          isLocked: false
        }
      ]
    },
    {
      id: 2,
      title: 'Pilar 2: Bahan Baku & Bumbu',
      subtitle: 'Kepastian status kehalalan formula komposisi',
      weight: '35%',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      items: [
        {
          key: 'daftar_bahan',
          title: 'Formulir Rincian Semua Bahan Baku',
          desc: member.daftar_bahan
            ? 'Formula dan komposisi bahan tercatat rapi.'
            : 'Daftar bahan dan bumbu belum dirinci lengkap.',
          passed: member.daftar_bahan,
          isLocked: false
        },
        {
          key: 'bahan_nonkritis',
          title: 'Bahan Non-Kritis Masuk Positive List',
          desc: member.bahan_nonkritis
            ? 'Bahan nabati murni (tepung, gula, dll) terverifikasi.'
            : 'Status bahan baku non-kritis belum dipastikan.',
          passed: member.bahan_nonkritis,
          isLocked: false
        },
        {
          key: 'bahan_kritis_halal',
          title: 'Bukti Sertifikat Halal Bumbu Olahan',
          desc: member.bahan_kritis_halal
            ? 'Foto label & sertifikat halal bumbu pabrik lengkap.'
            : 'Bukti sertifikat bumbu/minyak kemasan belum ada.',
          passed: member.bahan_kritis_halal,
          isLocked: false
        },
        {
          key: 'air_bersih',
          title: 'Sumber Air Bersih Standar Pangan',
          desc: member.air_bersih
            ? 'Air jernih tidak berbau, higienis untuk pangan.'
            : 'Kualitas air dapur belum memenuhi standar.',
          passed: member.air_bersih,
          isLocked: false
        }
      ]
    },
    {
      id: 3,
      title: 'Pilar 3: Alur Proses Halal (PPH)',
      subtitle: 'Sanitasi, kebersihan dapur, & pemisahan alat',
      weight: '25%',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      items: [
        {
          key: 'dapur_bersih',
          title: 'Sanitasi Dapur Produksi',
          desc: member.dapur_bersih
            ? 'Area dapur bersih, bebas najis & hewan piaraan.'
            : 'Dapur masih tercampur area kotor/ada hewan.',
          passed: member.dapur_bersih,
          isLocked: false
        },
        {
          key: 'alat_khusus',
          title: 'Pemisahan Alat Masak & Wadah',
          desc: member.alat_khusus
            ? 'Wajan, pisau & wadah khusus pengolahan halal.'
            : 'Peralatan masak belum dipisahkan secara khusus.',
          passed: member.alat_khusus,
          isLocked: false
        },
        {
          key: 'manual_sjph',
          title: 'Manual SJPH Tertulis (SOP PPH)',
          desc: member.manual_sjph
            ? 'Dokumen komitmen SJPH sederhana telah disusun.'
            : 'Belum menyusun dokumen Manual SJPH tertulis.',
          passed: member.manual_sjph,
          isLocked: false
        },
        {
          key: 'kemasan_higienis',
          title: 'Kemasan Rapat Bebas Kontaminasi',
          desc: member.kemasan_higienis
            ? 'Kemasan produk tertutup rapat & bersih.'
            : 'Kemasan masih terbuka atau rentan tercemar.',
          passed: member.kemasan_higienis,
          isLocked: false
        }
      ]
    },
    {
      id: 4,
      title: 'Pilar 4: SDM & Komitmen Halal',
      subtitle: 'Penunjukan penyelia halal & ikrar bermaterai',
      weight: '15%',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      items: [
        {
          key: 'penyelia_nama',
          title: 'Penyelia Halal Muslim',
          desc: `Penyelia halal ditunjuk: ${member.penyelia_nama || member.nama}.`,
          passed: Boolean(member.penyelia_nama),
          isLocked: true
        },
        {
          key: 'penyelia_ktp',
          title: 'Salinan KTP Penyelia Halal',
          desc: member.penyelia_ktp
            ? 'Fotokopi KTP penyelia terlampir rapi.'
            : 'Salinan KTP penyelia belum dikumpulkan.',
          passed: member.penyelia_ktp,
          isLocked: false
        },
        {
          key: 'surat_penyelia',
          title: 'SK Penetapan Penyelia Halal',
          desc: member.surat_penyelia
            ? 'Surat keputusan penetapan telah ditandatangani.'
            : 'SK penetapan internal belum ditandatangani.',
          passed: member.surat_penyelia,
          isLocked: false
        },
        {
          key: 'ikrar_materai',
          title: 'Ikrar Halal Bermaterai Rp10.000',
          desc: member.ikrar_materai
            ? 'Pernyataan ikrar bermaterai Rp10.000 sah.'
            : 'Surat ikrar belum bermaterai / belum ditandatangani.',
          passed: member.ikrar_materai,
          isLocked: false
        },
        {
          key: 'nama_layak',
          title: 'Nama Merek Bebas Konotasi Haram',
          desc: member.nama_layak
            ? 'Nama usaha & produk bernuansa baik & halal.'
            : 'Nama merek mengandung unsur dilarang.',
          passed: member.nama_layak,
          isLocked: false
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nu-100 text-nu-800 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Matriks 4 Pilar Kriteria Standar SJPH (18 Indikator)
            </h3>
            <p className="text-xs text-slate-500">
              Klik butir kriteria untuk simulasi audit secara live. Skor dan status akan terhitung otomatis!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="rounded-2xl border border-slate-200 p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${pillar.badgeClass}`}>
                  {pillar.title}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                  Bobot {pillar.weight}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{pillar.subtitle}</p>

              <div className="space-y-2.5">
                {pillar.items.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => !item.isLocked && onToggleCriterion(item.key)}
                    className={`p-3 rounded-xl border transition-all select-none ${
                      item.isLocked ? 'cursor-default opacity-85' : 'cursor-pointer hover:shadow-sm'
                    } ${
                      item.passed
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                            item.passed
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-slate-50 text-slate-300'
                          }`}
                        >
                          {item.passed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          item.passed
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.passed ? 'MEMENUHI' : 'KURANG'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 pl-7 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
