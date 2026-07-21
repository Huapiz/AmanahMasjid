"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { parseRupiah } from "@/lib/rupiah";
import { kategoriKasOpsi, kelompokKategori } from "@/lib/labels";

export type TransaksiState = { error?: string };

const KATEGORI_VALID = new Set<string>(kategoriKasOpsi.map((o) => o.nilai));

// Baca & validasi field bersama untuk tambah/ubah.
function bacaForm(formData: FormData): TransaksiState & {
  data?: {
    tanggal: string;
    tipe: "masuk" | "keluar";
    kategori: string;
    kelompokDana: "umum" | "terikat";
    nominal: number;
    keterangan: string | null;
    buktiFoto: string | null;
  };
} {
  const tanggal = String(formData.get("tanggal") ?? "");
  const tipe = String(formData.get("tipe") ?? "");
  const kategori = String(formData.get("kategori") ?? "");
  const nominal = parseRupiah(String(formData.get("nominal") ?? ""));
  const keteranganRaw = String(formData.get("keterangan") ?? "").trim();
  const buktiFotoRaw = String(formData.get("buktiFoto") ?? "");
  // Simpan hanya kalau berupa data URL gambar; selain itu abaikan.
  const buktiFoto = buktiFotoRaw.startsWith("data:image/") ? buktiFotoRaw : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return { error: "Tanggal wajib diisi." };
  }
  if (tipe !== "masuk" && tipe !== "keluar") {
    return { error: "Pilih jenis: Uang Masuk atau Uang Keluar." };
  }
  if (!KATEGORI_VALID.has(kategori)) {
    return { error: "Kategori tidak valid." };
  }
  if (!nominal || nominal <= 0) {
    return { error: "Nominal harus lebih dari 0." };
  }

  return {
    data: {
      tanggal,
      tipe,
      kategori,
      kelompokDana: kelompokKategori[kategori],
      nominal,
      keterangan: keteranganRaw || null,
      buktiFoto,
    },
  };
}

export async function tambahTransaksi(
  _prev: TransaksiState,
  formData: FormData
): Promise<TransaksiState> {
  const session = await requireSession();
  const hasil = bacaForm(formData);
  if (hasil.error || !hasil.data) return { error: hasil.error };

  await db.insert(transaksiKas).values({
    masjidId: session.masjidId,
    tanggal: hasil.data.tanggal,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tipe: hasil.data.tipe as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kategori: hasil.data.kategori as any,
    kelompokDana: hasil.data.kelompokDana,
    nominal: hasil.data.nominal,
    keterangan: hasil.data.keterangan,
    buktiFoto: hasil.data.buktiFoto,
    // Transaksi baru selalu menunggu verifikasi admin (eksplisit, bukan
    // mengandalkan default kolom yang sengaja "disetujui" untuk data lama).
    status: "menunggu",
    dibuatOleh: session.takmirId,
  });

  revalidatePath("/kas");
  revalidatePath("/beranda");
  redirect("/kas?status=tersimpan");
}

export async function ubahTransaksi(
  id: string,
  _prev: TransaksiState,
  formData: FormData
): Promise<TransaksiState> {
  const session = await requireSession();
  const hasil = bacaForm(formData);
  if (hasil.error || !hasil.data) return { error: hasil.error };

  await db
    .update(transaksiKas)
    .set({
      tanggal: hasil.data.tanggal,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tipe: hasil.data.tipe as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      kategori: hasil.data.kategori as any,
      kelompokDana: hasil.data.kelompokDana,
      nominal: hasil.data.nominal,
      keterangan: hasil.data.keterangan,
      buktiFoto: hasil.data.buktiFoto,
      // Edit oleh non-admin butuh verifikasi ulang; admin dianggap otoritas
      // final sehingga statusnya dibiarkan apa adanya.
      ...(session.peran !== "admin" ? { status: "menunggu" as const } : {}),
      // Catat siapa & kapan mengubah (audit, PRD §10).
      diubahOleh: session.takmirId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(transaksiKas.id, id),
        eq(transaksiKas.masjidId, session.masjidId)
      )
    );

  revalidatePath("/kas");
  revalidatePath("/beranda");
  redirect("/kas?status=tersimpan");
}

export async function hapusTransaksi(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db
    .delete(transaksiKas)
    .where(
      and(
        eq(transaksiKas.id, id),
        eq(transaksiKas.masjidId, session.masjidId)
      )
    );

  revalidatePath("/kas");
  revalidatePath("/beranda");
  redirect("/kas?status=dihapus");
}
