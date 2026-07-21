import { requireSession } from "@/lib/session";
import { daftarTransaksiDenganSaldo } from "@/lib/queries";
import { labelKategori, labelTipe, labelKelompokDana } from "@/lib/labels";

const LABEL_STATUS: Record<string, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

// Escape field CSV: bungkus dengan "..." kalau mengandung koma/petik/baris
// baru, gandakan petik di dalamnya.
function csvField(nilai: string | number): string {
  const s = String(nilai);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);

  const rows = await daftarTransaksiDenganSaldo(session.masjidId, {
    bulan: searchParams.get("bulan") ?? undefined,
    dari: searchParams.get("dari") ?? undefined,
    sampai: searchParams.get("sampai") ?? undefined,
    kategori: searchParams.get("kategori") ?? undefined,
    kelompok:
      searchParams.get("kelompok") === "umum" ||
      searchParams.get("kelompok") === "terikat"
        ? (searchParams.get("kelompok") as "umum" | "terikat")
        : undefined,
    cari: searchParams.get("cari") ?? undefined,
  });

  const header = [
    "Tanggal",
    "Jenis",
    "Kategori",
    "Kelompok Dana",
    "Nominal",
    "Keterangan",
    "Status",
    "Saldo Berjalan",
  ];

  const baris = rows.map((t) =>
    [
      t.tanggal,
      labelTipe[t.tipe] ?? t.tipe,
      labelKategori[t.kategori] ?? t.kategori,
      labelKelompokDana[t.kelompokDana] ?? t.kelompokDana,
      t.nominal,
      t.keterangan ?? "",
      LABEL_STATUS[t.status] ?? t.status,
      t.saldoBerjalan,
    ]
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
      "Content-Disposition": `attachment; filename="kas-${session.masjidSlug}-${tanggalSekarang}.csv"`,
    },
  });
}
