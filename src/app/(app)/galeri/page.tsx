import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galeriFoto } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { Card } from "@/components/ui";
import FotoLightbox from "@/components/FotoLightbox";
import { hapusFoto } from "./actions";
import UploadForm from "./UploadForm";

export const metadata = { title: "Galeri Foto - AmanahMasjid" };

export default async function GaleriHalaman() {
  const session = await requireSession();

  const daftar = await db
    .select()
    .from(galeriFoto)
    .where(eq(galeriFoto.masjidId, session.masjidId))
    .orderBy(desc(galeriFoto.createdAt));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Galeri Foto Kegiatan</h1>
        <p className="mt-1 text-base text-gray-600">
          8 foto terbaru tampil otomatis di halaman depan publik.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Unggah Foto</h2>
        <UploadForm />
      </Card>

      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">Belum ada foto.</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {daftar.map((f) => (
            <li key={f.id}>
              <Card className="space-y-2 text-center">
                <FotoLightbox src={f.foto} alt={f.keterangan ?? "Foto kegiatan"} ukuran={120} />
                {f.keterangan && (
                  <p className="text-sm text-gray-600">{f.keterangan}</p>
                )}
                {(f.diunggahOleh === session.takmirId ||
                  session.peran === "admin") && (
                  <form action={hapusFoto}>
                    <input type="hidden" name="id" value={f.id} />
                    <button
                      type="submit"
                      className="min-h-[2.5rem] w-full rounded-lg border-2 border-red-400 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </form>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
