/**
 * =============================================================================
 * SERVICE: WHATSAPP SERVICE
 * =============================================================================
 * Menangani pembuatan format pesan WhatsApp santun, terstruktur, dan resmi dari
 * tim pendamping PPH PR Fatayat NU Desa Mersi ke anggota bersangkutan.
 */

class WhatsAppService {
  /**
   * Menyusun naskah pesan WhatsApp sesuai hasil audit terkini
   * @param {Member} member 
   * @returns {string}
   */
  static generateMessage(member) {
    if (!member) return "";

    let msg = `*LEMBAR AUDIT KESIAPAN SERTIFIKASI HALAL BPJPH*\n`;
    msg += `*Pimpinan Ranting Fatayat NU Desa Mersi - Sains Data untuk Masyarakat*\n\n`;
    msg += `Assalamu'alaikum Wr. Wb.\n`;
    msg += `Yth. Ibu *${member.nama}* (${member.usaha})\n`;
    msg += `ID Registrasi: ${member.id}\n`;
    msg += `Status Kesiapan: *${member.status.toUpperCase()}* (Skor: ${member.skor}%)\n\n`;

    if (member.hambatan.length === 0) {
      msg += `Alhamdulillah, berkas kesiapan sertifikasi halal usaha Ibu telah *LENGKAP 100%*.\n`;
      msg += `Selanjutnya kami jadwalkan untuk proses submit dan verifikasi di sistem SIHALAL BPJPH.\n`;
    } else {
      msg += `Berdasarkan hasil cek mandiri berkas sertifikasi halal jalur self-declare, berikut dokumen yang *masih perlu dilengkapi*:\n`;
      member.hambatan.forEach((hambatan, idx) => {
        msg += `${idx + 1}. ${hambatan}\n`;
      });
      msg += `\nMohon dokumen di atas dapat dipersiapkan atau difoto lalu dikirimkan ke tim pendamping Fatayat NU Desa Mersi ya Bu.`;
    }

    msg += `\n\nSemoga ikhtiar usaha halal panjenengan membawa keberkahan melimpah bagi keluarga. Aamiin.\n\n`;
    msg += `_Wassalamu'alaikum Wr. Wb._\n`;
    msg += `*Tim Pendamping PPH Fatayat NU Ranting Desa Mersi*`;

    return msg;
  }

  /**
   * Membuka tautan WhatsApp di tab baru
   * @param {Member} member 
   */
  static sendReminder(member) {
    if (!member) return;

    const phone = member.cleanPhoneForWhatsApp;
    const text = this.generateMessage(member);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  }
}

// Export ke namespace global
window.WhatsAppService = WhatsAppService;
