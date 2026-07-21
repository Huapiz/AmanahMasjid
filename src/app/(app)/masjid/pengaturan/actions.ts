"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masjid } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export type ProfilState = { error?: string; sukses?: boolean };

export async function simpanProfil(
  _prev: ProfilState,
  formData: FormData
): Promise<ProfilState> {
  const session = await requireAdmin();

  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  const pengumuman = String(formData.get("pengumuman") ?? "").trim();
  const sambutanTakmir = String(formData.get("sambutanTakmir") ?? "").trim();
  const nomorWaKontakRaw = String(formData.get("nomorWaKontak") ?? "").trim();
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();

  if (nomorWaKontakRaw && !/^[\d+]+$/.test(nomorWaKontakRaw)) {
    return { error: "Nomor WA hanya boleh berisi angka dan tanda +." };
  }

  const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null;
  const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null;
  if (latitudeRaw && Number.isNaN(latitude)) {
    return { error: "Latitude harus berupa angka." };
  }
  if (longitudeRaw && Number.isNaN(longitude)) {
    return { error: "Longitude harus berupa angka." };
  }

  await db
    .update(masjid)
    .set({
      deskripsi: deskripsi || null,
      pengumuman: pengumuman || null,
      sambutanTakmir: sambutanTakmir || null,
      nomorWaKontak: nomorWaKontakRaw || null,
      latitude,
      longitude,
    })
    .where(eq(masjid.id, session.masjidId));

  revalidatePath("/masjid/pengaturan");
  revalidatePath("/");
  return { sukses: true };
}
