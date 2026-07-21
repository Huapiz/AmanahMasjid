import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masjid } from "@/db/schema";
import { requireSession } from "@/lib/session";
import {
  saldoTotal,
  ringkasanBulan,
  ringkasanTahun,
  saldoPerBulan,
  saldoPerKelompok,
  ringkasanKategoriBulan,
  jumlahMenunggu,
  anggaranVsRealisasi,
} from "@/lib/queries";
import { formatRupiah } from "@/lib/rupiah";
import { NAMA_BULAN, labelKelompokDana } from "@/lib/labels";
import { Card, TautanTombol } from "@/components/ui";
import SparklineSaldo from "@/components/SparklineSaldo";
import GrafikKategori from "@/components/GrafikKategori";

export const metadata = { title: "Beranda - AmanahMasjid" };

// Indikator naik/turun dibanding bulan lalu. Untuk "Uang Keluar" warnanya
// dibalik (invert): pengeluaran naik = merah, turun = hijau.
function IndikatorPerubahan({
  persen,
  invert = false,
}: {
  persen: number | null;
  invert?: boolean;
}) {
  if (persen === null) {
    return <span className="text-sm font-medium text-gray-500">Baru mulai</span>;
  }
  const naik = persen >= 0;
  const bagus = invert ? !naik : naik;
  return (
    <span
      className={`text-sm font-semibold ${
        bagus ? "text-hijau-700" : "text-red-700"
      }`}
    >
      {naik ? "▲" : "▼"} {naik ? "+" : ""}
      {persen}% dari bulan lalu
    </span>
  );
}

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
  // Bulan sebelumnya (Januari -> Desember tahun lalu)
  const bulanLaluNum = bulan === 1 ? 12 : bulan - 1;
  const tahunLalu = bulan === 1 ? tahun - 1 : tahun;

  const [
    saldo,
    bulanIni,
    bulanLalu,
    tahunIni,
    trenSaldo,
    perKelompok,
    kategoriKeluar,
    kategoriMasuk,
    anggaran,
  ] = await Promise.all([
    saldoTotal(session.masjidId),
    ringkasanBulan(session.masjidId, tahun, bulan),
    ringkasanBulan(session.masjidId, tahunLalu, bulanLaluNum),
    ringkasanTahun(session.masjidId, tahun),
    saldoPerBulan(session.masjidId),
    saldoPerKelompok(session.masjidId),
    ringkasanKategoriBulan(session.masjidId, tahun, bulan, "keluar", "disetujui"),
    ringkasanKategoriBulan(session.masjidId, tahun, bulan, "masuk", "disetujui"),
    anggaranVsRealisasi(session.masjidId, tahun, bulan),
  ]);

  const persenMasuk =
    bulanLalu.masuk === 0
      ? null
      : Math.round(((bulanIni.masuk - bulanLalu.masuk) / bulanLalu.masuk) * 100);
  const persenKeluar =
    bulanLalu.keluar === 0
      ? null
      : Math.round(
          ((bulanIni.keluar - bulanLalu.keluar) / bulanLalu.keluar) * 100
        );

  const menunggu =
    session.peran === "admin" ? await jumlahMenunggu(session.masjidId) : null;

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

      {/* Transaksi menunggu verifikasi (admin saja) */}
      {menunggu && menunggu.jumlah > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-base text-amber-900">
            <span className="font-bold">{formatRupiah(menunggu.total)}</span>{" "}
            sedang menunggu verifikasi ({menunggu.jumlah} transaksi).
          </p>
          <Link
            href="/kas/verifikasi"
            className="mt-1 inline-block text-base font-semibold text-amber-900 underline"
          >
            Buka halaman verifikasi →
          </Link>
        </Card>
      )}

      {/* Saldo per kelompok dana */}
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-base text-gray-600">{labelKelompokDana.umum}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatRupiah(perKelompok.umum.saldo)}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-600">{labelKelompokDana.terikat}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatRupiah(perKelompok.terikat.saldo)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Dana terikat tidak untuk operasional umum.
        </p>
      </Card>

      {/* Tren saldo 6 bulan terakhir */}
      <Card>
        <p className="mb-2 text-base font-semibold text-gray-700">
          Tren Saldo 6 Bulan Terakhir
        </p>
        <SparklineSaldo data={trenSaldo} />
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
            <div className="mt-1">
              <IndikatorPerubahan persen={persenMasuk} />
            </div>
          </Card>
          <Card>
            <p className="text-base text-gray-600">Uang Keluar</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {formatRupiah(bulanIni.keluar)}
            </p>
            <div className="mt-1">
              <IndikatorPerubahan persen={persenKeluar} invert />
            </div>
          </Card>
        </div>
      </div>

      {/* Ringkasan tahun berjalan */}
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Total Tahun {tahun}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-base text-gray-600">Uang Masuk</p>
            <p className="mt-1 text-xl font-bold text-hijau-700">
              {formatRupiah(tahunIni.masuk)}
            </p>
          </Card>
          <Card>
            <p className="text-base text-gray-600">Uang Keluar</p>
            <p className="mt-1 text-xl font-bold text-red-700">
              {formatRupiah(tahunIni.keluar)}
            </p>
          </Card>
        </div>
      </div>

      {/* Grafik per kategori bulan berjalan */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <GrafikKategori data={kategoriKeluar} judul="Pengeluaran per Kategori" />
        </Card>
        <Card>
          <GrafikKategori data={kategoriMasuk} judul="Pemasukan per Kategori" />
        </Card>
      </div>

      {/* Anggaran vs realisasi bulan berjalan (hanya kalau ada target) */}
      {anggaran.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-gray-700">
              Anggaran Bulan Ini
            </p>
            {session.peran === "admin" && (
              <Link
                href="/kas/anggaran"
                className="text-sm font-semibold text-hijau-700 underline"
              >
                Atur Target
              </Link>
            )}
          </div>
          <ul className="mt-3 space-y-3">
            {anggaran.map((a) => {
              const warnaBar =
                a.persen > 100
                  ? "bg-red-600"
                  : a.persen >= 80
                    ? "bg-amber-500"
                    : "bg-hijau-600";
              return (
                <li key={a.kategori}>
                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-gray-800">
                      {a.label}
                    </span>
                    <span className="text-gray-600">
                      {formatRupiah(a.realisasi)} / {formatRupiah(a.target)} (
                      {a.persen}%)
                    </span>
                  </div>
                  <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${warnaBar}`}
                      style={{ width: `${Math.min(a.persen, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

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
      <Card>
        <h2 className="text-xl font-bold text-gray-900">Laporan untuk Jemaah</h2>
        <p className="mt-1 text-base text-gray-600">
          Bagikan tautan ini ke grup WhatsApp jemaah. Mereka bisa melihat
          laporan tanpa perlu masuk.
        </p>
        <Link
          href="/laporan"
          className="mt-3 inline-block break-all text-lg font-semibold text-hijau-700 underline"
        >
          /laporan
        </Link>
      </Card>
    </div>
  );
}
