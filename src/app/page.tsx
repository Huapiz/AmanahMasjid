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
          <h1 className="text-2xl font-bold text-charcoal">
            Masjid belum terdaftar
          </h1>
          <p className="mt-2 text-base text-charcoal/70">
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

  return (
    <main className="bg-ivory">
      <div className="mx-auto max-w-2xl px-4 pb-14">
        {/* Navbar */}
        <nav className="flex items-center justify-between border-b border-charcoal/10 py-5">
          <span className="font-serif text-xl font-semibold text-charcoal">
            {m.nama}
          </span>
          <Link
            href="/masuk"
            className="text-sm font-medium text-charcoal/50 underline hover:text-charcoal/80"
          >
            Masuk Takmir
          </Link>
        </nav>

        {/* Ticker pengumuman */}
        {m.pengumuman && (
          <div className="mt-4 overflow-hidden rounded-lg border border-brass/30 bg-brass/10 py-2">
            <span className="marquee-jalan px-4 text-base font-semibold text-brass">
              📢 {m.pengumuman}
            </span>
          </div>
        )}

        {/* Hero: papan jadwal sholat digital */}
        <section className="mt-6 rounded-2xl bg-charcoal p-6 text-ivory shadow-lg sm:p-8">
          <h1 className="font-serif text-lg font-semibold text-ivory/80">
            Jadwal Sholat
          </h1>
          {!punyaKoordinat ? (
            <p className="mt-3 text-base text-ivory/70">
              Koordinat masjid belum diatur, hubungi admin.
            </p>
          ) : !jadwal ? (
            <p className="mt-3 text-base text-ivory/70">
              Jadwal sholat tidak bisa dimuat saat ini, coba lagi nanti.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
                {[
                  { label: "Subuh", jam: jadwal.subuh },
                  { label: "Dzuhur", jam: jadwal.dzuhur },
                  { label: "Ashar", jam: jadwal.ashar },
                  { label: "Maghrib", jam: jadwal.maghrib },
                  { label: "Isya", jam: jadwal.isya },
                ].map((w) => {
                  const aktif = berikutnya?.label === w.label;
                  return (
                    <div
                      key={w.label}
                      className={`rounded-xl border p-2 text-center sm:p-3 ${
                        aktif
                          ? "sholat-aktif border-brass bg-brass/20"
                          : "border-ivory/10 bg-ivory/5"
                      }`}
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-ivory/60 sm:text-sm">
                        {w.label}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-brass sm:text-2xl">
                        {w.jam}
                      </p>
                    </div>
                  );
                })}
              </div>
              {berikutnya && (
                <p className="mt-4 text-center text-base font-semibold text-brass">
                  Sholat berikutnya: {berikutnya.label} ({berikutnya.jam})
                  {berikutnya.besok ? " besok" : ""}
                </p>
              )}
            </>
          )}
        </section>

        {/* Statistik ringkas */}
        <section className="mt-6 grid grid-cols-3 divide-x divide-charcoal/15 rounded-2xl border border-charcoal/10 bg-white/60 py-5">
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
            <div key={s.label} className="px-2 text-center sm:px-4">
              <p className="font-mono text-xl font-bold tabular-nums text-brass sm:text-2xl">
                {s.nilai}
              </p>
              <p className="mt-1 text-xs leading-tight text-charcoal/60 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* Profil + pull-quote sambutan takmir */}
        <section
          className={`mt-6 grid gap-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6 ${
            m.sambutanTakmir ? "sm:grid-cols-2" : ""
          }`}
        >
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              {m.nama}
            </h2>
            {m.alamat && (
              <p className="mt-1 text-base text-charcoal/70">{m.alamat}</p>
            )}
            {m.deskripsi && (
              <p className="mt-3 text-base leading-relaxed text-charcoal/80">
                {m.deskripsi}
              </p>
            )}
          </div>
          {m.sambutanTakmir && (
            <blockquote className="border-l-4 border-brass pl-4">
              <p className="font-serif text-lg italic leading-relaxed text-charcoal/85">
                &ldquo;{m.sambutanTakmir}&rdquo;
              </p>
              <footer className="mt-2 text-sm text-charcoal/60">
                — Ketua Takmir
              </footer>
            </blockquote>
          )}
        </section>

        {/* Agenda Mendatang */}
        <section className="mt-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Agenda Mendatang
          </h2>
          {agenda.length === 0 ? (
            <p className="mt-2 text-base text-charcoal/60">
              Belum ada agenda mendatang.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {agenda.map((a) => (
                <li
                  key={a.id}
                  className="border-b border-charcoal/10 pb-3 last:border-0"
                >
                  <p className="text-base font-bold text-charcoal">{a.judul}</p>
                  <p className="text-sm text-charcoal/60">
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
          <section className="mt-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              Galeri Kegiatan
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
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
          <section className="mt-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              Struktur Pengurus
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {pengurus.map((p) => (
                <li key={p.id}>
                  <p className="text-base font-bold text-charcoal">{p.nama}</p>
                  <p className="text-sm text-charcoal/60">{p.jabatan}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Pertanyaan Umum
          </h2>
          <div className="mt-2">
            <FaqAccordion />
          </div>
        </section>

        {/* Formulir daftar info kegiatan */}
        <section className="mt-6 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
          <h2 className="font-serif text-xl font-semibold text-charcoal">
            Daftar Info Kegiatan
          </h2>
          <p className="mt-1 text-base text-charcoal/70">
            Tinggalkan nomor WA untuk menerima info kegiatan masjid.
          </p>
          <div className="mt-3">
            <DaftarInfoForm />
          </div>
        </section>

        {/* Band CTA penutup */}
        <section className="mt-6 rounded-2xl bg-charcoal p-6 text-center sm:p-8">
          <p className="font-serif text-lg text-ivory/90">
            Mari ikut menjaga & memakmurkan masjid ini
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[3.25rem] items-center justify-center rounded-xl border-2 border-ivory/40 px-6 text-lg font-semibold text-ivory hover:bg-ivory/10"
              >
                Hubungi Takmir
              </a>
            )}
            <Link
              href="/laporan"
              className="inline-flex min-h-[3.25rem] items-center justify-center rounded-xl bg-hijau-600 px-6 text-lg font-bold text-white shadow-md hover:bg-hijau-700"
            >
              Lihat Laporan Kas &amp; Transparansi
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
