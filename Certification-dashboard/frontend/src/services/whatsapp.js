export function generateWhatsAppMessage(member) {
  if (!member) return '';

  let msg = `*LEMBAR AUDIT KESIAPAN SERTIFIKASI HALAL BPJPH*\n`;
  msg += `*Pimpinan Ranting Fatayat NU Desa Mersi - Sains Data untuk Masyarakat*\n\n`;
  msg += `Assalamu'alaikum Wr. Wb.\n`;
  msg += `Yth. Ibu *${member.nama}* (${member.usaha})\n`;
  msg += `ID Registrasi: ${member.id}\n`;
  msg += `Status Kesiapan: *${(member.status || '').toUpperCase()}* (Skor: ${member.skor}%)\n\n`;

  if (!member.hambatan || member.hambatan.length === 0) {
    msg += `Alhamdulillah, berkas kesiapan sertifikasi halal usaha Ibu telah *LENGKAP 100%*.\n`;
    msg += `Selanjutnya kami jadwalkan untuk proses submit dan verifikasi di sistem SIHALAL BPJPH.\n`;
  } else {
    msg += `Berdasarkan hasil cek mandiri berkas sertifikasi halal jalur self-declare, berikut dokumen yang *masih perlu dilengkapi*:\n`;
    member.hambatan.forEach((h, idx) => {
      msg += `${idx + 1}. ${h}\n`;
    });
    msg += `\nMohon dokumen di atas dapat dipersiapkan atau difoto lalu dikirimkan ke tim pendamping Fatayat NU Desa Mersi ya Bu.`;
  }

  msg += `\n\nSemoga ikhtiar usaha halal panjenengan membawa keberkahan melimpah bagi keluarga. Aamiin.\n\n`;
  msg += `_Wassalamu'alaikum Wr. Wb._\n`;
  msg += `*Tim Pendamping PPH Fatayat NU Ranting Desa Mersi*`;

  return msg;
}

export function openWhatsApp(member) {
  if (!member) return;
  const phone = member.clean_phone_wa || '628123456789';
  const text = generateWhatsAppMessage(member);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
