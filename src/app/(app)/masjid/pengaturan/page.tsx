import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masjid } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui";
import ProfilForm from "./ProfilForm";

export const metadata = { title: "Pengaturan Masjid - AmanahMasjid" };

export default async function PengaturanHalaman() {
  const session = await requireAdmin();

  const [m] = await db
    .select()
    .from(masjid)
    .where(eq(masjid.id, session.masjidId))
    .limit(1);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/beranda" className="text-lg text-hijau-700 underline">
          ← Kembali ke Beranda
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Pengaturan Profil Masjid
        </h1>
        <p className="mt-1 text-base text-gray-600">
          Data ini tampil di halaman depan publik (<span>/</span>).
        </p>
        <Link
          href="/masjid/pengurus"
          className="mt-2 inline-block text-base font-semibold text-hijau-700 underline"
        >
          Kelola Struktur Pengurus →
        </Link>
        <Link
          href="/masjid/pendaftar"
          className="mt-2 block text-base font-semibold text-hijau-700 underline"
        >
          Lihat Pendaftar Info Kegiatan →
        </Link>
      </div>

      <Card>
        <ProfilForm
          awal={{
            deskripsi: m?.deskripsi ?? "",
            pengumuman: m?.pengumuman ?? "",
            sambutanTakmir: m?.sambutanTakmir ?? "",
            nomorWaKontak: m?.nomorWaKontak ?? "",
            latitude: m?.latitude ?? undefined,
            longitude: m?.longitude ?? undefined,
          }}
        />
      </Card>
    </div>
  );
}
