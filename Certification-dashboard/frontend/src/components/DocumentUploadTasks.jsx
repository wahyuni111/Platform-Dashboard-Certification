import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  Eye,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  ShieldCheck,
  Building2,
  Check,
  X,
  FileCheck2,
  FileSpreadsheet,
  KeyRound,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  downloadPermohonanTemplate,
  downloadPanduanSJPH,
  downloadBahanTemplate,
  downloadSKPenyeliaTemplate,
  downloadIkrarTemplate
} from '../utils/templateGenerator';
import FilePreviewModal from './FilePreviewModal';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function DocumentUploadTasks({
  member,
  onUpdateMemberData,
  onToggleCriterion
}) {
  if (!member) return null;

  const storageKey = `simhalal_uploads_${member.id}`;

  // State management
  const [uploadsState, setUploadsState] = useState({});
  const [emailInput, setEmailInput] = useState('');
  const [hasGmail, setHasGmail] = useState(true);
  const [emailSaved, setEmailSaved] = useState(false);

  const [hasNib, setHasNib] = useState(Boolean(member.has_valid_nib));
  const [nibInput, setNibInput] = useState('');
  const [nibSaved, setNibSaved] = useState(false);

  // Upload simulation progress: { [taskId]: percentage (0-100) }
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  // Preview modal state
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    fileData: null,
    taskTitle: ''
  });

  // Filter tab for ibu/bapak view
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all', 'legalitas', 'dokumen'

  const fileInputRefs = useRef({});

  // Helper function to download static official templates directly
  const handleDownloadOfficial = (fileName, fallbackFn) => {
    try {
      const link = document.createElement('a');
      link.href = `templates/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      if (fallbackFn) fallbackFn(member);
    }
  };

  // Load member records from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUploadsState(parsed.files || {});
        
        const defaultEmail = parsed.email || member.email || `${cleanString(member.nama).toLowerCase()}@gmail.com`;
        setEmailInput(defaultEmail);
        setEmailSaved(Boolean(parsed.email || member.email));
        setHasGmail(parsed.hasGmail !== undefined ? parsed.hasGmail : true);

        const currentNib = parsed.nib || (member.has_valid_nib ? member.nib : '');
        setNibInput(currentNib);
        setNibSaved(Boolean(parsed.nib || member.has_valid_nib));
        setHasNib(parsed.hasNib !== undefined ? parsed.hasNib : Boolean(member.has_valid_nib));
      } else {
        const initialFiles = {};
        if (member.has_valid_nib && member.nib) {
          initialFiles['nib'] = {
            name: `NIB_OSS_${member.nib}.pdf`,
            size: 245 * 1024,
            formattedSize: '245 KB',
            uploadedAt: 'Tervalidasi OSS',
            type: 'application/pdf'
          };
        }
        if (member.sihalal) {
          initialFiles['sihalal'] = {
            name: `Bukti_Akun_SIHALAL_${cleanString(member.nama)}.png`,
            size: 380 * 1024,
            formattedSize: '380 KB',
            uploadedAt: 'Tervalidasi BPJPH',
            type: 'image/png'
          };
        }
        if (member.permohonan) {
          initialFiles['permohonan'] = {
            name: `Surat_Permohonan_Halal_${cleanString(member.nama)}.pdf`,
            size: 420 * 1024,
            formattedSize: '420 KB',
            uploadedAt: 'Berkas Masuk',
            type: 'application/pdf'
          };
        }
        if (member.manual_sjph) {
          initialFiles['manual_sjph'] = {
            name: `Manual_SJPH_Lengkap_${cleanString(member.usaha)}.docx`,
            size: 310 * 1024,
            formattedSize: '310 KB',
            uploadedAt: 'Berkas Masuk',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          };
        }
        if (member.daftar_bahan) {
          initialFiles['daftar_bahan'] = {
            name: `Rincian_Bahan_Baku_${cleanString(member.usaha)}.xlsx`,
            size: 195 * 1024,
            formattedSize: '195 KB',
            uploadedAt: 'Berkas Masuk',
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
        if (member.surat_penyelia) {
          initialFiles['surat_penyelia'] = {
            name: `SK_Penyelia_${cleanString(member.penyelia_nama || 'Muslim')}.pdf`,
            size: 512 * 1024,
            formattedSize: '512 KB',
            uploadedAt: 'Berkas Masuk',
            type: 'application/pdf'
          };
        }
        if (member.ikrar_materai) {
          initialFiles['ikrar_materai'] = {
            name: `Ikrar_Bebas_Babi_Materai_${cleanString(member.nama)}.jpg`,
            size: 780 * 1024,
            formattedSize: '780 KB',
            uploadedAt: 'Berkas Masuk',
            type: 'image/jpeg'
          };
        }

        setUploadsState(initialFiles);
        const defaultEmail = member.email || `${cleanString(member.nama).toLowerCase()}@gmail.com`;
        setEmailInput(defaultEmail);
        setEmailSaved(Boolean(member.email));
        setHasGmail(true);

        setNibInput(member.has_valid_nib ? member.nib : '');
        setNibSaved(Boolean(member.has_valid_nib));
        setHasNib(Boolean(member.has_valid_nib));
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage SIM-HALAL:', e);
    }
  }, [member.id, storageKey]);

  // Persist state changes
  const persistState = (newFiles, newEmail, newNib, newHasGmail, newHasNib) => {
    try {
      const dataToSave = {
        files: newFiles !== undefined ? newFiles : uploadsState,
        email: newEmail !== undefined ? newEmail : emailInput,
        hasGmail: newHasGmail !== undefined ? newHasGmail : hasGmail,
        nib: newNib !== undefined ? newNib : nibInput,
        hasNib: newHasNib !== undefined ? newHasNib : hasNib,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  };

  function cleanString(str) {
    return String(str || '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 20);
  }

  // Handle simulated upload
  const handleFileUpload = (taskId, file, criterionKey) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`Berkas "${file.name}" melebihi batas maksimal 5MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Harap pilih foto/dokumen lebih kecil.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      simulateUpload(taskId, file, dataUrl, criterionKey);
    };
    reader.onerror = () => {
      simulateUpload(taskId, file, null, criterionKey);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      const objUrl = URL.createObjectURL(file);
      simulateUpload(taskId, file, objUrl, criterionKey);
    }
  };

  const simulateUpload = (taskId, file, dataUrl, criterionKey) => {
    setUploadProgress((prev) => ({ ...prev, [taskId]: 20 }));

    const timer1 = setTimeout(() => {
      setUploadProgress((prev) => ({ ...prev, [taskId]: 65 }));
    }, 400);

    const timer2 = setTimeout(() => {
      setUploadProgress((prev) => ({ ...prev, [taskId]: 100 }));

      setTimeout(() => {
        const fileInfo = {
          name: file.name,
          size: file.size,
          formattedSize: formatFileSize(file.size),
          uploadedAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: file.type,
          dataUrl: dataUrl
        };

        const newUploads = { ...uploadsState, [taskId]: fileInfo };
        setUploadsState(newUploads);
        persistState(newUploads);

        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[taskId];
          return updated;
        });

        if (criterionKey && onToggleCriterion) {
          if (!member[criterionKey]) {
            onToggleCriterion(criterionKey);
          }
        }
      }, 300);
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Drag and drop handlers
  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverTaskId !== taskId) setDragOverTaskId(taskId);
  };

  const handleDragLeave = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverTaskId === taskId) setDragOverTaskId(null);
  };

  const handleDrop = (e, taskId, criterionKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTaskId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(taskId, e.dataTransfer.files[0], criterionKey);
    }
  };

  // Save Email Handler
  const handleSaveEmail = (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('Harap masukkan alamat email Gmail yang valid (misal: sitiaminah@gmail.com).');
      return;
    }
    setEmailSaved(true);
    persistState(undefined, emailInput, undefined, true, undefined);

    if (onUpdateMemberData) {
      onUpdateMemberData({ email: emailInput });
    }
  };

  // Save NIB Handler
  const handleSaveNib = () => {
    const cleanNib = nibInput.replace(/\D/g, '');
    if (cleanNib.length < 9) {
      alert('Nomor NIB minimal terdiri dari 9 hingga 13 digit angka.');
      return;
    }
    setNibInput(cleanNib);
    setNibSaved(true);
    persistState(undefined, undefined, cleanNib, undefined, true);

    if (onUpdateMemberData) {
      onUpdateMemberData({ nib: cleanNib, has_valid_nib: true });
    }
    if (!member.has_valid_nib && onToggleCriterion) {
      onToggleCriterion('nib');
    }
  };

  // Calculation of completed steps
  const totalSteps = 8;
  let completedSteps = 0;
  if (emailSaved) completedSteps++;
  if (uploadsState['nib'] || member.has_valid_nib) completedSteps++;
  if (uploadsState['sihalal'] || member.sihalal) completedSteps++;
  if (uploadsState['permohonan'] || member.permohonan) completedSteps++;
  if (uploadsState['manual_sjph'] || member.manual_sjph) completedSteps++;
  if (uploadsState['daftar_bahan'] || member.daftar_bahan) completedSteps++;
  if (uploadsState['surat_penyelia'] || member.surat_penyelia) completedSteps++;
  if (uploadsState['ikrar_materai'] || member.ikrar_materai) completedSteps++;

  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  // Motivational message tailored for UMKM mothers
  const getMotivationalMessage = () => {
    if (completedSteps === 8) {
      return 'MasyaAllah Tabarakallah! Seluruh berkas persyaratan sudah 100% lengkap dan siap diverifikasi oleh Auditor Halal.';
    }
    if (completedSteps >= 6) {
      return `Alhamdulillah, berkas Ibu/Bapak sudah siap ${progressPct}%! Tinggal ${totalSteps - completedSteps} langkah lagi siap verifikasi lapangan.`;
    }
    if (completedSteps >= 3) {
      return `Bagus sekali! Sudah ${completedSteps} dari ${totalSteps} persyaratan disiapkan. Yuk lanjutkan pengisian surat berikutnya.`;
    }
    return `Selamat datang Bu/Pak! Mari lengkapi ${totalSteps} persyaratan sertifikasi halal bersama pendamping Fatayat NU Mersi.`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* ========================================================================= */}
      {/* 1. DASHBOARD PROGRESS BERKAS (PENGGANTI TUGAS PENGISIAN 2 MINGGU)          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-white via-nu-50/30 to-emerald-50/40 rounded-3xl border-2 border-nu-200 p-5 sm:p-7 shadow-sm">
        
        {/* Top Header of Progress Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-nu-100">
          
          <div className="flex items-start gap-4">
            {/* Visual Circular / Icon Badge */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-nu-800 to-nu-600 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <FileCheck2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-nu-950 text-[10px] font-black flex items-center justify-center border-2 border-white">
                {completedSteps}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-nu-800 text-white tracking-wide uppercase">
                  Progress Kesiapan Berkas
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  SIM-HALAL Fatayat NU
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Pusat Dokumen & Kelengkapan Sertifikasi Halal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed font-medium">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>

          {/* Big Progress Counter Box */}
          <div className="flex items-center gap-4 bg-white px-5 py-3.5 rounded-2xl border-2 border-nu-200/80 shadow-sm self-start md:self-auto">
            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Kelengkapan Dokumen:
              </div>
              <div className="text-base sm:text-lg font-black text-nu-900">
                <span className="text-2xl font-mono text-nu-800">{completedSteps}</span>
                <span className="text-slate-400 font-mono"> / {totalSteps} Selesai</span>
              </div>
            </div>

            {/* Circular Percentage Meter */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-100"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={150.8}
                  strokeDashoffset={150.8 - (150.8 * progressPct) / 100}
                  strokeLinecap="round"
                  className="text-nu-700 transition-all duration-700"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-black text-xs sm:text-sm text-nu-900 font-mono">
                {progressPct}%
              </span>
            </div>
          </div>

        </div>

        {/* Visual Progress Bar Strip */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-nu-900 font-extrabold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Alur Pengisian Berkas (Langkah 1 s/d {totalSteps})
            </span>
            <span className="text-nu-800 font-mono font-black">{progressPct}% Terpenuhi</span>
          </div>

          <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-600 to-nu-700 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
            <span className="font-semibold text-nu-800">
              Langkah 1-3: Akun & Legalitas Dasar
            </span>
            <span className="hidden sm:inline font-bold text-slate-300">&bull;</span>
            <span className="font-semibold text-nu-800">
              Langkah 4-8: Surat Persyaratan & Template Halal
            </span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan di SIM-HALAL untuk Kunjungan Lapangan
            </span>
          </div>
        </div>

        {/* Quick Filter Pill Buttons (Ibu/Bapak Friendly) */}
        <div className="mt-5 pt-4 border-t border-nu-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1">Tampilkan:</span>
          
          <button
            type="button"
            onClick={() => setActiveTabFilter('all')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTabFilter === 'all'
                ? 'bg-nu-800 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-nu-400'
            }`}
          >
            <span>Semua Langkah ({totalSteps})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('legalitas')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTabFilter === 'legalitas'
                ? 'bg-nu-800 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-nu-400'
            }`}
          >
            <span>1. Akun & Legalitas (3)</span>
            {(emailSaved && (uploadsState['nib'] || member.has_valid_nib) && (uploadsState['sihalal'] || member.sihalal)) && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter('dokumen')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTabFilter === 'dokumen'
                ? 'bg-nu-800 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-nu-400'
            }`}
          >
            <span>2. Dokumen & Surat Halal (5)</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BAGIAN 1: AKUN & LEGALITAS DASAR                                          */}
      {/* Alur: 1. Gmail (Ingat Password!) -> 2. NIB OSS -> 3. Akun SIHALAL         */}
      {/* ========================================================================= */}
      {(activeTabFilter === 'all' || activeTabFilter === 'legalitas') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-nu-800 text-white text-sm font-black flex items-center justify-center shadow-sm">
                1
              </span>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Tahap 1: Akun & Legalitas Dasar
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Pastikan email dan perizinan dasar siap sebelum mengurus dokumen halal
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-nu-800 bg-nu-100 px-3 py-1 rounded-full">
              Langkah 1 - 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* --------------------------------------------------------------------- */}
            {/* KARTU 1: EMAIL GMAIL AKTIF (DENGAN PERINGATAN PASSWORD WAJIB INGAT)   */}
            {/* --------------------------------------------------------------------- */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                emailSaved
                  ? 'bg-emerald-50/50 border-emerald-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'
              }`}
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">
                        Langkah 1
                      </span>
                      <h5 className="text-sm sm:text-base font-black text-slate-900">
                        Email Gmail Aktif
                      </h5>
                    </div>
                  </div>

                  {emailSaved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Siap
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Perlu Diisi
                    </span>
                  )}
                </div>

                {/* Pertanyaan Ramah: Apakah sudah punya Gmail? */}
                <div className="mb-3">
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    Apakah Ibu/Bapak sudah memiliki akun Gmail?
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasGmail(true)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        hasGmail
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sudah Punya</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasGmail(false)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        !hasGmail
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Belum Punya</span>
                    </button>
                  </div>
                </div>

                {/* KOTAK PERINGATAN PENTING: PASSWORD WAJIB DIINGAT */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 mb-3 text-amber-950 text-xs leading-relaxed">
                  <div className="flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold text-amber-900 block mb-0.5">
                        ⚠️ PENTING: PASSWORD HARUS DIINGAT!
                      </strong>
                      <span>
                        Catat kata sandi/password Gmail di buku catatan Ibu/Bapak. Link aktivasi akun SIHALAL BPJPH akan dikirimkan ke email ini.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Konten Berdasarkan Pilihan */}
                {hasGmail ? (
                  <form onSubmit={handleSaveEmail} className="space-y-2">
                    <label htmlFor="inputEmailMember" className="block text-xs font-bold text-slate-700">
                      Alamat Gmail Ibu/Bapak:
                    </label>
                    <input
                      id="inputEmailMember"
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailSaved(false);
                      }}
                      placeholder="contoh: sitiaminah@gmail.com"
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full min-h-[44px] mt-2 px-4 py-2.5 bg-nu-800 hover:bg-nu-900 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-98"
                    >
                      <Mail className="w-4 h-4 text-amber-300" />
                      <span>{emailSaved ? 'Perbarui Alamat Email' : 'Simpan Email Gmail'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                    <p className="font-semibold text-slate-800">
                      Belum memiliki akun Gmail?
                    </p>
                    <p>
                      Tenang Bu/Pak, Tim Pendamping PPH Fatayat NU Mersi siap membantu membuatkan akun Gmail resmi gratis saat pendampingan.
                    </p>
                    <a
                      href="https://accounts.google.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-nu-800 hover:text-nu-900 underline pt-1"
                    >
                      <span>Buka Halaman Buat Gmail Baru</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {emailSaved && (
                <div className="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Tersimpan: {emailInput}</span>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 2: NIB OSS-RBA (PUNYA NIB ATAU TIDAK + UPLOAD FILE NIB)        */}
            {/* --------------------------------------------------------------------- */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                uploadsState['nib'] || member.has_valid_nib
                  ? 'bg-emerald-50/50 border-emerald-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'
              }`}
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                        Langkah 2
                      </span>
                      <h5 className="text-sm sm:text-base font-black text-slate-900">
                        NIB Berbasis OSS-RBA
                      </h5>
                    </div>
                  </div>

                  {uploadsState['nib'] || member.has_valid_nib ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Lengkap
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Belum Lengkap
                    </span>
                  )}
                </div>

                {/* Pertanyaan Ramah: Punya NIB atau Belum? */}
                <div className="mb-3">
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    Apakah usaha Ibu/Bapak sudah memiliki NIB?
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasNib(true)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        hasNib
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sudah Punya NIB</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasNib(false)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        !hasNib
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Belum Punya NIB</span>
                    </button>
                  </div>
                </div>

                {/* Konten Berdasarkan Pilihan NIB */}
                {hasNib ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="inputNibBox" className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor NIB (13 Digit Angka):
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="inputNibBox"
                          type="text"
                          maxLength={16}
                          value={nibInput}
                          onChange={(e) => {
                            setNibInput(e.target.value);
                            setNibSaved(false);
                          }}
                          placeholder="1234567890123"
                          className="flex-1 font-mono text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300 focus:border-nu-700 focus:ring-2 focus:ring-nu-700/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveNib}
                          className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors active:scale-98"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>

                    {/* File Upload Box */}
                    <FileUploadZone
                      taskId="nib"
                      title="NIB Berbasis OSS-RBA"
                      criterionKey="nib"
                      fileData={uploadsState['nib']}
                      progress={uploadProgress['nib']}
                      isDragOver={dragOverTaskId === 'nib'}
                      onDragOver={(e) => handleDragOver(e, 'nib')}
                      onDragLeave={(e) => handleDragLeave(e, 'nib')}
                      onDrop={(e) => handleDrop(e, 'nib', 'nib')}
                      onTriggerUpload={() => fileInputRefs.current['nib']?.click()}
                      onPreview={() =>
                        setPreviewState({
                          isOpen: true,
                          fileData: uploadsState['nib'],
                          taskTitle: 'Dokumen NIB Berbasis OSS-RBA'
                        })
                      }
                      fileInputRef={(el) => (fileInputRefs.current['nib'] = el)}
                      onFileInputChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload('nib', e.target.files[0], 'nib');
                        }
                      }}
                      uploadButtonLabel="Upload Dokumen NIB (PDF/Foto)"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 leading-relaxed space-y-2">
                    <p className="font-extrabold text-amber-900">
                      Belum Memiliki NIB?
                    </p>
                    <p>
                      Silakan siapkan KTP asli. Kader Pendamping Halal Fatayat NU Desa Mersi akan memfasilitasi pembuatan NIB di portal OSS-RBA secara gratis saat kunjungan.
                    </p>
                    <a
                      href="https://oss.go.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:underline pt-1"
                    >
                      <span>Buka Portal Resmi OSS (oss.go.id)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {(uploadsState['nib'] || member.has_valid_nib) && (
                <div className="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">NIB Terverifikasi: {nibInput || member.nib}</span>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 3: AKUN SIHALAL BPJPH (BUKA PORTAL + UPLOAD SCREENSHOT)         */}
            {/* --------------------------------------------------------------------- */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                uploadsState['sihalal'] || member.sihalal
                  ? 'bg-emerald-50/50 border-emerald-400 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'
              }`}
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                        Langkah 3
                      </span>
                      <h5 className="text-sm sm:text-base font-black text-slate-900">
                        Akun SIHALAL BPJPH
                      </h5>
                    </div>
                  </div>

                  {uploadsState['sihalal'] || member.sihalal ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Belum Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Pendaftaran akun di portal resmi BPJPH (ptsp.halal.go.id) menggunakan NIB dan Gmail yang telah tersimpan.
                </p>

                {/* Tombol Aksi Keluar: Buka Portal SIHALAL */}
                <a
                  href="https://ptsp.halal.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] mb-3 px-4 py-2.5 bg-nu-700 hover:bg-nu-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Portal SIHALAL BPJPH</span>
                </a>

                {/* File Upload Box */}
                <FileUploadZone
                  taskId="sihalal"
                  title="Bukti Akun SIHALAL"
                  criterionKey="sihalal"
                  fileData={uploadsState['sihalal']}
                  progress={uploadProgress['sihalal']}
                  isDragOver={dragOverTaskId === 'sihalal'}
                  onDragOver={(e) => handleDragOver(e, 'sihalal')}
                  onDragLeave={(e) => handleDragLeave(e, 'sihalal')}
                  onDrop={(e) => handleDrop(e, 'sihalal', 'sihalal')}
                  onTriggerUpload={() => fileInputRefs.current['sihalal']?.click()}
                  onPreview={() =>
                    setPreviewState({
                      isOpen: true,
                      fileData: uploadsState['sihalal'],
                      taskTitle: 'Bukti Screenshot Akun SIHALAL Aktif'
                    })
                  }
                  fileInputRef={(el) => (fileInputRefs.current['sihalal'] = el)}
                  onFileInputChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload('sihalal', e.target.files[0], 'sihalal');
                    }
                  }}
                  uploadButtonLabel="Upload Bukti Screenshot Akun Aktif"
                />
              </div>

              {(uploadsState['sihalal'] || member.sihalal) && (
                <div className="mt-4 pt-3 border-t border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Akun SIHALAL Terhubung & Aktif</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAGIAN 2: DOKUMEN & SURAT PERSYARATAN RESMI HALAL                         */}
      {/* Alur Berurutan: Permohonan -> Manual SJPH -> Bahan -> SK Penyelia -> Ikrar */}
      {/* ========================================================================= */}
      {(activeTabFilter === 'all' || activeTabFilter === 'dokumen') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-nu-800 text-white text-sm font-black flex items-center justify-center shadow-sm">
                2
              </span>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Tahap 2: Dokumen & Surat Persyaratan Halal
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Unduh draf resmi, lengkapi tanda tangan, lalu unggah dokumen/foto aslinya
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-nu-800 bg-nu-100 px-3 py-1 rounded-full">
              Langkah 4 - 8
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* --------------------------------------------------------------------- */}
            {/* KARTU 4: SURAT PERMOHONAN SERTIFIKASI HALAL                           */}
            {/* --------------------------------------------------------------------- */}
            <DocumentCardItem
              stepNumber="4"
              title="Surat Permohonan Sertifikasi Halal"
              subtitle="Formulir Resmi BPJPH Jalur Self-Declare"
              desc="Surat permohonan resmi pelaku usaha yang dibubuhi tanda tangan asli."
              taskId="permohonan"
              criterionKey="permohonan"
              fileData={uploadsState['permohonan']}
              progress={uploadProgress['permohonan']}
              isDragOver={dragOverTaskId === 'permohonan'}
              onDragOver={(e) => handleDragOver(e, 'permohonan')}
              onDragLeave={(e) => handleDragLeave(e, 'permohonan')}
              onDrop={(e) => handleDrop(e, 'permohonan', 'permohonan')}
              onTriggerUpload={() => fileInputRefs.current['permohonan']?.click()}
              onPreview={() =>
                setPreviewState({
                  isOpen: true,
                  fileData: uploadsState['permohonan'],
                  taskTitle: 'Surat Permohonan Sertifikasi Halal BPJPH'
                })
              }
              fileInputRef={(el) => (fileInputRefs.current['permohonan'] = el)}
              onFileInputChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload('permohonan', e.target.files[0], 'permohonan');
                }
              }}
              primaryDownloadLabel="Unduh Template Word (.docx)"
              onPrimaryDownload={() => handleDownloadOfficial('Template_Surat_Permohonan_BPJPH.docx', downloadPermohonanTemplate)}
              secondaryDownloadLabel="Unduh PDF Resmi"
              onSecondaryDownload={() => handleDownloadOfficial('Template_Surat_Permohonan_BPJPH.pdf')}
              uploadButtonLabel="Upload Surat Permohonan (Bertanda Tangan)"
            />

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 5: DOKUMEN MANUAL SJPH LENGKAP                                 */}
            {/* --------------------------------------------------------------------- */}
            <DocumentCardItem
              stepNumber="5"
              title="Dokumen Manual SJPH Lengkap"
              subtitle="SOP Sistem Jaminan Produk Halal"
              desc="Buku komitmen halal, sanitasi dapur, dan pemisahan peralatan produksi."
              taskId="manual_sjph"
              criterionKey="manual_sjph"
              fileData={uploadsState['manual_sjph']}
              progress={uploadProgress['manual_sjph']}
              isDragOver={dragOverTaskId === 'manual_sjph'}
              onDragOver={(e) => handleDragOver(e, 'manual_sjph')}
              onDragLeave={(e) => handleDragLeave(e, 'manual_sjph')}
              onDrop={(e) => handleDrop(e, 'manual_sjph', 'manual_sjph')}
              onTriggerUpload={() => fileInputRefs.current['manual_sjph']?.click()}
              onPreview={() =>
                setPreviewState({
                  isOpen: true,
                  fileData: uploadsState['manual_sjph'],
                  taskTitle: 'Dokumen Manual SJPH Lengkap'
                })
              }
              fileInputRef={(el) => (fileInputRefs.current['manual_sjph'] = el)}
              onFileInputChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload('manual_sjph', e.target.files[0], 'manual_sjph');
                }
              }}
              primaryDownloadLabel="Unduh Manual SJPH Resmi (.docx)"
              onPrimaryDownload={() => handleDownloadOfficial('Template_Manual_SJPH_Lengkap_Resmi.docx', downloadPanduanSJPH)}
              secondaryDownloadLabel="Unduh Buku Panduan PDF"
              onSecondaryDownload={() => handleDownloadOfficial('Panduan_Lengkap_SJPH_BPJPH.pdf')}
              uploadButtonLabel="Upload Manual SJPH Terisi"
            />

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 6: TABEL RINCIAN BAHAN BAKU & PRODUK                            */}
            {/* --------------------------------------------------------------------- */}
            <DocumentCardItem
              stepNumber="6"
              title="Tabel Rincian Bahan Baku & Produk"
              subtitle="Komposisi, Bumbu & Sumber Halal"
              desc="Daftar seluruh bahan baku, bumbu kemasan, minyak, dan sumber air layak konsumsi."
              taskId="daftar_bahan"
              criterionKey="daftar_bahan"
              fileData={uploadsState['daftar_bahan']}
              progress={uploadProgress['daftar_bahan']}
              isDragOver={dragOverTaskId === 'daftar_bahan'}
              onDragOver={(e) => handleDragOver(e, 'daftar_bahan')}
              onDragLeave={(e) => handleDragLeave(e, 'daftar_bahan')}
              onDrop={(e) => handleDrop(e, 'daftar_bahan', 'daftar_bahan')}
              onTriggerUpload={() => fileInputRefs.current['daftar_bahan']?.click()}
              onPreview={() =>
                setPreviewState({
                  isOpen: true,
                  fileData: uploadsState['daftar_bahan'],
                  taskTitle: 'Tabel Rincian Bahan Baku & Bumbu'
                })
              }
              fileInputRef={(el) => (fileInputRefs.current['daftar_bahan'] = el)}
              onFileInputChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload('daftar_bahan', e.target.files[0], 'daftar_bahan');
                }
              }}
              primaryDownloadLabel="Unduh Template Tabel (.csv / Excel)"
              onPrimaryDownload={() => handleDownloadOfficial('Template_Tabel_Daftar_Bahan_Baku.csv', downloadBahanTemplate)}
              uploadButtonLabel="Upload File / Foto Daftar Bahan Lengkap"
            />

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 7: SK PENETAPAN PENYELIA HALAL                                  */}
            {/* --------------------------------------------------------------------- */}
            <DocumentCardItem
              stepNumber="7"
              title="Surat Penetapan Penyelia Halal"
              subtitle="Penunjukan Penyelia Muslim & KTP"
              desc={`Surat penunjukan penyelia halal internal (${member.penyelia_nama || 'Muslim'}) yang bertugas menjaga kehalalan.`}
              taskId="surat_penyelia"
              criterionKey="surat_penyelia"
              fileData={uploadsState['surat_penyelia']}
              progress={uploadProgress['surat_penyelia']}
              isDragOver={dragOverTaskId === 'surat_penyelia'}
              onDragOver={(e) => handleDragOver(e, 'surat_penyelia')}
              onDragLeave={(e) => handleDragLeave(e, 'surat_penyelia')}
              onDrop={(e) => handleDrop(e, 'surat_penyelia', 'surat_penyelia')}
              onTriggerUpload={() => fileInputRefs.current['surat_penyelia']?.click()}
              onPreview={() =>
                setPreviewState({
                  isOpen: true,
                  fileData: uploadsState['surat_penyelia'],
                  taskTitle: 'SK Penetapan Penyelia Halal + Foto KTP'
                })
              }
              fileInputRef={(el) => (fileInputRefs.current['surat_penyelia'] = el)}
              onFileInputChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload('surat_penyelia', e.target.files[0], 'surat_penyelia');
                }
              }}
              primaryDownloadLabel="Unduh Format SK Penyelia (.docx)"
              onPrimaryDownload={() => handleDownloadOfficial('Template_SK_Penetapan_Penyelia_Halal.docx', downloadSKPenyeliaTemplate)}
              uploadButtonLabel="Upload SK Penyelia + Foto KTP"
            />

            {/* --------------------------------------------------------------------- */}
            {/* KARTU 8: SURAT PERNYATAAN BEBAS BABI & IKRAR HALAL                   */}
            {/* --------------------------------------------------------------------- */}
            <DocumentCardItem
              stepNumber="8"
              title="Surat Bebas Babi & Ikrar Halal"
              subtitle="Bermaterai Rp10.000 Asli (Self-Declare)"
              desc="Surat pernyataan kehalalan bermaterai asli Rp10.000 bertanda tangan di atas materai."
              taskId="ikrar_materai"
              criterionKey="ikrar_materai"
              fileData={uploadsState['ikrar_materai']}
              progress={uploadProgress['ikrar_materai']}
              isDragOver={dragOverTaskId === 'ikrar_materai'}
              onDragOver={(e) => handleDragOver(e, 'ikrar_materai')}
              onDragLeave={(e) => handleDragLeave(e, 'ikrar_materai')}
              onDrop={(e) => handleDrop(e, 'ikrar_materai', 'ikrar_materai')}
              onTriggerUpload={() => fileInputRefs.current['ikrar_materai']?.click()}
              onPreview={() =>
                setPreviewState({
                  isOpen: true,
                  fileData: uploadsState['ikrar_materai'],
                  taskTitle: 'Surat Pernyataan Bebas Babi & Ikrar Halal Bermaterai'
                })
              }
              fileInputRef={(el) => (fileInputRefs.current['ikrar_materai'] = el)}
              onFileInputChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload('ikrar_materai', e.target.files[0], 'ikrar_materai');
                }
              }}
              primaryDownloadLabel="Unduh Draf Pernyataan Bebas Babi (.doc)"
              onPrimaryDownload={() => handleDownloadOfficial('Template_Surat_Pernyataan_Bebas_Babi_Ikrar.doc', downloadIkrarTemplate)}
              uploadButtonLabel="Upload Foto Surat Bermaterai Rp10.000 Asli"
            />

          </div>
        </div>
      )}

      {/* Modal Preview Berkas */}
      <FilePreviewModal
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ isOpen: false, fileData: null, taskTitle: '' })}
        fileData={previewState.fileData}
        taskTitle={previewState.taskTitle}
      />
    </div>
  );
}

