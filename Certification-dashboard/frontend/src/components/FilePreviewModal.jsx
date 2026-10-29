import React, { useEffect } from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Calendar, HardDrive, ExternalLink } from 'lucide-react';

export default function FilePreviewModal({ isOpen, fileData, taskTitle, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fileData) return null;

  const isImage = fileData.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileData.name);
  const isPdf = fileData.type === 'application/pdf' || /\.pdf$/i.test(fileData.name);
  const isWord = /\.docx?$/i.test(fileData.name);
  const isExcel = /\.(xlsx?|csv)$/i.test(fileData.name);

  const handleDownload = () => {
    if (fileData.dataUrl) {
      const a = document.createElement('a');
      a.href = fileData.dataUrl;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Berkas ${fileData.name} tersimpan di memori SIM-HALAL.`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-nu-100 text-nu-800 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-nu-800" />
            </div>
            <div className="min-w-0">
              <h3 id="preview-modal-title" className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {taskTitle || 'Pratinjau Berkas Dokumen'}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {fileData.name} ({fileData.formattedSize || `${Math.round(fileData.size / 1024)} KB`})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup jendela pratinjau"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Tersimpan di SIM-HALAL: Siap diverifikasi oleh admin sim halal saat kunjungan 2 minggu lagi.</span>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-100/50 flex flex-col items-center justify-center min-h-[260px]">
          {isImage && fileData.dataUrl ? (
            <div className="max-w-full text-center">
              <img
                src={fileData.dataUrl}
                alt={fileData.name}
                className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-sm border border-slate-200 bg-white"
              />
              <p className="text-xs text-slate-500 mt-2">
                Foto dokumen asli berhasil diunggah dan terarsip aman.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-nu-50 border border-nu-200 flex items-center justify-center text-nu-700 font-mono text-sm font-bold">
                {isPdf ? 'PDF' : isWord ? 'DOCX' : isExcel ? 'XLSX' : 'FILE'}
              </div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base break-words">
                {fileData.name}
              </h4>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  {fileData.formattedSize || `${Math.round(fileData.size / 1024)} KB`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {fileData.uploadedAt || 'Baru saja diunggah'}
                </span>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Validasi:</span>
                  <span className="font-semibold text-emerald-700">Format Sesuai Standar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jalur Audit:</span>
                  <span className="font-semibold text-slate-700">Self-Declare BPJPH</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-nu-700" />
            <span>Dokumen tersimpan lokal & siap diserahkan saat audit verifikasi lapangan</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {fileData.dataUrl && (
              <button
                onClick={handleDownload}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-nu-700 hover:bg-nu-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Salinan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
