"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { strukturPengurus } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export type PengurusState = { error?: string };

export async function tambahPengurus(
  _prev: PengurusState,
  formData: FormData
): Promise<PengurusState> {
  const session = await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const jabatan = String(formData.get("jabatan") ?? "").trim();
  const urutan = parseInt(String(formData.get("urutan") ?? "0"), 10) || 0;

  if (!nama) return { error: "Nama wajib diisi." };
  if (!jabatan) return { error: "Jabatan wajib diisi." };

  await db.insert(strukturPengurus).values({
    masjidId: session.masjidId,
    nama,
    jabatan,
    urutan,
  });

  revalidatePath("/masjid/pengurus");
  revalidatePath("/");
  return {};
}

export async function hapusPengurus(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(strukturPengurus)
    .where(
      and(
        eq(strukturPengurus.id, id),
        eq(strukturPengurus.masjidId, session.masjidId)
      )
    );

  revalidatePath("/masjid/pengurus");
  revalidatePath("/");
}
