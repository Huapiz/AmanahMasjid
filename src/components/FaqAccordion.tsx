// Konten FAQ statis di kode (bukan diedit lewat admin) — institusional,
// jarang berubah, tidak perlu sistem CMS untuk ini. Kalau mau diubah,
// edit langsung array di bawah.
const DAFTAR_FAQ = [
  {
    tanya: "Jam berapa waktu sholat lima waktu di masjid ini?",
    jawab:
      "Lihat papan jadwal sholat digital di bagian atas halaman ini — jadwal dihitung otomatis sesuai lokasi masjid dan diperbarui tiap hari.",
  },
  {
    tanya: "Bagaimana cara berinfaq atau berdonasi?",
    jawab:
      "Saat ini belum ada pembayaran online/QRIS. Infaq bisa langsung lewat kotak amal di masjid, atau hubungi takmir lewat tombol WhatsApp di halaman ini untuk cara lain.",
  },
  {
    tanya: "Bagaimana cara melihat laporan keuangan masjid?",
    jawab:
      "Laporan kas & transparansi keuangan bisa dilihat kapan saja di halaman /laporan — tombolnya ada di bagian bawah halaman ini.",
  },
  {
    tanya: "Bagaimana cara ikut jadi pengurus atau relawan?",
    jawab:
      "Hubungi takmir langsung lewat tombol WhatsApp di halaman ini untuk info lebih lanjut.",
  },
];

export default function FaqAccordion() {
  return (
    <div className="divide-y divide-charcoal/10">
      {DAFTAR_FAQ.map((item) => (
        <details key={item.tanya} className="group py-4">
          <summary className="cursor-pointer list-none text-lg font-semibold text-charcoal marker:hidden">
            <span className="flex items-center justify-between gap-3">
              {item.tanya}
              <span
                aria-hidden
                className="shrink-0 text-brass transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-2 text-base leading-relaxed text-charcoal/80">
            {item.jawab}
          </p>
        </details>
      ))}
    </div>
  );
}
