"use server";

import { db } from "@/db";
import { pendaftarInfo } from "@/db/schema";
import { ambilMasjidTunggal } from "@/lib/queries";

export type DaftarInfoState = { error?: string; sukses?: boolean };

// Formulir publik di halaman depan — sengaja TIDAK butuh session/login,
// pengunjung mana saja boleh daftar.
export async function daftarInfo(
  _prev: DaftarInfoState,
  formData: FormData
): Promise<DaftarInfoState> {
  const nomorRaw = String(formData.get("nomorWa") ?? "").trim();

  if (!/^[\d+]+$/.test(nomorRaw)) {
    return { error: "Nomor WA hanya boleh berisi angka dan tanda +." };
  }
  const digitSaja = nomorRaw.replace(/[^\d]/g, "");
  if (digitSaja.length < 9) {
    return { error: "Nomor WA terlalu pendek, cek kembali nomornya." };
  }

  const m = await ambilMasjidTunggal();
  if (!m) {
    return { error: "Masjid belum terdaftar di sistem." };
  }

  await db.insert(pendaftarInfo).values({
    masjidId: m.id,
    nomorWa: nomorRaw,
  });

  return { sukses: true };
}