/**
 * Komponen Kartu Dokumen Persyaratan (Tahap 2)
 */
function DocumentCardItem({
  stepNumber,
  title,
  subtitle,
  desc,
  taskId,
  criterionKey,
  fileData,
  progress,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTriggerUpload,
  onPreview,
  fileInputRef,
  onFileInputChange,
  primaryDownloadLabel,
  onPrimaryDownload,
  secondaryDownloadLabel,
  onSecondaryDownload,
  uploadButtonLabel
}) {
  const isUploaded = Boolean(fileData);
  const isUploading = progress !== undefined && progress < 100;

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
        isUploaded
          ? 'bg-emerald-50/40 border-emerald-400 shadow-sm'
          : isUploading
          ? 'bg-amber-50/30 border-amber-300'
          : 'bg-white border-slate-200 hover:border-nu-400 shadow-sm'
      }`}
    >
      <div>
        {/* Top Header Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-nu-800 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
              {stepNumber}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase text-nu-700 tracking-wider">
                Langkah {stepNumber}
              </span>
              <h5 className="text-sm font-black text-slate-900 leading-snug">
                {title}
              </h5>
            </div>
          </div>

          {isUploaded ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terunggah
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Belum Diunggah
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
          {desc}
        </p>

        {/* Section Tombol Unduh Template */}
        <div className="mb-4 space-y-2">
          <button
            type="button"
            onClick={onPrimaryDownload}
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-300 active:scale-98"
          >
            <Download className="w-4 h-4 text-nu-700" />
            <span>{primaryDownloadLabel}</span>
          </button>

          {secondaryDownloadLabel && onSecondaryDownload && (
            <button
              type="button"
              onClick={onSecondaryDownload}
              className="w-full min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{secondaryDownloadLabel}</span>
            </button>
          )}
        </div>

        {/* Section Upload & Drag-and-Drop */}
        <FileUploadZone
          taskId={taskId}
          title={title}
          criterionKey={criterionKey}
          fileData={fileData}
          progress={progress}
          isDragOver={isDragOver}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onTriggerUpload={onTriggerUpload}
          onPreview={onPreview}
          fileInputRef={fileInputRef}
          onFileInputChange={onFileInputChange}
          uploadButtonLabel={uploadButtonLabel}
        />
      </div>

      {isUploaded && (
        <div className="mt-4 pt-3 border-t border-emerald-200/80 text-[11px] font-semibold text-emerald-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Tersimpan di SIM-HALAL: Siap diverifikasi saat kunjungan</span>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen Area Upload Berkas Interaktif (Drag & Drop + Input File)
 */
function FileUploadZone({
  taskId,
  title,
  criterionKey,
  fileData,
  progress,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTriggerUpload,
  onPreview,
  fileInputRef,
  onFileInputChange,
  uploadButtonLabel
}) {
  const isUploaded = Boolean(fileData);
  const isUploading = progress !== undefined && progress < 100;

  return (
    <div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* STATE 2: UPLOAD IN PROGRESS */}
      {isUploading ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-center space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              Sedang Mengunggah Dokumen...
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-amber-800 font-medium">
            Menyimpan berkas ke sistem SIM-HALAL Fatayat NU...
          </p>
        </div>
      ) : isUploaded ? (
        /* STATE 3: UPLOADED & STORED */
        <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-300 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950 truncate" title={fileData.name}>
                  {fileData.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  {fileData.formattedSize || 'Berkas Terverifikasi'} &bull; {fileData.uploadedAt || 'Tersimpan'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/80">
            <button
              type="button"
              onClick={onPreview}
              className="min-h-[44px] px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Berkas</span>
            </button>
            <button
              type="button"
              onClick={onTriggerUpload}
              className="min-h-[44px] px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ganti File</span>
            </button>
          </div>
        </div>
      ) : (
        /* STATE 1: NOT UPLOADED YET (DRAG & DROP + UPLOAD BUTTON) */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`p-3 rounded-xl border-2 border-dashed transition-all text-center ${
            isDragOver
              ? 'border-nu-700 bg-nu-50/80'
              : 'border-slate-300 hover:border-nu-500 bg-slate-50/60'
          }`}
        >
          <button
            type="button"
            onClick={onTriggerUpload}
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-nu-800 hover:bg-nu-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span className="truncate">{uploadButtonLabel || 'Upload Dokumen (PDF/Foto)'}</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            Maksimal 5MB (Format: PDF, Word, Excel, JPG, PNG)
          </p>
        </div>
      )}
    </div>
  );
}
