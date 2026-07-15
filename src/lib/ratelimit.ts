// Rate limit sederhana untuk percobaan login, mencegah brute force PIN 6 digit
// (PRD §10). Disimpan in-memory per instance — cukup untuk MVP. Untuk skala
// produksi, ganti dengan penyimpanan bersama (mis. Upstash Redis / tabel Neon).

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const MAKS_PERCOBAAN = 5;
const JENDELA_MS = 15 * 60 * 1000; // 15 menit

export type HasilRateLimit = {
  boleh: boolean;
  sisa: number;
  detikTunggu: number;
};

export function cekRateLimit(key: string): HasilRateLimit {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    return { boleh: true, sisa: MAKS_PERCOBAAN, detikTunggu: 0 };
  }

  if (entry.count >= MAKS_PERCOBAAN) {
    return {
      boleh: false,
      sisa: 0,
      detikTunggu: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    boleh: true,
    sisa: MAKS_PERCOBAAN - entry.count,
    detikTunggu: 0,
  };
}

// Catat satu percobaan gagal.
export function catatGagal(key: string): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + JENDELA_MS });
  } else {
    entry.count += 1;
  }
}

// Reset counter setelah login berhasil.
export function resetRateLimit(key: string): void {
  store.delete(key);
}
