import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { jumlahMenunggu } from "@/lib/queries";
import { logout } from "./actions";
import Toast from "@/components/Toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  // Badge jumlah menunggu hanya perlu untuk admin — jangan bebani peran lain
  // dengan query ekstra tiap render.
  const menunggu =
    session.peran === "admin" ? await jumlahMenunggu(session.masjidId) : null;

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <Toast />
      </Suspense>
      <header className="border-b border-hijau-100 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/beranda"
            className="flex items-center gap-2 text-2xl font-bold text-hijau-700"
          >
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
            AmanahMasjid
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-base text-gray-600 sm:inline">
              {session.nama}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="min-h-[2.75rem] rounded-lg border-2 border-gray-300 px-4 text-base font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-3xl px-4 pb-3">
          <div className="flex gap-2 text-base font-semibold">
            <Link
              href="/beranda"
              className="rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
            >
              Beranda
            </Link>
            <Link
              href="/kas"
              className="rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
            >
              Kas &amp; Infaq
            </Link>
            <Link
              href="/agenda"
              className="rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
            >
              Agenda
            </Link>
            <Link
              href="/galeri"
              className="rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
            >
              Galeri
            </Link>
            {session.peran === "admin" && (
              <Link
                href="/masjid/pengaturan"
                className="rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
              >
                Pengaturan
              </Link>
            )}
            {menunggu && (
              <Link
                href="/kas/verifikasi"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-hijau-700 hover:bg-hijau-50"
              >
                Verifikasi
                {menunggu.jumlah > 0 && (
                  <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-sm font-bold text-white">
                    {menunggu.jumlah}
                  </span>
                )}
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
