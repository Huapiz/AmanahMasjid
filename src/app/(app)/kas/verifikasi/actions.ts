"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

async function ubahStatus(id: string, status: "disetujui" | "ditolak") {
  // Proteksi di server, bukan cuma disembunyikan di UI.
  const session = await requireAdmin();
  if (!id) return;

  await db
    .update(transaksiKas)
    .set({
      status,
      diverifikasiOleh: session.takmirId,
      diverifikasiPada: new Date(),
    })
    .where(
      and(eq(transaksiKas.id, id), eq(transaksiKas.masjidId, session.masjidId))
    );

  revalidatePath("/kas/verifikasi");
  revalidatePath("/kas");
  revalidatePath("/beranda");
  redirect(`/kas/verifikasi?status=${status}`);
}

export async function setujuiTransaksi(formData: FormData) {
  await ubahStatus(String(formData.get("id") ?? ""), "disetujui");
}

export async function tolakTransaksi(formData: FormData) {
  await ubahStatus(String(formData.get("id") ?? ""), "ditolak");
}
