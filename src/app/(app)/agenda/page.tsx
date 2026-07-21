import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agendaKegiatan } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { formatTanggal } from "@/lib/labels";
import { Card } from "@/components/ui";
import { hapusAgenda } from "./actions";
import AgendaForm from "./AgendaForm";

export const metadata = { title: "Agenda Kegiatan - AmanahMasjid" };

export default async function AgendaHalaman() {
  const session = await requireSession();

  const daftar = await db
    .select()
    .from(agendaKegiatan)
    .where(eq(agendaKegiatan.masjidId, session.masjidId))
    .orderBy(asc(agendaKegiatan.tanggalMulai));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda Kegiatan</h1>
        <p className="mt-1 text-base text-gray-600">
          Agenda mendatang tampil otomatis di halaman depan publik.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Tambah Agenda</h2>
        <AgendaForm />
      </Card>

      {daftar.length === 0 ? (
        <Card>
          <p className="text-lg text-gray-600">Belum ada agenda.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {daftar.map((a) => (
            <li key={a.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{a.judul}</p>
                    <p className="text-base text-gray-600">
                      {formatTanggal(a.tanggalMulai)}
                      {a.deskripsi ? ` · ${a.deskripsi}` : ""}
                    </p>
                  </div>
                  <form action={hapusAgenda}>
                    <input type="hidden" name="id" value={a.id} />
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
