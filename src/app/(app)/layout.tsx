import Link from "next/link";
import { requireSession } from "@/lib/session";
import { logout } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="min-h-screen">
      <header className="border-b border-hijau-100 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/beranda" className="text-2xl font-bold text-hijau-700">
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
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
