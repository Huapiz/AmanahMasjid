// Normalisasi & validasi nomor HP Indonesia ke format E.164 (+62...).
// Menerima input umum: 08xxxx, 8xxxx, 628xxxx, +628xxxx (boleh ada spasi/strip).

export function normalisasiNomorHp(input: string): string | null {
  if (!input) return null;

  // Buang semua karakter selain digit dan tanda plus di depan
  let s = input.trim().replace(/[\s\-().]/g, "");

  if (s.startsWith("+")) s = s.slice(1);

  // Hanya digit yang tersisa
  if (!/^\d+$/.test(s)) return null;

  // Samakan berbagai bentuk awalan menjadi 62...
  if (s.startsWith("0")) {
    s = "62" + s.slice(1);
  } else if (s.startsWith("8")) {
    s = "62" + s;
  } else if (!s.startsWith("62")) {
    // Awalan tidak dikenali sebagai nomor Indonesia
    return null;
  }

  // Setelah 62 harus diikuti 8 (operator seluler Indonesia)
  if (!s.startsWith("628")) return null;

  // Panjang nomor seluler Indonesia: 62 + 9..12 digit (total 11..14 digit)
  if (s.length < 11 || s.length > 14) return null;

  return "+" + s;
}

export function nomorValid(input: string): boolean {
  return normalisasiNomorHp(input) !== null;
}

// Tampilan ramah: +62 812-3456-7890
export function tampilkanNomorHp(e164: string): string {
  return e164;
}
