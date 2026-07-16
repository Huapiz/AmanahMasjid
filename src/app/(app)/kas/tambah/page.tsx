import Link from "next/link";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui";
import { tambahTransaksi } from "../actions";
import TransaksiForm from "../TransaksiForm";

export const metadata = { title: "Catat Transaksi - AmanahMasjid" };

export default async function TambahTransaksi() {
  await requireSession();

  return (
    <div className="space-y-4">
      <Link href="/kas" className="text-lg text-hijau-700 underline">
        ← Kembali ke Riwayat
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Catat Transaksi Baru</h1>
      <Card>
        <TransaksiForm action={tambahTransaksi} labelTombol="Simpan" />
      </Card>
    </div>
  );
}
