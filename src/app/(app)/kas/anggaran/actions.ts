"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { anggaranKategori } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { parseRupiah } from "@/lib/rupiah";
import { kategoriKasOpsi } from "@/lib/labels";

const KATEGORI_VALID = new Set<string>(kategoriKasOpsi.map((o) => o.nilai));

export async function simpanAnggaran(formData: FormData) {
  const session = await requireAdmin();

  const kategori = String(formData.get("kategori") ?? "");
  if (!KATEGORI_VALID.has(kategori)) return;

  const target = parseRupiah(String(formData.get("targetNominal") ?? ""));

  if (target <= 0) {
    // Target 0/kosong berarti hapus target kategori ini.
    await db
      .delete(anggaranKategori)
      .where(
        and(
          eq(anggaranKategori.masjidId, session.masjidId),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eq(anggaranKategori.kategori, kategori as any)
        )
      );
  } else {
    await db
      .insert(anggaranKategori)
      .values({
        masjidId: session.masjidId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kategori: kategori as any,
        targetNominal: target,
      })
      .onConflictDoUpdate({
        target: [anggaranKategori.masjidId, anggaranKategori.kategori],
        set: { targetNominal: target, updatedAt: new Date() },
      });
  }

  revalidatePath("/kas/anggaran");
  revalidatePath("/beranda");
}
