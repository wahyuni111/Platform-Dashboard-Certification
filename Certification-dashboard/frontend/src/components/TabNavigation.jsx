import React from 'react';
import { LayoutDashboard, UserCheck } from 'lucide-react';

export default function TabNavigation({ activeTab, onTabChange }) {
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
