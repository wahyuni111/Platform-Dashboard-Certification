import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Phone, MapPin, FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import HalalMilestones from './HalalMilestones';
import ComparisonColumns from './ComparisonColumns';
import AuditChecklist from './AuditChecklist';
import ActionBox from './ActionBox';

export default function MemberDetailView({
  member,
  onToggleCriterion,
  onPrintAudit
}) {
  if (!member) {
    return (
      <div className="py-16 text-center text-slate-400">
        Silakan pilih anggota untuk melihat Dashboard Mandiri.
      </div>
    );
  }

  // Trigger celebration confetti if score is 100%
  useEffect(() => {
    if (member.skor === 100) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [member.skor]);

  const getStatusTheme = (skor) => {
    if (skor >= 80) {
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        bar: 'bg-gradient-to-r from-emerald-500 to-nu-700',
        text: 'text-emerald-700',
        label: 'Siap Daftar (Memenuhi Syarat BPJPH)',
        icon: CheckCircle2
      };
    }
    if (skor >= 50) {
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        bar: 'bg-gradient-to-r from-amber-500 to-amber-600',
        text: 'text-amber-600',
        label: 'Perlu Pendampingan Teknis',
        icon: AlertTriangle
      };
    }
    return {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      bar: 'bg-gradient-to-r from-rose-500 to-red-600',
      text: 'text-rose-600',
      label: 'Belum Siap (Fasilitasi NIB OSS-RBA)',
      icon: XCircle
    };
  };

  const theme = getStatusTheme(member.skor);
  const StatusIcon = theme.icon;

  return (
    <div className="fade-enter">
      {/* 1. Warm Personal Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Identity info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-nu-800 to-nu-600 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md flex-shrink-0">
              {member.nama ? member.nama.charAt(0) : 'U'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {member.id}
                </span>
                <span className="text-xs font-semibold bg-nu-100 text-nu-800 px-2 py-0.5 rounded">
                  {member.kategori}
                </span>
                <span className="text-xs text-slate-400">
                  Penyelia: <strong className="text-slate-700">{member.penyelia_nama}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {member.nama}
              </h2>
              <p className="text-sm sm:text-base font-bold text-nu-800 mb-2">
                {member.usaha}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.formatted_phone || member.kontak}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {member.alamat}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  NIB: <strong className={member.has_valid_nib ? 'text-emerald-700' : 'text-rose-600'}>
                    {member.nib || '-'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Big Score Card */}
          <div className="w-full lg:w-72 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Skor Kesiapan SJPH
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badge}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {member.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900 font-mono">
                {member.skor}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / 100% Bobot BPJPH
              </span>
              {member.skor === 100 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sempurna!
                </span>
              )}
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full ${theme.bar} rounded-full progress-bar-fill`}
                style={{ width: `${member.skor}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Milestone Halal Journey Tracker */}
      <HalalMilestones milestones={member.journey_milestones || []} />

      {/* 3. 2-Column Comparison: [V] vs [X] */}
      <ComparisonColumns
        completedItems={member.completed_items || []}
        pendingItems={member.pending_items || []}
      />

      {/* 4. Interactive 4-Pillar Matrix (18 Indicators) */}
      <AuditChecklist
        member={member}
        onToggleCriterion={onToggleCriterion}
      />

      {/* 5. Action Box & Quick Consult */}
      <ActionBox
        member={member}
        onPrintAudit={onPrintAudit}
      />
    </div>
  );
}
