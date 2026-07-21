import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { presetTransaksi } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui";
import { tambahTransaksi } from "../actions";
import TransaksiForm from "../TransaksiForm";

export const metadata = { title: "Catat Transaksi - AmanahMasjid" };

export default async function TambahTransaksi({
  searchParams,
}: {
  searchParams: Promise<{
    tipe?: string;
    kategori?: string;
    keterangan?: string;
  }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;

  const daftarPreset = await db
    .select()
    .from(presetTransaksi)
    .where(eq(presetTransaksi.masjidId, session.masjidId))
    .orderBy(asc(presetTransaksi.createdAt));

  return (
    <div className="space-y-4">
      <Link href="/kas" className="text-lg text-hijau-700 underline">
        ← Kembali ke Riwayat
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Catat Transaksi Baru</h1>

      {/* Tombol pintas: klik = buka halaman ini lagi dengan prefill via URL */}
      <div className="flex flex-wrap items-center gap-2">
        {daftarPreset.map((p) => (
          <Link
            key={p.id}
            href={`/kas/tambah?${new URLSearchParams({
              tipe: p.tipe,
              kategori: p.kategori,
              keterangan: p.keteranganDefault ?? "",
            }).toString()}`}
            className="rounded-full border-2 border-hijau-600 bg-white px-4 py-2 text-base font-semibold text-hijau-700 hover:bg-hijau-50"
          >
            {p.label}
          </Link>
        ))}
        <Link
          href="/kas/preset"
          className="rounded-full border-2 border-dashed border-gray-400 px-4 py-2 text-base font-semibold text-gray-600 hover:bg-gray-50"
        >
          {daftarPreset.length === 0 ? "+ Buat Tombol Pintas" : "Kelola Preset"}
        </Link>
      </div>

      <Card>
        <TransaksiForm
          key={`${sp.tipe ?? ""}-${sp.kategori ?? ""}-${sp.keterangan ?? ""}`}
          action={tambahTransaksi}
          labelTombol="Simpan"
          awal={{
            tipe: sp.tipe,
            kategori: sp.kategori,
            keterangan: sp.keterangan,
          }}
        />
      </Card>
    </div>
  );
}
