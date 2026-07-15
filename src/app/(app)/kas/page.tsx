import Link from "next/link";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { formatRupiah } from "@/lib/rupiah";
import {
  kategoriKasOpsi,
  labelKategori,
  formatTanggal,
  NAMA_BULAN,
} from "@/lib/labels";
import { Card, TautanTombol } from "@/components/ui";

export const metadata = { title: "Kas & Infaq — AmanahMasjid" };

// Buat daftar 12 bulan terakhir untuk pilihan filter.
function opsiBulan(): { nilai: string; label: string }[] {
  const hasil: { nilai: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const tahun = d.getFullYear();
    const bulan = d.getMonth() + 1;
    hasil.push({
      nilai: `${tahun}-${String(bulan).padStart(2, "0")}`,
      label: `${NAMA_BULAN[bulan - 1]} ${tahun}`,
    });
    d.setMonth(d.getMonth() - 1);
  }
  return hasil;
}

export default async function DaftarKas({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; kategori?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;

  const kondisi = [eq(transaksiKas.masjidId, session.masjidId)];

  // Filter bulan (format YYYY-MM)
  if (sp.bulan && /^\d{4}-\d{2}$/.test(sp.bulan)) {
    const [y, m] = sp.bulan.split("-").map((x) => parseInt(x, 10));
    const awal = `${y}-${String(m).padStart(2, "0")}-01`;
    const mB = m === 12 ? 1 : m + 1;
    const yB = m === 12 ? y + 1 : y;
    const awalBerikut = `${yB}-${String(mB).padStart(2, "0")}-01`;
    kondisi.push(gte(transaksiKas.tanggal, awal));
    kondisi.push(lt(transaksiKas.tanggal, awalBerikut));
  }

  // Filter kategori
  const kategoriValid = kategoriKasOpsi.some((o) => o.nilai === sp.kategori);
  if (sp.kategori && kategoriValid) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kondisi.push(eq(transaksiKas.kategori, sp.kategori as any));
  }

  const daftar = await db
    .select()
    .from(transaksiKas)
    .where(and(...kondisi))
    .orderBy(desc(transaksiKas.tanggal), desc(transaksiKas.createdAt))
    .limit(200);

  const [ag] = await db
    .select({
      masuk: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'masuk' then ${transaksiKas.nominal} else 0 end), 0)::int`,
      keluar: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'keluar' then ${transaksiKas.nominal} else 0 end), 0)::int`,
    })
    .from(transaksiKas)
    .where(and(...kondisi));

  const masuk = Number(ag?.masuk ?? 0);
  const keluar = Number(ag?.keluar ?? 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Kas &amp; Infaq</h1>
        <TautanTombol href="/kas/tambah">+ Catat Transaksi</TautanTombol>
      </div>

      {/* Filter (form GET, tanpa JavaScript) */}
      <Card>
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="bulan"
              className="mb-1 block text-base font-semibold text-gray-700"
            >
              Bulan
            </label>
            <select
              id="bulan"
              name="bulan"
              defaultValue={sp.bulan ?? ""}
              className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
            >
              <option value="">Semua Bulan</option>
              {opsiBulan().map((o) => (
                <option key={o.nilai} value={o.nilai}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="kategori"
              className="mb-1 block text-base font-semibold text-gray-700"
            >
              Kategori
            </label>
            <select
              id="kategori"
              name="kategori"
              defaultValue={sp.kategori ?? ""}
              className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
            >
              <option value="">Semua Kategori</option>
              {kategoriKasOpsi.map((o) => (
                <option key={o.nilai} value={o.nilai}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="min-h-[3rem] rounded-xl bg-hijau-600 px-6 text-lg font-semibold text-white hover:bg-hijau-700"
          >
            Tampilkan
          </button>
        </form>
      </Card>

      {/* Ringkasan hasil filter */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-sm text-gray-600">Masuk</p>
          <p className="text-lg font-bold text-hijau-700">
            {formatRupiah(masuk)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Keluar</p>
          <p className="text-lg font-bold text-red-700">
            {formatRupiah(keluar)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Selisih</p>
          <p className="text-lg font-bold text-gray-900">
            {formatRupiah(masuk - keluar)}
          </p>
        </Card>
      </div>

      {/* Daftar transaksi */}
      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">
            Belum ada transaksi. Tekan “+ Catat Transaksi” untuk menambah.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {daftar.map((t) => (
            <li key={t.id}>
              <Link href={`/kas/${t.id}`} className="block">
                <Card className="transition hover:border-hijau-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {labelKategori[t.kategori]}
                      </p>
                      <p className="text-base text-gray-600">
                        {formatTanggal(t.tanggal)}
                        {t.keterangan ? ` — ${t.keterangan}` : ""}
                      </p>
                    </div>
                    <p
                      className={`whitespace-nowrap text-lg font-bold ${
                        t.tipe === "masuk" ? "text-hijau-700" : "text-red-700"
                      }`}
                    >
                      {t.tipe === "masuk" ? "+" : "−"}
                      {formatRupiah(t.nominal)}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
