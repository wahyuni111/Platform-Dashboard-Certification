import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ExecutiveSummaryView from './components/ExecutiveSummaryView';
import MemberDetailView from './components/MemberDetailView';
import DrilldownModal from './components/DrilldownModal';
import PrintMemberReport from './components/PrintMemberReport';
import PrintGroupReport from './components/PrintGroupReport';
import {
  fetchMembers,
  fetchMember,
  toggleCriterion,
  fetchStats,
  fetchBottlenecks,
  fetchCategories,
  resetDatabase
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('FTY-001');
  const [activeMember, setActiveMember] = useState(null);

  const [stats, setStats] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [categories, setCategories] = useState(null);

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalState, setModalState] = useState({
    isOpen: false,
    statusType: 'ALL'
  });

  const [groupPrintMembers, setGroupPrintMembers] = useState([]);

  // Load initial global statistics
  const loadGlobalStats = useCallback(async () => {
    try {
      const [s, b, c] = await Promise.all([
        fetchStats(),
        fetchBottlenecks(),
        fetchCategories()
      ]);
      setStats(s);
      setBottlenecks(b);
      setCategories(c);
    } catch (err) {
      console.error('Error loading global stats:', err);
    }
  }, []);

  // Load members list with filters
  const loadMembersList = useCallback(async () => {
    try {
      const data = await fetchMembers(filterCategory, filterStatus, searchQuery);
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  }, [filterCategory, filterStatus, searchQuery]);

  // Load active member detail
  const loadActiveMember = useCallback(async (id) => {
    try {
      const m = await fetchMember(id);
      setActiveMember(m);
    } catch (err) {
      console.error('Error loading active member:', err);
    }
  }, []);

  useEffect(() => {
    loadGlobalStats();
  }, [loadGlobalStats]);

  useEffect(() => {
    loadMembersList();
  }, [loadMembersList]);

  useEffect(() => {
    if (selectedMemberId) {
      loadActiveMember(selectedMemberId);
    }
  }, [selectedMemberId, loadActiveMember]);

  // Handle member selection
  const handleSelectMember = (id, switchTab = false) => {
    setSelectedMemberId(id);
    if (switchTab) {
      setActiveTab('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle live toggle audit criterion
  const handleToggleCriterion = async (fieldKey) => {
    if (!selectedMemberId) return;
    try {
      const updated = await toggleCriterion(selectedMemberId, fieldKey);
      setActiveMember(updated);

      // Refresh list and stats
      loadMembersList();
      loadGlobalStats();
    } catch (err) {
      alert('Gagal mengubah status kriteria: ' + err.message);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  // Open KPI Drilldown modal
  const handleOpenModal = async (statusType) => {
    try {
      let filtered = members;
      if (statusType !== 'ALL') {
        const fullList = await fetchMembers('ALL', statusType, '');
        filtered = fullList;
      } else {
        const fullList = await fetchMembers('ALL', 'ALL', '');
        filtered = fullList;
      }
      setGroupPrintMembers(filtered);
      setModalState({ isOpen: true, statusType });
    } catch (err) {
      console.error('Error opening drilldown modal:', err);
    }
  };

  // Print Individual Audit Report
  const handlePrintAudit = () => {
    document.body.classList.remove('printing-group');
    window.print();
  };

  // Print Group Rekapitulasi Report
  const handlePrintGroup = (statusType) => {
    document.body.classList.add('printing-group');
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Sticky Header */}
      <Header
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={(id) => handleSelectMember(id, false)}
        onResetFilters={handleResetFilters}
      />

      {/* Tabs */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Container */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'summary' ? (
          <ExecutiveSummaryView
            members={members}
            stats={stats}
            bottlenecks={bottlenecks}
            categories={categories}
            filterCategory={filterCategory}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onCategoryChange={setFilterCategory}
            onStatusChange={setFilterStatus}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            onCardClick={handleOpenModal}
            onSelectMember={(id) => handleSelectMember(id, true)}
          />
        ) : (
          <MemberDetailView
            member={activeMember}
            onToggleCriterion={handleToggleCriterion}
            onPrintAudit={handlePrintAudit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-nu-900">SIM-HALAL</span>
            <span>&bull;</span>
            <span>PR Fatayat NU Desa Mersi, Purwokerto Timur</span>
          </div>
          <div className="text-slate-400">
            Sains Data untuk Masyarakat (SDUM) 2026 &bull; Modern Stack: React + Vite + Tailwind CSS & Golang Backend
          </div>
        </div>
      </footer>

      {/* Drilldown Modal on KPI Card click */}
      <DrilldownModal
        isOpen={modalState.isOpen}
        statusType={modalState.statusType}
        members={groupPrintMembers}
        onClose={() => setModalState({ isOpen: false, statusType: 'ALL' })}
        onPrintGroup={handlePrintGroup}
        onSelectMember={(id) => handleSelectMember(id, true)}
      />

      {/* Print View 1: Individual Member Report (A4 PDF) */}
      <PrintMemberReport member={activeMember} />

      {/* Print View 2: Group Rekapitulasi Report (A4 PDF) */}
      <PrintGroupReport
        statusType={modalState.statusType}
        members={groupPrintMembers}
      />
    </div>
  );
}
