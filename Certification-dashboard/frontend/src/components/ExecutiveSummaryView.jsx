import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import KPICards from './KPICards';
import BottleneckList from './BottleneckList';
import CategoryChart from './CategoryChart';
import MemberTable from './MemberTable';

export default function ExecutiveSummaryView({
  members = [],
  stats,
  bottlenecks = [],
  categories,
  filterCategory,
  filterStatus,
  searchQuery,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onResetFilters,
  onCardClick,
  onSelectMember
}) {
  return (
    <div className="fade-enter">
      {/* Top Banner Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-nu-800 to-nu-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-nu">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            <span>Standar SJPH BPJPH RI (Self-Declare 2026)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Monitoring Kesiapan Sertifikasi Halal PR Fatayat NU Desa Mersi
          </h2>
          <p className="text-xs sm:text-sm text-nu-100 max-w-2xl mt-1">
            Pantau status verifikasi 4 pilar standar jaminan produk halal secara terintegrasi untuk 45 unit usaha mikro binaan.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Category & Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 hover:border-nu-500 text-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-nu-600/30 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Kategori (45)</option>
              <option value="Kudapan Kering">Kudapan Kering (25)</option>
              <option value="Makanan Basah">Makanan Basah (16)</option>
              <option value="Minuman">Minuman (4)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 hover:border-nu-500 text-slate-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-nu-600/30 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Status BPJPH</option>
              <option value="Siap Daftar">Siap Daftar (≥ 80%)</option>
              <option value="Perlu Pendampingan">Perlu Pendampingan (50-79%)</option>
              <option value="Belum Siap">Belum Siap (&lt; 50%)</option>
            </select>
          </div>

          {/* Right: Search Box & Reset Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama, usaha, NIB..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-nu-600 focus:ring-2 focus:ring-nu-600/30 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-nu-900 bg-slate-100 hover:bg-nu-50 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 KPI Cards */}
      <KPICards stats={stats} onCardClick={onCardClick} />

      {/* 2-Column Grid: Bottlenecks & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BottleneckList bottlenecks={bottlenecks} />
        <CategoryChart categories={categories} />
      </div>

      {/* Master UMKM Table */}
      <MemberTable members={members} onSelectMember={onSelectMember} />
    </div>
  );
}
