// Format angka menjadi Rupiah tanpa desimal, mis. 1500000 -> "Rp1.500.000".
export function formatRupiah(nominal: number): string {
  const n = Math.round(nominal || 0);
  return "Rp" + n.toLocaleString("id-ID");
}

// Ubah input teks (mis. "1.500.000" atau "1500000") menjadi integer rupiah.
export function parseRupiah(input: string): number {
  const digitsOnly = (input || "").replace(/[^\d]/g, "");
  if (!digitsOnly) return 0;
  return parseInt(digitsOnly, 10);
}
