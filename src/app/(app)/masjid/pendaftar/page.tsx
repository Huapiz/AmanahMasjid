import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pendaftarInfo } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { formatTanggal } from "@/lib/labels";
import { Card, TautanTombol } from "@/components/ui";

export const metadata = { title: "Pendaftar Info Kegiatan - AmanahMasjid" };

export default async function PendaftarHalaman() {
  const session = await requireAdmin();

  const daftar = await db
    .select()
    .from(pendaftarInfo)
    .where(eq(pendaftarInfo.masjidId, session.masjidId))
    .orderBy(desc(pendaftarInfo.createdAt));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/masjid/pengaturan"
            className="text-lg text-hijau-700 underline"
          >
            ← Kembali ke Pengaturan
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Pendaftar Info Kegiatan
          </h1>
          <p className="mt-1 text-base text-gray-600">
            Nomor WA yang mendaftar lewat formulir di halaman depan publik.
          </p>
        </div>
        <TautanTombol href="/masjid/pendaftar/export">
          Export CSV
        </TautanTombol>
      </div>

      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">Belum ada pendaftar.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {daftar.map((p) => (
            <li key={p.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-bold text-gray-900">
                    {p.nomorWa}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTanggal(p.createdAt.toISOString().slice(0, 10))}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
