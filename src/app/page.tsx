import Link from "next/link";
import {
  ambilMasjidTunggal,
  agendaMendatang,
  fotoTerbaru,
  strukturPengurusPublik,
  statistikRingkas,
} from "@/lib/queries";
import { formatTanggal } from "@/lib/labels";
import { formatRupiah } from "@/lib/rupiah";
import { ambilJadwalSholat, sholatBerikutnya } from "@/lib/jadwalSholat";
import FotoLightbox from "@/components/FotoLightbox";
import FaqAccordion from "@/components/FaqAccordion";
import DaftarInfoForm from "@/components/DaftarInfoForm";

export async function generateMetadata() {
  const m = await ambilMasjidTunggal();
  return { title: m ? `${m.nama} - Halaman Depan` : "Masjid" };
}

export default async function BerandaPublik() {
  const m = await ambilMasjidTunggal();

  if (!m) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Masjid belum terdaftar
          </h1>
          <p className="mt-2 text-base text-neutral-500">
            Jalankan <code className="rounded bg-gray-100 px-2 py-1">npm run seed:admin</code>{" "}
            untuk mendaftarkan masjid dan akun admin pertama.
          </p>
        </div>
      </main>
    );
  }

  const tahunIni = new Date().getFullYear();

  const [agenda, foto, pengurus, statistik] = await Promise.all([
    agendaMendatang(m.id),
    fotoTerbaru(m.id),
    strukturPengurusPublik(m.id),
    statistikRingkas(m.id, tahunIni),
  ]);

  const punyaKoordinat = m.latitude != null && m.longitude != null;
  const jadwal = punyaKoordinat
    ? await ambilJadwalSholat(m.latitude as number, m.longitude as number)
    : null;
  const berikutnya = jadwal ? sholatBerikutnya(jadwal) : null;

  const waHref = m.nomorWaKontak
    ? `https://wa.me/${m.nomorWaKontak.replace(/[^\d]/g, "")}`
    : null;

  const fotoStrip = foto.slice(0, 4);

  return (
    <main className="bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 pb-14">
        {/* Navbar */}
        <nav className="flex items-center justify-between border-b border-neutral-200 py-5">
          <span className="text-xl font-semibold text-neutral-900">
            {m.nama}
          </span>
          <Link
            href="/masuk"
            className="text-sm font-medium text-neutral-500 underline hover:text-neutral-800"
          >
            Masuk Takmir
          </Link>
        </nav>

        {/* Ticker pengumuman */}
        {m.pengumuman && (
          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white py-2">
            <span className="marquee-jalan px-4 text-base font-semibold text-neutral-700">
              {m.pengumuman}
            </span>
          </div>
        )}

        <div className="space-y-16 sm:space-y-24">
          {/* Hero: momen jadwal sholat */}
          <section className="py-16 text-center sm:py-24">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Jadwal Sholat
            </h1>
            {!punyaKoordinat ? (
              <p className="mt-3 text-base text-neutral-500">
                Koordinat masjid belum diatur, hubungi admin.
              </p>
            ) : !jadwal ? (
              <p className="mt-3 text-base text-neutral-500">
                Jadwal sholat tidak bisa dimuat saat ini, coba lagi nanti.
              </p>
            ) : (
              <>
                {berikutnya && (
                  <div className="mt-4">
                    <p
                      className="font-bold tracking-tight text-hijau-600"
                      style={{ fontSize: "clamp(3.5rem, 12vw, 8rem)" }}
                    >
                      {berikutnya.label}
                    </p>
                    <p className="mt-1 text-2xl font-light tabular-nums text-neutral-500 sm:text-3xl">
                      {berikutnya.jam}
                      {berikutnya.besok ? " · besok" : ""}
                    </p>
                  </div>
                )}

                {fotoStrip.length > 0 && (
                  <div className="mt-8 flex justify-center gap-3 overflow-x-auto px-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0">
                    {fotoStrip.map((f) => (
                      <a
                        key={f.id}
                        href="#galeri"
                        className="shrink-0"
                        aria-label="Lihat galeri foto kegiatan"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.foto}
                          alt={f.keterangan ?? "Foto kegiatan"}
                          width={112}
                          height={112}
                          className="h-24 w-24 rounded-xl border border-neutral-200 object-cover sm:h-28 sm:w-28"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-neutral-200 pt-6">
                  {[
                    { label: "Subuh", jam: jadwal.subuh },
                    { label: "Dzuhur", jam: jadwal.dzuhur },
                    { label: "Ashar", jam: jadwal.ashar },
                    { label: "Maghrib", jam: jadwal.maghrib },
                    { label: "Isya", jam: jadwal.isya },
                  ].map((w) => (
                    <div key={w.label} className="flex items-baseline gap-1.5">
                      <span className="text-sm text-neutral-500">{w.label}</span>
                      <span className="text-base font-medium tabular-nums text-neutral-900">
                        {w.jam}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Statistik ringkas */}
          <section className="grid grid-cols-3 divide-x divide-neutral-200 py-8 sm:py-10">
            {[
              {
                label: "Dana Tersalurkan (tahun ini)",
                nilai: formatRupiah(statistik.danaTersalurkan),
              },
              {
                label: "Kegiatan Terlaksana",
                nilai: String(statistik.kegiatanTerlaksana),
              },
              {
                label: "Pengurus Terdaftar",
                nilai: String(statistik.jumlahPengurus),
              },
            ].map((s) => (
              <div key={s.label} className="min-w-0 px-2 text-center sm:px-4">
                <p
                  className="break-words font-bold leading-tight tabular-nums text-hijau-600"
                  style={{ fontSize: "clamp(0.8rem, 3.8vw, 1.6rem)" }}
                >
                  {s.nilai}
                </p>
                <p className="mt-2 text-xs leading-tight text-neutral-500 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </section>

          {/* Profil + pull-quote sambutan takmir */}
          <section
            className={`grid gap-6 ${m.sambutanTakmir ? "sm:grid-cols-2" : ""}`}
          >
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                {m.nama}
              </h2>
              {m.alamat && (
                <p className="mt-2 text-base text-neutral-500">{m.alamat}</p>
              )}
              {m.deskripsi && (
                <p className="mt-4 text-base leading-relaxed text-neutral-700">
                  {m.deskripsi}
                </p>
              )}
            </div>
            {m.sambutanTakmir && (
              <blockquote className="border-l-4 border-hijau-600 pl-4">
                <p className="text-lg italic leading-relaxed text-neutral-700">
                  &ldquo;{m.sambutanTakmir}&rdquo;
                </p>
                <footer className="mt-2 text-sm text-neutral-500">
                  — Ketua Takmir
                </footer>
              </blockquote>
            )}
          </section>

          {/* Agenda Mendatang */}
          <section>
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Agenda Mendatang
            </h2>
            {agenda.length === 0 ? (
              <p className="mt-3 text-base text-neutral-500">
                Belum ada agenda mendatang.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {agenda.map((a) => (
                  <li
                    key={a.id}
                    className="border-b border-neutral-200 pb-3 last:border-0"
                  >
                    <p className="text-base font-bold text-neutral-900">{a.judul}</p>
                    <p className="text-sm text-neutral-500">
                      {formatTanggal(a.tanggalMulai)}
                      {a.deskripsi ? ` · ${a.deskripsi}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Galeri */}
          {foto.length > 0 && (
            <section id="galeri">
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Galeri Kegiatan
              </h2>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {foto.map((f) => (
                  <FotoLightbox
                    key={f.id}
                    src={f.foto}
                    alt={f.keterangan ?? "Foto kegiatan"}
                    ukuran={80}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Struktur Pengurus */}
          {pengurus.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Struktur Pengurus
              </h2>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {pengurus.map((p) => (
                  <li key={p.id}>
                    <p className="text-base font-bold text-neutral-900">{p.nama}</p>
                    <p className="text-sm text-neutral-500">{p.jabatan}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ */}
          <section className="rounded-xl border border-neutral-200 bg-white p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Pertanyaan Umum
            </h2>
            <div className="mt-4">
              <FaqAccordion />
            </div>
          </section>

          {/* Formulir daftar info kegiatan */}
          <section className="rounded-xl border border-neutral-200 bg-white p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              Daftar Info Kegiatan
            </h2>
            <p className="mt-2 text-base text-neutral-500">
              Tinggalkan nomor WA untuk menerima info kegiatan masjid.
            </p>
            <div className="mt-4">
              <DaftarInfoForm />
            </div>
          </section>

          {/* Band CTA penutup */}
          <section className="rounded-xl bg-neutral-900 p-8 text-center sm:p-12">
            <p className="text-lg text-white/90">
              Mari ikut menjaga & memakmurkan masjid ini
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[3.25rem] items-center justify-center rounded-xl border-2 border-white/30 px-6 text-lg font-semibold text-white hover:bg-white/10"
                >
                  Hubungi Takmir
                </a>
              )}
              <Link
                href="/laporan"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-xl bg-hijau-600 px-6 text-lg font-bold text-white hover:bg-hijau-700"
              >
                Lihat Laporan Kas &amp; Transparansi
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
