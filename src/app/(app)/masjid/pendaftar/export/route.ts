import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pendaftarInfo } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

// Escape field CSV: bungkus dengan "..." kalau mengandung koma/petik/baris
// baru, gandakan petik di dalamnya. Sama pola dengan kas/export/route.ts.
function csvField(nilai: string): string {
  if (/[",\n\r]/.test(nilai)) {
    return `"${nilai.replace(/"/g, '""')}"`;
  }
  return nilai;
}

export async function GET() {
  const session = await requireAdmin();

  const daftar = await db
    .select()
    .from(pendaftarInfo)
    .where(eq(pendaftarInfo.masjidId, session.masjidId))
    .orderBy(desc(pendaftarInfo.createdAt));

  const header = ["Nomor WA", "Tanggal Daftar"];
  const baris = daftar.map((p) =>
    [p.nomorWa, p.createdAt.toISOString().slice(0, 10)]
      .map(csvField)
      .join(",")
  );

  // BOM supaya Excel Windows membaca huruf non-ASCII dengan benar.
  const csv =
    "\uFEFF" + [header.map(csvField).join(","), ...baris].join("\r\n");

  const tanggalSekarang = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pendaftar-info-${tanggalSekarang}.csv"`,
    },
  });
}
