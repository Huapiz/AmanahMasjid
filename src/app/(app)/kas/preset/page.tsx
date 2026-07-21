import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { presetTransaksi } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { labelKategori, labelTipe } from "@/lib/labels";
import { kategoriWarnaKelas } from "@/lib/kategoriWarna";
import { Card, Badge } from "@/components/ui";
import { hapusPreset } from "./actions";
import PresetForm from "./PresetForm";

export const metadata = { title: "Preset Transaksi - AmanahMasjid" };

export default async function PresetHalaman() {
  const session = await requireSession();

  const daftar = await db
    .select()
    .from(presetTransaksi)
    .where(eq(presetTransaksi.masjidId, session.masjidId))
    .orderBy(asc(presetTransaksi.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/kas/tambah" className="text-lg text-hijau-700 underline">
          ← Kembali ke Catat Transaksi
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Preset Transaksi
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Tombol pintas untuk transaksi yang sering dicatat. Nominal tetap
          diisi manual tiap kali.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Tambah Preset</h2>
        <PresetForm />
      </Card>

      {daftar.length > 0 && (
        <ul className="space-y-3">
          {daftar.map((p) => (
            <li key={p.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{p.label}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge className={kategoriWarnaKelas[p.kategori]}>
                        {labelKategori[p.kategori]}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {labelTipe[p.tipe]}
                        {p.keteranganDefault ? ` · ${p.keteranganDefault}` : ""}
                      </span>
                    </div>
                  </div>
                  <form action={hapusPreset}>
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
