import Link from "next/link";
import { and, eq, gte, ilike, lt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { formatRupiah } from "@/lib/rupiah";
import {
  kategoriKasOpsi,
  labelKategori,
  formatTanggal,
  NAMA_BULAN,
  labelKelompokDana,
} from "@/lib/labels";
import { Card, TautanTombol, Badge, PesanError } from "@/components/ui";
import { kategoriWarnaKelas } from "@/lib/kategoriWarna";
import { daftarTransaksiDenganSaldo } from "@/lib/queries";
import FotoLightbox from "@/components/FotoLightbox";

export const metadata = { title: "Kas & Infaq - AmanahMasjid" };

const labelStatus: Record<string, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

const warnaStatus: Record<string, string> = {
  menunggu: "bg-amber-100 text-amber-800",
  disetujui: "bg-hijau-100 text-hijau-800",
  ditolak: "bg-red-100 text-red-800",
};

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
  searchParams: Promise<{
    bulan?: string;
    dari?: string;
    sampai?: string;
    kategori?: string;
    kelompok?: string;
    cari?: string;
  }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;

  const kondisi = [eq(transaksiKas.masjidId, session.masjidId)];

  // Rentang tanggal bebas: kalau salah satu diisi, filter Bulan diabaikan.
  const TGL = /^\d{4}-\d{2}-\d{2}$/;
  const dariValid = sp.dari && TGL.test(sp.dari) ? sp.dari : undefined;
  const sampaiValid = sp.sampai && TGL.test(sp.sampai) ? sp.sampai : undefined;
  const pakaiRentang = Boolean(dariValid || sampaiValid);
  const rentangTerbalik = Boolean(
    dariValid && sampaiValid && dariValid > sampaiValid
  );

  if (pakaiRentang && !rentangTerbalik) {
    if (dariValid) kondisi.push(gte(transaksiKas.tanggal, dariValid));
    if (sampaiValid) kondisi.push(lte(transaksiKas.tanggal, sampaiValid));
  } else if (!pakaiRentang && sp.bulan && /^\d{4}-\d{2}$/.test(sp.bulan)) {
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

  // Filter kelompok dana
  if (sp.kelompok === "umum" || sp.kelompok === "terikat") {
    kondisi.push(eq(transaksiKas.kelompokDana, sp.kelompok));
  }

  // Pencarian bebas di kolom keterangan (case-insensitive, partial match)
  const cari = sp.cari?.trim();
  if (cari) {
    kondisi.push(ilike(transaksiKas.keterangan, `%${cari}%`));
  }

  const daftar = rentangTerbalik
    ? []
    : await daftarTransaksiDenganSaldo(session.masjidId, {
        bulan: sp.bulan,
        dari: dariValid,
        sampai: sampaiValid,
        kategori: sp.kategori,
        kelompok:
          sp.kelompok === "umum" || sp.kelompok === "terikat"
            ? sp.kelompok
            : undefined,
        cari: sp.cari,
      });

  const [ag] = rentangTerbalik
    ? [undefined]
    : await db
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
        <div className="flex flex-wrap gap-2">
          <TautanTombol
            href={`/kas/export?${new URLSearchParams(
              Object.fromEntries(
                Object.entries({
                  bulan: sp.bulan ?? "",
                  dari: dariValid ?? "",
                  sampai: sampaiValid ?? "",
                  kategori: sp.kategori ?? "",
                  kelompok: sp.kelompok ?? "",
                  cari: sp.cari ?? "",
                }).filter(([, v]) => v)
              )
            ).toString()}`}
            className="bg-white text-hijau-700 border-2 border-hijau-600 hover:bg-hijau-50"
          >
            Export CSV
          </TautanTombol>
          <TautanTombol href="/kas/tambah">+ Catat Transaksi</TautanTombol>
        </div>
      </div>

      {/* Filter (form GET, tanpa JavaScript) */}
      <Card>
        <form className="grid gap-3">
          <div>
            <label
              htmlFor="cari"
              className="mb-1 block text-base font-semibold text-gray-700"
            >
              Cari Keterangan
            </label>
            <input
              id="cari"
              name="cari"
              type="text"
              defaultValue={sp.cari ?? ""}
              placeholder="Contoh: infaq kotak amal"
              className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="dari"
                className="mb-1 block text-base font-semibold text-gray-700"
              >
                Dari Tanggal
              </label>
              <input
                id="dari"
                name="dari"
                type="date"
                defaultValue={sp.dari ?? ""}
                className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="sampai"
                className="mb-1 block text-base font-semibold text-gray-700"
              >
                Sampai Tanggal
              </label>
              <input
                id="sampai"
                name="sampai"
                type="date"
                defaultValue={sp.sampai ?? ""}
                className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Kalau rentang tanggal diisi, pilihan Bulan di bawah diabaikan.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
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
            <div>
              <label
                htmlFor="kelompok"
                className="mb-1 block text-base font-semibold text-gray-700"
              >
                Kelompok Dana
              </label>
              <select
                id="kelompok"
                name="kelompok"
                defaultValue={sp.kelompok ?? ""}
                className="w-full min-h-[3rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
              >
                <option value="">Semua Kelompok</option>
                <option value="umum">{labelKelompokDana.umum}</option>
                <option value="terikat">{labelKelompokDana.terikat}</option>
              </select>
            </div>
            <button
              type="submit"
              className="min-h-[3rem] rounded-xl bg-hijau-600 px-6 text-lg font-semibold text-white hover:bg-hijau-700"
            >
              Tampilkan
            </button>
          </div>
        </form>
      </Card>

      {rentangTerbalik && (
        <PesanError>
          Tanggal awal tidak boleh setelah tanggal akhir.
        </PesanError>
      )}

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
                    <div className="flex items-start gap-3">
                      {t.buktiFoto && <FotoLightbox src={t.buktiFoto} />}
                      <div>
                        <span className="flex flex-wrap items-center gap-2">
                          <Badge className={kategoriWarnaKelas[t.kategori]}>
                            {labelKategori[t.kategori]}
                          </Badge>
                          <Badge className={warnaStatus[t.status]}>
                            {labelStatus[t.status]}
                          </Badge>
                        </span>
                        <p className="mt-1 text-base text-gray-600">
                          {formatTanggal(t.tanggal)}
                          {t.keterangan ? ` - ${t.keterangan}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`whitespace-nowrap text-lg font-bold ${
                          t.tipe === "masuk" ? "text-hijau-700" : "text-red-700"
                        }`}
                      >
                        {t.tipe === "masuk" ? "+" : "−"}
                        {formatRupiah(t.nominal)}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-sm text-gray-500">
                        Saldo: {formatRupiah(t.saldoBerjalan)}
                      </p>
                    </div>
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
