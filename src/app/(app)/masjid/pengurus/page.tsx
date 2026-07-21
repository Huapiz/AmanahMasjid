import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { strukturPengurus } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui";
import { hapusPengurus } from "./actions";
import PengurusForm from "./PengurusForm";

export const metadata = { title: "Struktur Pengurus - AmanahMasjid" };

export default async function PengurusHalaman() {
  const session = await requireAdmin();

  const daftar = await db
    .select()
    .from(strukturPengurus)
    .where(eq(strukturPengurus.masjidId, session.masjidId))
    .orderBy(asc(strukturPengurus.urutan));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/masjid/pengaturan"
          className="text-lg text-hijau-700 underline"
        >
          ← Kembali ke Pengaturan
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Struktur Pengurus
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Daftar ini tampil publik di halaman depan masjid. Urutan lebih
          kecil tampil lebih dulu.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-xl font-bold text-gray-900">
          Tambah Pengurus
        </h2>
        <PengurusForm />
      </Card>

      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">Belum ada data pengurus.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {daftar.map((p) => (
            <li key={p.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{p.nama}</p>
                    <p className="text-base text-gray-600">{p.jabatan}</p>
                  </div>
                  <form action={hapusPengurus}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="min-h-[2.75rem] rounded-lg border-2 border-red-400 px-4 text-base font-semibold text-red-700 hover:bg-red-50"
                    >
                      Hapus
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
