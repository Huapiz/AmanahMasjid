"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { presetTransaksi } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { kategoriKasOpsi } from "@/lib/labels";

const KATEGORI_VALID = new Set<string>(kategoriKasOpsi.map((o) => o.nilai));

export type PresetState = { error?: string };

export async function tambahPreset(
  _prev: PresetState,
  formData: FormData
): Promise<PresetState> {
  const session = await requireSession();

  const label = String(formData.get("label") ?? "").trim();
  const tipe = String(formData.get("tipe") ?? "");
  const kategori = String(formData.get("kategori") ?? "");
  const keterangan = String(formData.get("keterangan") ?? "").trim();

  if (!label) return { error: "Nama tombol wajib diisi." };
  if (tipe !== "masuk" && tipe !== "keluar") {
    return { error: "Pilih jenis: Uang Masuk atau Uang Keluar." };
  }
  if (!KATEGORI_VALID.has(kategori)) {
    return { error: "Kategori tidak valid." };
  }

  await db.insert(presetTransaksi).values({
    masjidId: session.masjidId,
    label,
    tipe,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kategori: kategori as any,
    keteranganDefault: keterangan || null,
  });

  revalidatePath("/kas/preset");
  revalidatePath("/kas/tambah");
  return {};
}

export async function hapusPreset(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(presetTransaksi)
    .where(
      and(
        eq(presetTransaksi.id, id),
        eq(presetTransaksi.masjidId, session.masjidId)
      )
    );

  revalidatePath("/kas/preset");
  revalidatePath("/kas/tambah");
}
