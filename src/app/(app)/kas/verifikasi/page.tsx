import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas, akunTakmir } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { formatRupiah } from "@/lib/rupiah";
import { labelKategori, labelTipe, formatTanggal } from "@/lib/labels";
import { kategoriWarnaKelas } from "@/lib/kategoriWarna";
import { Card, Badge } from "@/components/ui";
import FotoLightbox from "@/components/FotoLightbox";
import { setujuiTransaksi, tolakTransaksi } from "./actions";

export const metadata = { title: "Verifikasi Transaksi - AmanahMasjid" };

export default async function VerifikasiHalaman() {
  const session = await requireAdmin();

  const daftar = await db
    .select({
      id: transaksiKas.id,
      tanggal: transaksiKas.tanggal,
      tipe: transaksiKas.tipe,
      kategori: transaksiKas.kategori,
      nominal: transaksiKas.nominal,
      keterangan: transaksiKas.keterangan,
      buktiFoto: transaksiKas.buktiFoto,
      pencatat: akunTakmir.nama,
    })
    .from(transaksiKas)
    .innerJoin(akunTakmir, eq(transaksiKas.dibuatOleh, akunTakmir.id))
    .where(
      and(
        eq(transaksiKas.masjidId, session.masjidId),
        eq(transaksiKas.status, "menunggu")
      )
    )
    .orderBy(asc(transaksiKas.tanggal), asc(transaksiKas.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/kas" className="text-lg text-hijau-700 underline">
          ← Kembali ke Riwayat
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Verifikasi Transaksi
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Transaksi di bawah belum dihitung ke saldo laporan publik sampai
          disetujui.
        </p>
      </div>

      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">
            Tidak ada transaksi yang menunggu verifikasi. Semua sudah beres.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {daftar.map((t) => (
            <li key={t.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {t.buktiFoto && <FotoLightbox src={t.buktiFoto} />}
                    <div>
                      <Badge className={kategoriWarnaKelas[t.kategori]}>
                        {labelKategori[t.kategori]}
                      </Badge>
                      <p className="mt-1 text-base text-gray-600">
                        {formatTanggal(t.tanggal)} · {labelTipe[t.tipe]}
                        {t.keterangan ? ` - ${t.keterangan}` : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        Dicatat oleh: {t.pencatat}
                      </p>
                    </div>
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
                <div className="mt-3 flex gap-3">
                  <form action={setujuiTransaksi}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="min-h-[2.75rem] rounded-lg bg-hijau-600 px-5 text-base font-semibold text-white hover:bg-hijau-700"
                    >
                      Setujui
                    </button>
                  </form>
                  <form action={tolakTransaksi}>
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="min-h-[2.75rem] rounded-lg border-2 border-red-500 px-5 text-base font-semibold text-red-700 hover:bg-red-50"
                    >
                      Tolak
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
