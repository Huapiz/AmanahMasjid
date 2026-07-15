import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Catatan: koneksi tidak benar-benar terbuka sampai ada query yang dijalankan.
// Kita pakai placeholder saat DATABASE_URL belum diset agar proses `next build`
// (yang hanya meng-import modul, tidak menjalankan query) tidak gagal. Saat
// runtime, DATABASE_URL yang valid wajib tersedia (di .env lokal / Vercel).
const url =
  process.env.DATABASE_URL ?? "postgresql://build:build@localhost/build";

const sql = neon(url);

export const db = drizzle(sql, { schema });
export { schema };
