import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Users, ArrowUpRight } from 'lucide-react';

export default function KPICards({ stats, onCardClick }) {
  const cards = [
    {
      type: 'Siap Daftar',
      title: 'Siap Daftar',
      sub: 'Skor ≥ 80% (Berkas Inti Lengkap)',
      count: stats?.siap_daftar ?? 0,
      pct: stats?.siap_daftar_pct ?? 0,
      icon: CheckCircle2,
      border: 'border-emerald-200 hover:border-emerald-500',
      bg: 'bg-emerald-50/60',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800',
      desc: 'Klik untuk lihat nominasi & cetak berkas BPJPH'
    },
    {
      type: 'Perlu Pendampingan',
      title: 'Perlu Pendampingan',
      sub: 'Skor 50–79% (Perlu Bimbingan Dokumen)',
      count: stats?.pendampingan ?? 0,
      pct: stats?.pendampingan_pct ?? 0,
      icon: AlertTriangle,
      border: 'border-amber-200 hover:border-amber-500',
      bg: 'bg-amber-50/60',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800',
      desc: 'Klik untuk agenda pendampingan PPH Ranting'
    },
    {
      type: 'Belum Siap',
      title: 'Belum Siap',
      sub: 'Skor < 50% (Fasilitasi NIB Balai Desa)',
      count: stats?.belum_siap ?? 0,
      pct: stats?.belum_siap_pct ?? 0,
      icon: XCircle,
      border: 'border-rose-200 hover:border-rose-500',
      bg: 'bg-rose-50/60',
      text: 'text-rose-800',
      badge: 'bg-rose-100 text-rose-800',
      desc: 'Klik untuk target fasilitasi legalitas dasar'
    },
    {
      type: 'ALL',
      title: 'Total Terdata',
      sub: 'Pelaku Usaha Anggota Fatayat NU Mersi',
      count: stats?.total ?? 0,
      pct: 100,
      icon: Users,
      border: 'border-nu-200 hover:border-nu-600',
      bg: 'bg-nu-50/60',
      text: 'text-nu-900',
      badge: 'bg-nu-100 text-nu-800',
      desc: 'Klik untuk rekapitulasi data lengkap 45 UMKM'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.type}
            onClick={() => onCardClick(card.type)}
            className={`group relative p-5 rounded-2xl bg-white border ${card.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${card.badge}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {card.title}
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-3xl sm:text-4xl font-extrabold ${card.text}`}>
                  {card.count}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Usaha ({card.pct}%)
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {card.sub}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-nu-700 font-medium transition-colors">
              <span>{card.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
