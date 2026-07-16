// Warna badge per kategori transaksi - solid & kontras tinggi (bukan pastel),
// sengaja tidak memakai hijau/merah karena warna itu sudah dipakai untuk kode
// tipe masuk/keluar (lihat kas/page.tsx & beranda/page.tsx).
export const kategoriWarnaKelas: Record<string, string> = {
  kas_umum: "bg-blue-700 text-white",
  infaq_jumat: "bg-purple-700 text-white",
  infaq_lain: "bg-indigo-700 text-white",
  operasional: "bg-amber-800 text-white",
  lainnya: "bg-slate-700 text-white",
};
