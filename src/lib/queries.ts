import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { BULAN_SINGKAT } from "@/lib/labels";

export type RingkasanKas = {
  masuk: number;
  keluar: number;
  saldo: number;
};

// Total pemasukan & pengeluaran (opsional dibatasi rentang tanggal).
async function agregat(
  masjidId: string,
  dariTanggal?: string,
  sampaiTanggal?: string
): Promise<RingkasanKas> {
  const kondisi = [eq(transaksiKas.masjidId, masjidId)];
  if (dariTanggal) kondisi.push(gte(transaksiKas.tanggal, dariTanggal));
  if (sampaiTanggal) kondisi.push(lte(transaksiKas.tanggal, sampaiTanggal));

  const [row] = await db
    .select({
      masuk: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'masuk' then ${transaksiKas.nominal} else 0 end), 0)::int`,
      keluar: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'keluar' then ${transaksiKas.nominal} else 0 end), 0)::int`,
    })
    .from(transaksiKas)
    .where(and(...kondisi));

  const masuk = Number(row?.masuk ?? 0);
  const keluar = Number(row?.keluar ?? 0);
  return { masuk, keluar, saldo: masuk - keluar };
}

// Saldo total sejak awal.
export async function saldoTotal(masjidId: string): Promise<number> {
  const r = await agregat(masjidId);
  return r.saldo;
}

// Ringkasan bulan tertentu (tahun & bulan 1-12).
export async function ringkasanBulan(
  masjidId: string,
  tahun: number,
  bulan: number
): Promise<RingkasanKas> {
  const awal = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
  // Tanggal awal bulan berikutnya, lalu pakai batas < (kita pakai <= hari terakhir)
  const bulanBerikut = bulan === 12 ? 1 : bulan + 1;
  const tahunBerikut = bulan === 12 ? tahun + 1 : tahun;
  const awalBerikut = `${tahunBerikut}-${String(bulanBerikut).padStart(2, "0")}-01`;

  // gunakan lt (< awal bulan berikut) via lte pada hari terakhir tidak perlu:
  const kondisi = [
    eq(transaksiKas.masjidId, masjidId),
    gte(transaksiKas.tanggal, awal),
    sql`${transaksiKas.tanggal} < ${awalBerikut}`,
  ];

  const [row] = await db
    .select({
      masuk: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'masuk' then ${transaksiKas.nominal} else 0 end), 0)::int`,
      keluar: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'keluar' then ${transaksiKas.nominal} else 0 end), 0)::int`,
    })
    .from(transaksiKas)
    .where(and(...kondisi));

  const masuk = Number(row?.masuk ?? 0);
  const keluar = Number(row?.keluar ?? 0);
  return { masuk, keluar, saldo: masuk - keluar };
}

// Ringkasan satu tahun kalender penuh (1 Jan - 31 Des).
export async function ringkasanTahun(
  masjidId: string,
  tahun: number
): Promise<RingkasanKas> {
  return agregat(masjidId, `${tahun}-01-01`, `${tahun}-12-31`);
}

export type TitikSaldo = { label: string; saldo: number };

// Saldo kumulatif (sejak awal) di penghujung tiap bulan, untuk N bulan terakhir
// (bulan berjalan pakai tanggal hari ini karena belum selesai).
export async function saldoPerBulan(
  masjidId: string,
  jumlahBulan = 6
): Promise<TitikSaldo[]> {
  const sekarang = new Date();

  const rencana = Array.from({ length: jumlahBulan }, (_, idx) => {
    const i = jumlahBulan - 1 - idx;
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    const tahun = d.getFullYear();
    const bulan = d.getMonth() + 1;
    const akhirBulan = new Date(tahun, bulan, 0).getDate();
    const cutoff =
      i === 0
        ? sekarang.toISOString().slice(0, 10)
        : `${tahun}-${String(bulan).padStart(2, "0")}-${String(akhirBulan).padStart(2, "0")}`;
    return { label: BULAN_SINGKAT[bulan - 1], cutoff };
  });

  return Promise.all(
    rencana.map(async ({ label, cutoff }) => ({
      label,
      saldo: (await agregat(masjidId, undefined, cutoff)).saldo,
    }))
  );
}
