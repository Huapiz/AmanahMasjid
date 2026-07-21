// Label bahasa Indonesia sederhana untuk enum (dipakai di UI & laporan).

export const kategoriKasOpsi = [
  { nilai: "kas_umum", label: "Kas Umum", kelompok: "umum" },
  { nilai: "infaq_jumat", label: "Infaq Jumat", kelompok: "umum" },
  { nilai: "infaq_pembangunan", label: "Infaq Pembangunan", kelompok: "umum" },
  { nilai: "sewa_aset", label: "Sewa Aset Masjid", kelompok: "umum" },
  { nilai: "parkir", label: "Parkir", kelompok: "umum" },
  { nilai: "operasional", label: "Operasional", kelompok: "umum" },
  { nilai: "lainnya_umum", label: "Lainnya (Umum)", kelompok: "umum" },
  { nilai: "wakaf", label: "Wakaf", kelompok: "terikat" },
  { nilai: "santunan_yatim", label: "Santunan Yatim/Dhuafa", kelompok: "terikat" },
  { nilai: "dana_sosial_kematian", label: "Dana Sosial Kematian", kelompok: "terikat" },
  { nilai: "beasiswa", label: "Beasiswa Pendidikan", kelompok: "terikat" },
  { nilai: "lainnya_terikat", label: "Lainnya (Terikat)", kelompok: "terikat" },
] as const;

export const labelKategori: Record<string, string> = Object.fromEntries(
  kategoriKasOpsi.map((o) => [o.nilai, o.label])
);

// Sumber kebenaran tunggal kategori -> kelompok, dipakai server-side di
// kas/actions.ts supaya kelompok_dana tersimpan tidak pernah bisa beda dari
// kategorinya (jangan percaya kelompok dari input klien).
export const kelompokKategori: Record<string, "umum" | "terikat"> =
  Object.fromEntries(kategoriKasOpsi.map((o) => [o.nilai, o.kelompok]));

export const kategoriKasUmum = kategoriKasOpsi.filter((o) => o.kelompok === "umum");
export const kategoriKasTerikat = kategoriKasOpsi.filter((o) => o.kelompok === "terikat");

export const labelKelompokDana: Record<string, string> = {
  umum: "Dana Umum",
  terikat: "Dana Terikat",
};

export const tipeOpsi = [
  { nilai: "masuk", label: "Uang Masuk" },
  { nilai: "keluar", label: "Uang Keluar" },
] as const;

export const labelTipe: Record<string, string> = {
  masuk: "Uang Masuk",
  keluar: "Uang Keluar",
};

// Format tanggal ISO (YYYY-MM-DD) ke tampilan Indonesia, mis. "15 Jul 2026".
export const BULAN_SINGKAT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatTanggal(iso: string): string {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN_SINGKAT[m - 1]} ${y}`;
}

export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
