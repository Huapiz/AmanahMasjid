// Jadwal sholat via AlAdhan API (gratis, tanpa API key). Method 20 =
// Kementerian Agama Republik Indonesia (dikonfirmasi dari daftar resmi
// calculation-methods di aladhan.com, bukan tebakan).
export type JadwalSholat = {
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

function formatTanggalAladhan(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function ambilJadwalSholat(
  latitude: number,
  longitude: number,
  tanggal: Date = new Date()
): Promise<JadwalSholat | null> {
  const tgl = formatTanggalAladhan(tanggal);
  const url = `https://api.aladhan.com/v1/timings/${tgl}?latitude=${latitude}&longitude=${longitude}&method=20`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t?.Fajr || !t?.Dhuhr || !t?.Asr || !t?.Maghrib || !t?.Isha) return null;
    return {
      subuh: t.Fajr,
      dzuhur: t.Dhuhr,
      ashar: t.Asr,
      maghrib: t.Maghrib,
      isya: t.Isha,
    };
  } catch {
    return null;
  }
}

export type SholatBerikutnya = { label: string; jam: string; besok: boolean };

const URUTAN: { label: string; kunci: keyof JadwalSholat }[] = [
  { label: "Subuh", kunci: "subuh" },
  { label: "Dzuhur", kunci: "dzuhur" },
  { label: "Ashar", kunci: "ashar" },
  { label: "Maghrib", kunci: "maghrib" },
  { label: "Isya", kunci: "isya" },
];

function menitDariJam(jam: string): number {
  const [h, m] = jam.split(":").map((x) => parseInt(x, 10));
  return h * 60 + (m || 0);
}

// Cari sholat berikutnya yang belum lewat; kalau semua sudah lewat hari
// ini, berikutnya adalah Subuh besok.
export function sholatBerikutnya(
  jadwal: JadwalSholat,
  sekarang: Date = new Date()
): SholatBerikutnya {
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  for (const { label, kunci } of URUTAN) {
    const jam = jadwal[kunci];
    if (menitDariJam(jam) > menitSekarang) {
      return { label, jam, besok: false };
    }
  }

  return { label: "Subuh", jam: jadwal.subuh, besok: true };
}
