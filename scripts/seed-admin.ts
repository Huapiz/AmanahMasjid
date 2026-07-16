/**
 * Script CLI untuk mendaftarkan akun masjid + akun takmir pertama secara manual
 * saat onboarding tatap muka (PRD §6.1 / §8). Jalankan dengan:
 *
 *   npm run seed:admin
 *
 * Membutuhkan DATABASE_URL yang valid di file .env.
 */
// WAJIB berupa side-effect import di baris paling atas: import lain di file ini
// ikut di-hoist saat dijalankan sebagai ESM, sehingga `config()` biasa baru
// jalan SETELAH ../src/db membaca DATABASE_URL.
import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { masjid, akunTakmir } from "../src/db/schema";
import { normalisasiNomorHp } from "../src/lib/phone";
import { pinValid, hashPin } from "../src/lib/auth";

function buatSlug(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const PERAN_VALID = ["bendahara", "panitia_zakat", "panitia_kurban", "admin"];

async function main() {
  const rl = createInterface({ input, output });

  try {
    console.log("\n=== Pendaftaran Masjid Baru (AmanahMasjid) ===\n");

    const namaMasjid = (await rl.question("Nama masjid: ")).trim();
    if (!namaMasjid) throw new Error("Nama masjid wajib diisi.");

    const slugDefault = buatSlug(namaMasjid);
    const slugInput = (
      await rl.question(`Slug URL publik [${slugDefault}]: `)
    ).trim();
    const slug = buatSlug(slugInput || slugDefault);
    if (!slug) throw new Error("Slug tidak valid.");

    const alamat = (await rl.question("Alamat (boleh kosong): ")).trim();

    console.log("\n--- Akun Takmir Pertama ---\n");
    const namaTakmir = (await rl.question("Nama takmir: ")).trim();
    if (!namaTakmir) throw new Error("Nama takmir wajib diisi.");

    const nomorMentah = await rl.question("Nomor HP (mis. 0812xxxx): ");
    const nomorHp = normalisasiNomorHp(nomorMentah);
    if (!nomorHp) throw new Error("Nomor HP tidak valid.");

    const pin1 = await rl.question("PIN (6 angka): ");
    if (!pinValid(pin1)) throw new Error("PIN harus 6 angka.");
    const pin2 = await rl.question("Ulangi PIN: ");
    if (pin1 !== pin2) throw new Error("PIN tidak sama.");

    const peranInput =
      (await rl.question("Peran [admin]: ")).trim() || "admin";
    if (!PERAN_VALID.includes(peranInput)) {
      throw new Error(`Peran harus salah satu: ${PERAN_VALID.join(", ")}`);
    }

    // Cek duplikat
    const slugAda = await db
      .select({ id: masjid.id })
      .from(masjid)
      .where(eq(masjid.slug, slug))
      .limit(1);
    if (slugAda.length) throw new Error(`Slug "${slug}" sudah dipakai.`);

    const nomorAda = await db
      .select({ id: akunTakmir.id })
      .from(akunTakmir)
      .where(eq(akunTakmir.nomorHp, nomorHp))
      .limit(1);
    if (nomorAda.length)
      throw new Error(`Nomor HP ${nomorHp} sudah terdaftar.`);

    const pinHash = await hashPin(pin1);

    const [m] = await db
      .insert(masjid)
      .values({ nama: namaMasjid, slug, alamat: alamat || null })
      .returning({ id: masjid.id });

    await db.insert(akunTakmir).values({
      masjidId: m.id,
      nomorHp,
      pinHash,
      nama: namaTakmir,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      peran: peranInput as any,
    });

    console.log("\n✅ Berhasil dibuat!");
    console.log(`   Masjid : ${namaMasjid}`);
    console.log(`   Takmir : ${namaTakmir} (${nomorHp}) - ${peranInput}`);
    console.log(`   Laporan publik: /m/${slug}\n`);
  } finally {
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Gagal:", err.message ?? err);
    process.exit(1);
  });
