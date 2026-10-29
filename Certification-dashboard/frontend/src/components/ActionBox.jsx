import React from 'react';
import { MessageCircle, Printer, HelpCircle } from 'lucide-react';
import { openWhatsApp } from '../services/whatsapp';

export default function ActionBox({ member, onPrintAudit }) {
  if (!member) return null;

  return (
    <div className="bg-gradient-to-r from-nu-900 via-nu-800 to-nu-700 text-white rounded-2xl p-5 sm:p-6 shadow-nu-lg mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tindakan Lanjutan & Konsultasi</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold">
            Pusat Aksi & Pengesahan Hasil Audit Mandiri
          </h3>
          <p className="text-xs sm:text-sm text-nu-100 max-w-xl mt-1 leading-relaxed">
            Cetak formulir resmi berstandar A4 PDF dengan kop PR Fatayat NU Desa Mersi atau konsultasikan langsung hasil audit via WhatsApp ke tim pendamping PPH.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Button Cetak Lembar Audit (PDF) */}
          <button
            onClick={onPrintAudit}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white text-nu-900 hover:bg-nu-50 shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-nu-800" />
            <span>Cetak Lembar Audit (PDF)</span>
          </button>

          {/* Button WhatsApp Consultation */}
          <button
            onClick={() => openWhatsApp(member)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim / Konsul WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
