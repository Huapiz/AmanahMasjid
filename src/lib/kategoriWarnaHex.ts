// Versi hex dari kategoriWarnaKelas (lihat kategoriWarna.ts) — library chart
// butuh nilai warna nyata, bukan nama kelas Tailwind. Hue-nya disamakan
// dengan kelas badge supaya konsisten di seluruh UI.
export const kategoriWarnaHex: Record<string, string> = {
  // Dana Umum
  kas_umum: "#1d4ed8", // blue-700
  infaq_jumat: "#7e22ce", // purple-700
  infaq_pembangunan: "#4338ca", // indigo-700
  sewa_aset: "#0369a1", // sky-700
  parkir: "#0e7490", // cyan-700
  operasional: "#92400e", // amber-800
  lainnya_umum: "#334155", // slate-700
  // Dana Terikat
  wakaf: "#0f766e", // teal-700
  santunan_yatim: "#be123c", // rose-700
  dana_sosial_kematian: "#44403c", // stone-700
  beasiswa: "#c2410c", // orange-700
  lainnya_terikat: "#86198f", // fuchsia-800
};
