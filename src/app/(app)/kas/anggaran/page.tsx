import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { anggaranKategori } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { kategoriKasOpsi, labelKelompokDana } from "@/lib/labels";
import { Card, Badge } from "@/components/ui";
import { kategoriWarnaKelas } from "@/lib/kategoriWarna";
import { simpanAnggaran } from "./actions";

export const metadata = { title: "Anggaran Kategori - AmanahMasjid" };

export default async function AnggaranHalaman() {
  const session = await requireAdmin();

  const daftar = await db
    .select()
    .from(anggaranKategori)
    .where(eq(anggaranKategori.masjidId, session.masjidId));

  const targetPerKategori = new Map(
    daftar.map((a) => [a.kategori as string, a.targetNominal])
  );

  return (
    <div className="space-y-5">
      <div>
        <Link href="/beranda" className="text-lg text-hijau-700 underline">
          ← Kembali ke Beranda
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Anggaran per Kategori
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Target pengeluaran bulanan per kategori. Kosongkan atau isi 0 untuk
          menghapus target. Progres realisasinya tampil di Beranda.
        </p>
      </div>

      <ul className="space-y-3">
        {kategoriKasOpsi.map((o) => (
          <li key={o.nilai}>
            <Card>
              <form
                action={simpanAnggaran}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <input type="hidden" name="kategori" value={o.nilai} />
                <div>
                  <Badge className={kategoriWarnaKelas[o.nilai]}>
                    {o.label}
                  </Badge>
                  <p className="mt-1 text-sm text-gray-500">
                    {labelKelompokDana[o.kelompok]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="targetNominal"
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 1000000"
                    defaultValue={
                      targetPerKategori.has(o.nilai)
                        ? String(targetPerKategori.get(o.nilai))
                        : ""
                    }
                    className="w-40 min-h-[2.75rem] rounded-xl border-2 border-gray-300 px-3 text-lg"
                  />
                  <button
                    type="submit"
                    className="min-h-[2.75rem] rounded-lg bg-hijau-600 px-4 text-base font-semibold text-white hover:bg-hijau-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
