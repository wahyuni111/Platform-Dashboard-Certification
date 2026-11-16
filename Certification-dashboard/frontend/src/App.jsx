import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ExecutiveSummaryView from './components/ExecutiveSummaryView';
import MemberDetailView from './components/MemberDetailView';
import DrilldownModal from './components/DrilldownModal';
import PrintMemberReport from './components/PrintMemberReport';
import PrintGroupReport from './components/PrintGroupReport';
import AuthPage from './components/AuthPage';
import defaultMembersData from '../../backend/data/members.json';
import { recalculateMemberClient } from './utils/auditCalculator';
import {
  fetchMembers,
  fetchMember,
  toggleCriterion,
  updateMember,
  fetchStats,
  fetchBottlenecks,
  fetchCategories
} from './services/api';

const AUTH_STORAGE_KEY = 'simhalal_auth_session';

function detectInitialPortal() {
  if (typeof window === 'undefined') return 'member';
  const path = window.location.pathname.toLowerCase();
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith('admin.') || host.startsWith('admin-')) return 'admin';
  if (path.startsWith('/admin') || path.startsWith('/pengurus')) return 'admin';
  return 'member';
}

export default function App() {
  // Portal route state: 'member' (/) or 'admin' (/admin)
  const [currentPortal, setCurrentPortal] = useState(detectInitialPortal);

  // Authentication session state: null (not logged in), { role: 'admin'|'member', memberId, userName, businessName }
  const [authSession, setAuthSession] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(
    authSession?.role === 'member' ? 'detail' : 'summary'
  );
  const [members, setMembers] = useState(() => {
    let list = Array.isArray(defaultMembersData) ? [...defaultMembersData] : [];
    try {
      const storedCustom = localStorage.getItem('simhalal_custom_members');
      if (storedCustom) {
        const custom = JSON.parse(storedCustom);
        list = [...list, ...custom];
      }
    } catch (e) {}
    return list;
  });
  const [selectedMemberId, setSelectedMemberId] = useState(
    authSession?.memberId || 'FTY-001'
  );
  const [activeMember, setActiveMember] = useState(() => {
    const initId = authSession?.memberId || 'FTY-001';
    return (
      defaultMembersData.find((m) => m.id === initId) ||
      defaultMembersData[0] ||
      null
    );
  });

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
      console.warn('Backend stats notice (using computed local dataset):', err.message);
      // Fallback stats calculated from local dataset
      const total = defaultMembersData.length;
      const siap = defaultMembersData.filter((m) => m.status === 'Siap Daftar (Hijau)').length;
      const pendampingan = defaultMembersData.filter((m) => m.status === 'Perlu Pendampingan').length;
      const edukasi = defaultMembersData.filter((m) => m.status === 'Target Edukasi').length;
      const avg = Math.round(
        defaultMembersData.reduce((acc, m) => acc + (m.skor || 0), 0) / (total || 1)
      );
      setStats({
        total_umkm: total,
        siap_daftar: siap,
        siap_daftar_pct: Math.round((siap / (total || 1)) * 100),
        perlu_pendampingan: pendampingan,
        target_edukasi: edukasi,
        rata_rata_skor: avg
      });
      setBottlenecks([
        { label: "NIB Belum Ada / Belum OSS-RBA", percent: 65, count: 29, color: "from-red-500 to-rose-600", dot: "bg-red-500", note: "Perlu fasilitasi pendampingan pembuatan akun OSS di balai desa." },
        { label: "Bukti Halal Bumbu Olahan Belum Lengkap", percent: 55, count: 25, color: "from-amber-500 to-orange-500", dot: "bg-amber-500", note: "Pengumpulan foto kemasan / nomor sertifikat halal bahan pabrikan." },
        { label: "Belum Ada Manual SJPH Tertulis (SOP PPH)", percent: 45, count: 20, color: "from-yellow-400 to-amber-500", dot: "bg-yellow-500", note: "Dibantu dengan formulir template SJPH standar Fatayat NU." },
        { label: "Akun SIHALAL Belum Aktif (ptsp.halal.go.id)", percent: 30, count: 14, color: "from-blue-500 to-indigo-600", dot: "bg-blue-500", note: "Registrasi email pemilik usaha dan sinkronisasi data NIB." },
        { label: "Belum Tanda Tangan Surat Ikrar Halal Bermaterai", percent: 20, count: 9, color: "from-emerald-500 to-nu-700", dot: "bg-emerald-500", note: "Pemberian materai Rp10.000 dan penandatanganan kolektif ranting." }
      ]);
      setCategories({
        labels: ["Kudapan Kering", "Makanan Basah", "Minuman"],
        data: [25, 16, 4],
        percentages: [55, 35, 10],
        colors: ["#1E4D2B", "#D97706", "#3B82F6"]
      });
    }
  }, []);

  // Load members list with filters
  const loadMembersList = useCallback(async () => {
    try {
      const data = await fetchMembers(filterCategory, filterStatus, searchQuery);
      let customMembers = [];
      try {
        const storedCustom = localStorage.getItem('simhalal_custom_members');
        if (storedCustom) customMembers = JSON.parse(storedCustom);
      } catch (e) {}

      if (data && data.length > 0) {
        setMembers([...data, ...customMembers]);
      }
    } catch (err) {
      console.warn('Backend members notice (filtering local dataset):', err.message);
      let filtered = [...defaultMembersData];
      if (filterCategory && filterCategory !== 'ALL') {
        filtered = filtered.filter((m) => m.kategori === filterCategory);
      }
      if (filterStatus && filterStatus !== 'ALL') {
        filtered = filtered.filter((m) => m.status === filterStatus);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (m) =>
            m.nama.toLowerCase().includes(q) ||
            m.usaha.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q)
        );
      }
      let customMembers = [];
      try {
        const storedCustom = localStorage.getItem('simhalal_custom_members');
        if (storedCustom) customMembers = JSON.parse(storedCustom);
      } catch (e) {}
      setMembers([...filtered, ...customMembers]);
    }
  }, [filterCategory, filterStatus, searchQuery]);

  // Load active member detail
  const loadActiveMember = useCallback(async (id) => {
    try {
      const m = await fetchMember(id);
      setActiveMember(m);
    } catch (err) {
      console.warn('Backend active member notice (using local dataset):', err.message);
      setMembers((prev) => {
        const found =
          prev.find((item) => item.id === id) ||
          defaultMembersData.find((item) => item.id === id);
        if (found) setActiveMember(found);
        return prev;
      });
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

  // Ensure member role is strictly restricted to their own id and Tab 2
  useEffect(() => {
    if (authSession?.role === 'member') {
      if (authSession.memberId && selectedMemberId !== authSession.memberId) {
        setSelectedMemberId(authSession.memberId);
      }
      if (activeTab !== 'detail') {
        setActiveTab('detail');
      }
    }
  }, [authSession, selectedMemberId, activeTab]);

  // Sync portal changes with browser history & URL
  useEffect(() => {
    const onPopState = () => {
      setCurrentPortal(detectInitialPortal());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Switch between portal Pelaku Usaha (/) and Portal Pengurus (/admin)
  const handleSwitchPortal = (targetPortal) => {
    const targetPath = targetPortal === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPortal(targetPortal);
  };

  // Restrict member from viewing /admin portal
  useEffect(() => {
    if (authSession?.role === 'member' && currentPortal === 'admin') {
      handleSwitchPortal('member');
    }
  }, [authSession, currentPortal]);

  // Handle Login
  const handleLogin = (sessionData) => {
    setAuthSession(sessionData);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {}

    if (sessionData.role === 'member') {
      setSelectedMemberId(sessionData.memberId);
      setActiveTab('detail');
      handleSwitchPortal('member');
    } else {
      setActiveTab('summary');
      handleSwitchPortal('admin');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    const prevRole = authSession?.role;
    setAuthSession(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}

    if (prevRole === 'admin') {
      handleSwitchPortal('admin');
    } else {
      handleSwitchPortal('member');
    }
  };

  // Handle Register New Member
  const handleRegisterNewMember = (newMemberData) => {
    try {
      let customMembers = [];
      const stored = localStorage.getItem('simhalal_custom_members');
      if (stored) customMembers = JSON.parse(stored);
      customMembers.push(newMemberData);
      localStorage.setItem('simhalal_custom_members', JSON.stringify(customMembers));
    } catch (e) {}

    setMembers((prev) => [...prev, newMemberData]);
    setSelectedMemberId(newMemberData.id);
    setActiveMember(newMemberData);
  };

  // Handle member selection
  const handleSelectMember = (id, switchTab = false) => {
    // If logged in as member, prevent switching to any other member!
    if (authSession?.role === 'member') {
      return;
    }
    setSelectedMemberId(id);
    if (switchTab) {
      setActiveTab('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle live toggle audit criterion with instantaneous optimistic UI update
  const handleToggleCriterion = async (fieldKey) => {
    if (!selectedMemberId) return;

    // 1. Optimistic client-side recalculation for instant visual feedback
    setActiveMember((prev) => {
      if (!prev) return prev;
      const nextMember = { ...prev };
      if (fieldKey === 'nib') {
        if (prev.has_valid_nib) {
          nextMember.nib = '-';
          nextMember.has_valid_nib = false;
        } else {
          nextMember.nib = '1234567890123';
          nextMember.has_valid_nib = true;
        }
      } else {
        nextMember[fieldKey] = !prev[fieldKey];
      }
      return recalculateMemberClient(nextMember);
    });

    // 2. Sync with backend API
    try {
      const updated = await toggleCriterion(selectedMemberId, fieldKey);
      if (updated) {
        setActiveMember(updated);
      }
      loadMembersList();
      loadGlobalStats();
    } catch (err) {
      console.warn('Backend toggle offline, active locally:', err.message);
    }
  };

  // Handle member data update (e.g. Email, NIB text input)
  const handleUpdateMemberData = async (data) => {
    if (!selectedMemberId) return;

    setActiveMember((prev) => {
      if (!prev) return prev;
      const nextMember = { ...prev, ...data };
      return recalculateMemberClient(nextMember);
    });

    try {
      await updateMember(selectedMemberId, data);
      loadMembersList();
      loadGlobalStats();
    } catch (err) {
      console.warn('Backend update offline, active locally:', err.message);
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
    if (authSession?.role === 'member') return; // Member has no access to executive drilldown
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
    if (authSession?.role === 'member') return;
    document.body.classList.add('printing-group');
    window.print();
  };

  // If not logged in, render the Auth Page with separated Portal View
  if (!authSession) {
    return (
      <AuthPage
        portalType={currentPortal}
        onSwitchPortal={handleSwitchPortal}
        members={members}
        onLogin={handleLogin}
        onRegisterNewMember={handleRegisterNewMember}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Sticky Header */}
      <Header
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={(id) => handleSelectMember(id, false)}
        onResetFilters={handleResetFilters}
        currentUser={authSession}
        onLogout={handleLogout}
      />

      {/* Tabs Navigation (Restricted if role is member) */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (authSession?.role === 'member') {
            setActiveTab('detail');
            return;
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={authSession}
      />

      {/* Main Container */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {authSession?.role === 'member' || activeTab === 'detail' ? (
          <MemberDetailView
            member={activeMember}
            onToggleCriterion={handleToggleCriterion}
            onUpdateMemberData={handleUpdateMemberData}
            onPrintAudit={handlePrintAudit}
          />
        ) : (
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
            Sains Data untuk Masyarakat (SDUM) 2026 • Akses: {authSession?.role === 'admin' ? 'Pengurus Fatayat NU' : `Anggota UMKM (${authSession?.userName})`}
          </div>
        </div>
      </footer>

      {/* Drilldown Modal on KPI Card click (Only for Admin) */}
      {authSession?.role === 'admin' && (
        <DrilldownModal
          isOpen={modalState.isOpen}
          statusType={modalState.statusType}
          members={groupPrintMembers}
          onClose={() => setModalState({ isOpen: false, statusType: 'ALL' })}
          onPrintGroup={handlePrintGroup}
          onSelectMember={(id) => handleSelectMember(id, true)}
        />
      )}

      {/* Print View 1: Individual Member Report (A4 PDF) */}
      <PrintMemberReport member={activeMember} />

      {/* Print View 2: Group Rekapitulasi Report (A4 PDF) */}
      {authSession?.role === 'admin' && (
        <PrintGroupReport
          statusType={modalState.statusType}
          members={groupPrintMembers}
        />
      )}
    </div>
  );
}
