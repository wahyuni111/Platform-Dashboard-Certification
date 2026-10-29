import React from 'react';
import { LayoutDashboard, UserCheck, Lock } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange, currentUser }) {
  const isMember = currentUser?.role === 'member';

  // If logged in as Member, Tab 1 is hidden, show only Tab 2 active badge
  if (isMember) {
    return (
      <div className="no-print bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-nu-800 font-extrabold text-sm sm:text-base">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            <span>Tab 2: Dashboard Mandiri Pelaku Usaha</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Akses Khusus Pelaku Usaha
          </span>
        </div>
      </div>
    );
  }

  // If Pengurus Fatayat NU (Admin), show both Tab 1 and Tab 2
  return (
    <div className="no-print bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            onClick={() => onTabChange('summary')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm sm:text-base font-semibold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-nu-700 text-nu-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tab 1: Ringkasan Pengurus</span>
          </button>

          <button
            onClick={() => onTabChange('detail')}
            className={`flex items-center gap-2 py-3.5 px-2 text-sm sm:text-base font-semibold border-b-2 transition-all ${
              activeTab === 'detail'
                ? 'border-nu-700 text-nu-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tab 2: Dashboard Mandiri</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
