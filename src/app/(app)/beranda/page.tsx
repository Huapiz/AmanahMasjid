import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masjid } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { saldoTotal, ringkasanBulan } from "@/lib/queries";
import { formatRupiah } from "@/lib/rupiah";
import { NAMA_BULAN } from "@/lib/labels";
import { Card, TautanTombol } from "@/components/ui";

export const metadata = { title: "Beranda — AmanahMasjid" };

export default async function Beranda() {
  const session = await requireSession();

  const [m] = await db
    .select({ nama: masjid.nama, slug: masjid.slug })
    .from(masjid)
    .where(eq(masjid.id, session.masjidId))
    .limit(1);

  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = sekarang.getMonth() + 1;

  const [saldo, bulanIni] = await Promise.all([
    saldoTotal(session.masjidId),
    ringkasanBulan(session.masjidId, tahun, bulan),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg text-gray-600">Assalamu&apos;alaikum,</p>
        <h1 className="text-2xl font-bold text-gray-900">{m?.nama}</h1>
      </div>

      {/* Saldo utama */}
      <Card className="bg-hijau-600 text-white">
        <p className="text-lg opacity-90">Saldo Kas Saat Ini</p>
        <p className="mt-1 text-3xl font-bold">{formatRupiah(saldo)}</p>
      </Card>

      {/* Ringkasan bulan berjalan */}
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Bulan {NAMA_BULAN[bulan - 1]} {tahun}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-base text-gray-600">Uang Masuk</p>
            <p className="mt-1 text-xl font-bold text-hijau-700">
              {formatRupiah(bulanIni.masuk)}
            </p>
          </Card>
          <Card>
            <p className="text-base text-gray-600">Uang Keluar</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {formatRupiah(bulanIni.keluar)}
            </p>
          </Card>
        </div>
      </div>

      {/* Aksi cepat */}
      <div className="grid gap-3 sm:grid-cols-2">
        <TautanTombol href="/kas/tambah" className="w-full">
          + Catat Transaksi
        </TautanTombol>
        <TautanTombol
          href="/kas"
          className="w-full bg-white text-hijau-700 border-2 border-hijau-600 hover:bg-hijau-50"
        >
          Lihat Riwayat Kas
        </TautanTombol>
      </div>

      {/* Laporan publik */}
      {m?.slug && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900">Laporan untuk Jemaah</h2>
          <p className="mt-1 text-base text-gray-600">
            Bagikan tautan ini ke grup WhatsApp jemaah. Mereka bisa melihat
            laporan tanpa perlu masuk.
          </p>
          <Link
            href={`/m/${m.slug}`}
            className="mt-3 inline-block break-all text-lg font-semibold text-hijau-700 underline"
          >
            /m/{m.slug}
          </Link>
        </Card>
      )}
    </div>
  );
}
