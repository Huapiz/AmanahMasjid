// Label bahasa Indonesia sederhana untuk enum (dipakai di UI & laporan).

export const kategoriKasOpsi = [
  { nilai: "kas_umum", label: "Kas Umum" },
  { nilai: "infaq_jumat", label: "Infaq Jumat" },
  { nilai: "infaq_lain", label: "Infaq Lain" },
  { nilai: "operasional", label: "Operasional" },
  { nilai: "lainnya", label: "Lainnya" },
] as const;

export const labelKategori: Record<string, string> = Object.fromEntries(
  kategoriKasOpsi.map((o) => [o.nilai, o.label])
);

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
