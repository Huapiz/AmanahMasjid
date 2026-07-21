"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { galeriFoto } from "@/db/schema";
import { requireSession } from "@/lib/session";

export type GaleriState = { error?: string };

export async function unggahFoto(
  _prev: GaleriState,
  formData: FormData
): Promise<GaleriState> {
  const session = await requireSession();

  const foto = String(formData.get("foto") ?? "");
  const keterangan = String(formData.get("keterangan") ?? "").trim();

  if (!foto.startsWith("data:image/")) {
    return { error: "Pilih foto terlebih dahulu." };
  }

  await db.insert(galeriFoto).values({
    masjidId: session.masjidId,
    foto,
    keterangan: keterangan || null,
    diunggahOleh: session.takmirId,
  });

  revalidatePath("/galeri");
  revalidatePath("/");
  return {};
}

export async function hapusFoto(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const [foto] = await db
    .select({ diunggahOleh: galeriFoto.diunggahOleh })
    .from(galeriFoto)
    .where(and(eq(galeriFoto.id, id), eq(galeriFoto.masjidId, session.masjidId)))
    .limit(1);

  if (!foto) return;
  // Hanya pengunggah sendiri atau admin yang boleh hapus.
  if (foto.diunggahOleh !== session.takmirId && session.peran !== "admin") {
    return;
  }

  await db
    .delete(galeriFoto)
    .where(
      and(eq(galeriFoto.id, id), eq(galeriFoto.masjidId, session.masjidId))
    );

  revalidatePath("/galeri");
  revalidatePath("/");
}
