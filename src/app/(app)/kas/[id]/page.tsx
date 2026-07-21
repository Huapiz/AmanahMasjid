import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui";
import { ubahTransaksi, hapusTransaksi } from "../actions";
import TransaksiForm from "../TransaksiForm";

export const metadata = { title: "Ubah Transaksi - AmanahMasjid" };

export default async function UbahHalaman({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [t] = await db
    .select()
    .from(transaksiKas)
    .where(
      and(eq(transaksiKas.id, id), eq(transaksiKas.masjidId, session.masjidId))
    )
    .limit(1);

  if (!t) notFound();

  const aksiUbah = ubahTransaksi.bind(null, t.id);

  return (
    <div className="space-y-4">
      <Link href="/kas" className="text-lg text-hijau-700 underline">
        ← Kembali ke Riwayat
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Ubah Transaksi</h1>

      <Card>
        <TransaksiForm
          action={aksiUbah}
          labelTombol="Simpan Perubahan"
          awal={{
            tanggal: t.tanggal,
            tipe: t.tipe,
            kategori: t.kategori,
            nominal: t.nominal,
            keterangan: t.keterangan ?? "",
            buktiFoto: t.buktiFoto ?? undefined,
          }}
        />
      </Card>

      <Card className="border-red-200">
        <h2 className="text-xl font-bold text-red-800">Hapus Transaksi</h2>
        <p className="mt-1 text-base text-gray-600">
          Transaksi yang dihapus tidak bisa dikembalikan.
        </p>
        <form action={hapusTransaksi} className="mt-3">
          <input type="hidden" name="id" value={t.id} />
          <button
            type="submit"
            className="min-h-[3.25rem] rounded-xl border-2 border-red-500 px-6 text-lg font-semibold text-red-700 hover:bg-red-50"
          >
            Hapus Transaksi Ini
          </button>
        </form>
      </Card>
    </div>
  );
}
