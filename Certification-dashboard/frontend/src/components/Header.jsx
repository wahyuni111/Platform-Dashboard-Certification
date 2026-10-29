import React from 'react';
import { RotateCcw, LogOut, ShieldCheck, UserCheck, Lock } from 'lucide-react';

export default function Header({
  members = [],
  selectedMemberId,
  onSelectMember,
  onResetFilters,
  currentUser,
  onLogout
}) {
  const isMember = currentUser?.role === 'member';
  const activeMemberObj = members.find((m) => m.id === selectedMemberId) || members[0];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-nu-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo Fatayat NU Icon Badge */}
            <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-nu-800 via-nu-700 to-nu-600 flex items-center justify-center text-white shadow-md shadow-nu-900/25 ring-2 ring-nu-500/30">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2z"/>
                <path d="M12 8v5" stroke="currentColor" strokeWidth="2.2"/>
                <circle cx="12" cy="15.5" r="0.7" fill="currentColor"/>
              </svg>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
              </span>
            </div>

            {/* Title text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-nu-100 text-nu-800 tracking-wide">
                  SDUM 2026
                </span>
                {isMember ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <UserCheck className="w-3 h-3 text-emerald-700" />
                    Akun Pelaku Usaha
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    Pengurus Fatayat NU (Akses Penuh)
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-lg md:text-xl font-extrabold text-nu-900 tracking-tight truncate leading-tight mt-0.5">
                SIM-HALAL FATAYAT NU DESA MERSI
              </h1>
            </div>
          </div>

          {/* Right: Member Selector (Locked for Member, Selectable for Admin) + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {isMember ? (
              /* MEMBER USER: LOCKED / CANNOT CLICK DROPDOWN TO OTHER MEMBERS */
              <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-300 rounded-xl px-3 py-1.5 sm:py-2 select-none" title="Akun Anda terkunci pada profil usaha mandiri Anda">
                <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <div className="min-w-0 text-left">
                  <div className="text-[10px] font-bold text-slate-500 leading-none">
                    Profil Mandiri Anda:
                  </div>
                  <div className="text-xs font-black text-nu-900 truncate max-w-[150px] sm:max-w-[220px]">
                    {activeMemberObj?.nama || currentUser?.userName} &bull; {activeMemberObj?.usaha || currentUser?.businessName}
                  </div>
                </div>
              </div>
            ) : (
              /* ADMIN USER: FULL UNRESTRICTED DROPDOWN TO SELECT ANY MEMBER */
              <>
                <div className="relative min-w-[150px] sm:min-w-[240px]">
                  <select
                    id="memberSelect"
                    value={selectedMemberId || ''}
                    onChange={(e) => onSelectMember(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 hover:border-nu-500 text-slate-800 rounded-xl px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-nu-600/30 focus:border-nu-600 outline-none transition-all cursor-pointer truncate"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        [{m.id}] {m.nama} &bull; {m.usaha}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={onResetFilters}
                  title="Reset Filter"
                  className="p-1.5 sm:p-2 text-slate-500 hover:text-nu-800 hover:bg-nu-50 rounded-xl border border-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Logout / Keluar Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar / Ganti Akun"
                className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
