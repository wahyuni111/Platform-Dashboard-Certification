import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ComparisonColumns({ completedItems = [], pendingItems = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Kolom Kiri: Sudah Terlaksana [V] */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-emerald-900">
              Sudah Terlaksana & Terverifikasi [V]
            </h3>
            <p className="text-xs text-slate-500">
              {completedItems.length} butir syarat audit telah lengkap dan sah
            </p>
          </div>
        </div>

        {completedItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            Belum ada butir dokumen yang terverifikasi.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {completedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {item.pilar}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {item.desc}
                  </p>
                </div>
                <span className="flex-shrink-0 text-emerald-600 font-bold text-xs">
                  [V]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kolom Kanan: Belum Terlaksana [X] */}
      <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-amber-900">
              Belum Terlaksana & Perlu Dilengkapi [X]
            </h3>
            <p className="text-xs text-slate-500">
              {pendingItems.length} butir dokumen/tindakan yang masih menjadi pekerjaan rumah
            </p>
          </div>
        </div>

        {pendingItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-xl border border-emerald-200">
            Alhamdulillah! Seluruh 18 indikator audit SJPH telah terpenuhi 100%. Tidak ada berkas yang kurang.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {pendingItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {item.pilar}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 font-medium mt-1">
                    👉 Tindakan: {item.action}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-600 font-bold text-xs">
                  [X]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
