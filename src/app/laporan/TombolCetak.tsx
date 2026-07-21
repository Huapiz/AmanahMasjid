"use client";

// Tombol kecil untuk memicu dialog cetak / simpan-PDF bawaan browser.
// Satu-satunya JavaScript di halaman publik agar tetap ringan (PRD §6.6).
export default function TombolCetak() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print min-h-[3rem] rounded-xl border-2 border-hijau-600 px-5 text-lg font-semibold text-hijau-700 hover:bg-hijau-50"
    >
      Unduh / Cetak PDF
    </button>
  );
}
