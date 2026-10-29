import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function BottleneckList({ bottlenecks = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Analisis Bottlenecks Utama (Titik Hambatan Kritis)
          </h2>
          <p className="text-xs text-slate-500">
            5 hambatan dokumen sertifikasi terbanyak yang dihadapi anggota Fatayat NU Desa Mersi
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {bottlenecks.map((item, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1">
              <div className="flex items-center gap-2 text-slate-700">
                <span className={`w-2 h-2 rounded-full ${item.dot}`}></span>
                <span>{item.label}</span>
              </div>
              <span className="font-mono text-slate-600">
                {item.count} Usaha ({item.percent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 italic">
              Rekomendasi: {item.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
