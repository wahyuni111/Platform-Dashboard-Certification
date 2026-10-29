import React from 'react';
import { Check, Clock } from 'lucide-react';

export default function HalalMilestones({ milestones = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-6">
      <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Pelacak Milestone Halal Journey
          </h3>
          <p className="text-xs text-slate-500">
            Alur 5 tahapan kelayakan menuju pengajuan Sertifikat Halal BPJPH
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
        {milestones.map((m, idx) => (
          <div
            key={m.step}
            className={`p-3.5 rounded-xl border transition-all ${
              m.done
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                m.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {m.step}
              </span>
              {m.done ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Selesai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Tertunda
                </span>
              )}
            </div>

            <h4 className="font-bold text-xs sm:text-sm line-clamp-1 mb-1">
              {m.title}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {m.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
