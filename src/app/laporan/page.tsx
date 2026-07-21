import { headers } from "next/headers";
import QRCode from "qrcode";
import { ambilMasjidTunggal, saldoPerKelompok, ringkasanBulan } from "@/lib/queries";
import { formatRupiah } from "@/lib/rupiah";
import { NAMA_BULAN } from "@/lib/labels";
import TombolCetak from "./TombolCetak";

export async function generateMetadata() {
  const m = await ambilMasjidTunggal();
  return { title: m ? `Laporan Kas ${m.nama}` : "Laporan Masjid" };
}

export default async function LaporanPublik() {
  const m = await ambilMasjidTunggal();

  if (!m) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Masjid belum terdaftar
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Jalankan <code className="rounded bg-gray-100 px-2 py-1">npm run seed:admin</code>{" "}
            untuk mendaftarkan masjid dan akun admin pertama.
          </p>
        </div>
      </main>
    );
  }

  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = sekarang.getMonth() + 1;

  const [perKelompok, bulanIni] = await Promise.all([
    saldoPerKelompok(m.id),
    ringkasanBulan(m.id, tahun, bulan),
  ]);

  // URL absolut halaman ini untuk QR code.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const urlPublik = `${proto}://${host}/laporan`;
  const qrDataUrl = await QRCode.toDataURL(urlPublik, {
    width: 256,
    margin: 1,
  });

  const tglCetak = sekarang.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="print-area rounded-2xl border border-hijau-100 bg-white p-6 shadow-sm">
        <header className="border-b border-gray-200 pb-4 text-center">
          <p className="text-lg text-hijau-700">Laporan Kas Masjid</p>
          <h1 className="text-3xl font-bold text-gray-900">{m.nama}</h1>
          {m.alamat && (
            <p className="mt-1 text-base text-gray-600">{m.alamat}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">Per {tglCetak}</p>
        </header>

        {/* Saldo terkini, dipecah per kelompok dana */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-hijau-600 p-5 text-center text-white">
            <p className="text-base opacity-90">Saldo Dana Umum</p>
            <p className="mt-1 text-2xl font-bold">
              {formatRupiah(perKelompok.umum.saldo)}
            </p>
          </div>
          <div className="rounded-xl bg-teal-700 p-5 text-center text-white">
            <p className="text-base opacity-90">Saldo Dana Terikat</p>
            <p className="mt-1 text-2xl font-bold">
              {formatRupiah(perKelompok.terikat.saldo)}
            </p>
          </div>
        </section>
        <p className="mt-2 text-center text-sm text-gray-500">
          Dana terikat tidak untuk operasional umum.
        </p>

        {/* Ringkasan bulan berjalan */}
        <section className="mt-6">
          <h2 className="mb-3 text-xl font-bold text-gray-900">
            Bulan {NAMA_BULAN[bulan - 1]} {tahun}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-base text-gray-600">Pemasukan</p>
              <p className="mt-1 text-xl font-bold text-hijau-700">
                {formatRupiah(bulanIni.masuk)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-base text-gray-600">Pengeluaran</p>
              <p className="mt-1 text-xl font-bold text-red-700">
                {formatRupiah(bulanIni.keluar)}
              </p>
            </div>
          </div>
        </section>

        {/* QR code */}
        <section className="mt-6 flex flex-col items-center border-t border-gray-200 pt-6 text-center">
          <p className="text-base text-gray-600">
            Pindai untuk membuka laporan ini kapan saja:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`Kode QR laporan ${m.nama}`}
            width={180}
            height={180}
            className="mt-3"
          />
          <a
            href={qrDataUrl}
            download="qr-laporan.png"
            className="no-print mt-3 text-lg font-semibold text-hijau-700 underline"
          >
            Unduh Gambar QR
          </a>
        </section>

        <p className="mt-6 text-center text-sm text-gray-500">
          Laporan ini dibuat otomatis oleh AmanahMasjid.
        </p>
      </div>

      <div className="no-print mt-6 flex justify-center">
        <TombolCetak />
      </div>
    </main>
  );
}
