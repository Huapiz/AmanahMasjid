"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { akunTakmir, masjid } from "@/db/schema";
import { normalisasiNomorHp } from "@/lib/phone";
import { pinValid, verifyPin } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { cekRateLimit, catatGagal, resetRateLimit } from "@/lib/ratelimit";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const nomorMentah = String(formData.get("nomorHp") ?? "");
  const pin = String(formData.get("pin") ?? "");

  const nomorHp = normalisasiNomorHp(nomorMentah);
  if (!nomorHp) {
    return { error: "Nomor HP tidak valid. Contoh: 0812xxxxxxx" };
  }
  if (!pinValid(pin)) {
    return { error: "PIN harus 6 angka." };
  }

  // Batasi percobaan login per nomor (mencegah tebak PIN).
  const rl = cekRateLimit(nomorHp);
  if (!rl.boleh) {
    const menit = Math.ceil(rl.detikTunggu / 60);
    return {
      error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`,
    };
  }

  const rows = await db
    .select({
      id: akunTakmir.id,
      pinHash: akunTakmir.pinHash,
      nama: akunTakmir.nama,
      peran: akunTakmir.peran,
      masjidId: akunTakmir.masjidId,
      masjidSlug: masjid.slug,
    })
    .from(akunTakmir)
    .innerJoin(masjid, eq(akunTakmir.masjidId, masjid.id))
    .where(eq(akunTakmir.nomorHp, nomorHp))
    .limit(1);

  const akun = rows[0];

  // Pesan sama untuk "nomor tidak ada" & "PIN salah" agar tidak membocorkan
  // nomor mana yang terdaftar.
  const gagal = (): LoginState => {
    catatGagal(nomorHp);
    return { error: "Nomor HP atau PIN salah." };
  };

  if (!akun) return gagal();

  const cocok = await verifyPin(pin, akun.pinHash);
  if (!cocok) return gagal();

  resetRateLimit(nomorHp);

  const session = await getSession();
  session.takmirId = akun.id;
  session.masjidId = akun.masjidId;
  session.masjidSlug = akun.masjidSlug;
  session.nama = akun.nama;
  session.peran = akun.peran;
  await session.save();

  redirect("/beranda");
}
