// Warna badge per kategori transaksi - solid & kontras tinggi (bukan pastel),
// sengaja tidak memakai hijau/merah karena warna itu sudah dipakai untuk kode
// tipe masuk/keluar (lihat kas/page.tsx & beranda/page.tsx).
export const kategoriWarnaKelas: Record<string, string> = {
  // Dana Umum
  kas_umum: "bg-blue-700 text-white",
  infaq_jumat: "bg-purple-700 text-white",
  infaq_pembangunan: "bg-indigo-700 text-white",
  sewa_aset: "bg-sky-700 text-white",
  parkir: "bg-cyan-700 text-white",
  operasional: "bg-amber-800 text-white",
  lainnya_umum: "bg-slate-700 text-white",
  // Dana Terikat
  wakaf: "bg-teal-700 text-white",
  santunan_yatim: "bg-rose-700 text-white",
  dana_sosial_kematian: "bg-stone-700 text-white",
  beasiswa: "bg-orange-700 text-white",
  lainnya_terikat: "bg-fuchsia-800 text-white",
};
