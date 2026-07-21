"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agendaKegiatan } from "@/db/schema";
import { requireSession } from "@/lib/session";

export type AgendaState = { error?: string };

export async function tambahAgenda(
  _prev: AgendaState,
  formData: FormData
): Promise<AgendaState> {
  const session = await requireSession();

  const judul = String(formData.get("judul") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const tanggalMulai = String(formData.get("tanggalMulai") ?? "");

  if (!judul) return { error: "Judul agenda wajib diisi." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai)) {
    return { error: "Tanggal wajib diisi." };
  }

  await db.insert(agendaKegiatan).values({
    masjidId: session.masjidId,
    judul,
    deskripsi: deskripsi || null,
    tanggalMulai,
    dibuatOleh: session.takmirId,
  });

  revalidatePath("/agenda");
  revalidatePath("/");
  return {};
}

export async function hapusAgenda(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(agendaKegiatan)
    .where(
      and(
        eq(agendaKegiatan.id, id),
        eq(agendaKegiatan.masjidId, session.masjidId)
      )
    );

  revalidatePath("/agenda");
  revalidatePath("/");
}
