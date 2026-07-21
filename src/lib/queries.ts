import { and, asc, desc, eq, getTableColumns, gte, ilike, lt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  transaksiKas,
  anggaranKategori,
  agendaKegiatan,
  galeriFoto,
  strukturPengurus,
  masjid,
  type TransaksiKas,
} from "@/db/schema";
import { BULAN_SINGKAT, kategoriKasOpsi, labelKategori } from "@/lib/labels";

export type RingkasanKas = {
  masuk: number;
  keluar: number;
  saldo: number;
};

// Aplikasi single-masjid per deployment: satu instalasi = satu masjid.
// Return null kalau tabel masjid masih kosong (fresh install sebelum
// `npm run seed:admin` dijalankan) — jangan throw, biar pemanggil bisa
// render pesan ramah alih-alih crash.
export async function ambilMasjidTunggal() {
  const [m] = await db
    .select()
    .from(masjid)
    .orderBy(asc(masjid.createdAt))
    .limit(1);
  return m ?? null;
}

// Total pemasukan & pengeluaran (opsional dibatasi rentang tanggal).
// Hanya menghitung transaksi yang sudah disetujui — saldo publik & beranda
// tidak boleh mengandung transaksi yang belum diverifikasi admin.
async function agregat(
  masjidId: string,
  dariTanggal?: string,
  sampaiTanggal?: string,
  kelompok?: "umum" | "terikat"
): Promise<RingkasanKas> {
  const kondisi = [
    eq(transaksiKas.masjidId, masjidId),
    eq(transaksiKas.status, "disetujui"),
  ];
  if (dariTanggal) kondisi.push(gte(transaksiKas.tanggal, dariTanggal));
  if (sampaiTanggal) kondisi.push(lte(transaksiKas.tanggal, sampaiTanggal));
  if (kelompok) kondisi.push(eq(transaksiKas.kelompokDana, kelompok));

  const [row] = await db
    .select({
      masuk: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'masuk' then ${transaksiKas.nominal} else 0 end), 0)::int`,
      keluar: sql<number>`coalesce(sum(case when ${transaksiKas.tipe} = 'keluar' then ${transaksiKas.nominal} else 0 end), 0)::int`,
    })
    .from(transaksiKas)
    .where(and(...kondisi));

  const masuk = Number(row?.masuk ?? 0);
  const keluar = Number(row?.keluar ?? 0);
  return { masuk, keluar, saldo: masuk - keluar };
}

export type FilterTransaksi = {
  bulan?: string; // format YYYY-MM, diabaikan kalau dari/sampai diisi
  dari?: string; // format YYYY-MM-DD
  sampai?: string; // format YYYY-MM-DD
  kategori?: string;
  kelompok?: "umum" | "terikat";
  cari?: string;
};

export type TransaksiDenganSaldo = TransaksiKas & { saldoBerjalan: number };

// Daftar transaksi + saldo berjalan (running balance) per baris, seperti
// buku kas fisik. Saldo dihitung dari SELURUH riwayat masjid (urut
// kronologis) di dalam CTE — filter tampilan (bulan/kategori/kelompok/cari)
// HANYA boleh di query luar, kalau masuk ke CTE urutan kumulatifnya rusak.
export async function daftarTransaksiDenganSaldo(
  masjidId: string,
  filter: FilterTransaksi = {}
): Promise<TransaksiDenganSaldo[]> {
  const semua = db.$with("semua_transaksi").as(
    db
      .select({
        ...getTableColumns(transaksiKas),
        // Transaksi ditolak tidak ikut penjumlahan; menunggu tetap dihitung
        // sementara di riwayat internal (saldo publik strict disetujui-only).
        saldoBerjalan: sql<number>`sum(case when ${transaksiKas.status} = 'ditolak' then 0 when ${transaksiKas.tipe} = 'masuk' then ${transaksiKas.nominal} else -${transaksiKas.nominal} end)
          over (order by ${transaksiKas.tanggal}, ${transaksiKas.createdAt} rows between unbounded preceding and current row)`
          .mapWith(Number)
          .as("saldo_berjalan"),
      })
      .from(transaksiKas)
      .where(eq(transaksiKas.masjidId, masjidId))
  );

  const kondisi = [];

  const TGL = /^\d{4}-\d{2}-\d{2}$/;
  const pakaiRentang =
    (filter.dari && TGL.test(filter.dari)) ||
    (filter.sampai && TGL.test(filter.sampai));

  if (pakaiRentang) {
    // Rentang tanggal bebas menang atas filter bulan.
    if (filter.dari && TGL.test(filter.dari))
      kondisi.push(gte(semua.tanggal, filter.dari));
    if (filter.sampai && TGL.test(filter.sampai))
      kondisi.push(lte(semua.tanggal, filter.sampai));
  } else if (filter.bulan && /^\d{4}-\d{2}$/.test(filter.bulan)) {
    const [y, m] = filter.bulan.split("-").map((x) => parseInt(x, 10));
    const awal = `${y}-${String(m).padStart(2, "0")}-01`;
    const mB = m === 12 ? 1 : m + 1;
    const yB = m === 12 ? y + 1 : y;
    const awalBerikut = `${yB}-${String(mB).padStart(2, "0")}-01`;
    kondisi.push(gte(semua.tanggal, awal));
    kondisi.push(lt(semua.tanggal, awalBerikut));
  }

  if (filter.kategori && kategoriKasOpsi.some((o) => o.nilai === filter.kategori)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kondisi.push(eq(semua.kategori, filter.kategori as any));
  }

  if (filter.kelompok === "umum" || filter.kelompok === "terikat") {
    kondisi.push(eq(semua.kelompokDana, filter.kelompok));
  }

  const cari = filter.cari?.trim();
  if (cari) {
    kondisi.push(ilike(semua.keterangan, `%${cari}%`));
  }

  return db
    .with(semua)
    .select()
    .from(semua)
    .where(kondisi.length ? and(...kondisi) : undefined)
    .orderBy(desc(semua.tanggal), desc(semua.createdAt))
    .limit(200);
}

// Saldo total sejak awal.
export async function saldoTotal(masjidId: string): Promise<number> {
  const r = await agregat(masjidId);
  return r.saldo;
}

export type SaldoPerKelompok = { umum: RingkasanKas; terikat: RingkasanKas };

// Saldo terpisah untuk dana umum & dana terikat (mis. wakaf, santunan yatim)
// supaya keduanya tidak pernah tercampur di tampilan (beranda & laporan publik).
export async function saldoPerKelompok(
  masjidId: string
): Promise<SaldoPerKelompok> {
  const [umum, terikat] = await Promise.all([
    agregat(masjidId, undefined, undefined, "umum"),
    agregat(masjidId, undefined, undefined, "terikat"),
  ]);
  return { umum, terikat };
}

// Ringkasan bulan tertentu (tahun & bulan 1-12). Delegasi ke `agregat`
// supaya filter status "disetujui" tidak bisa lupa di salah satu tempat.
export async function ringkasanBulan(
  masjidId: string,
  tahun: number,
  bulan: number
): Promise<RingkasanKas> {
  const awal = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
  // Hari terakhir bulan ini (day 0 bulan berikutnya) — kolom `tanggal`
  // granularitas harian, jadi lte hari terakhir setara < awal bulan berikut.
  const akhirDate = new Date(tahun, bulan, 0);
  const akhir = `${akhirDate.getFullYear()}-${String(akhirDate.getMonth() + 1).padStart(2, "0")}-${String(akhirDate.getDate()).padStart(2, "0")}`;
  return agregat(masjidId, awal, akhir);
}

export type KategoriNominal = {
  kategori: string;
  label: string;
  nominal: number;
};

// Total nominal per kategori untuk satu bulan (untuk pie chart & anggaran).
// Urut dari nominal terbesar; kategori bernilai 0 tidak ikut.
export async function ringkasanKategoriBulan(
  masjidId: string,
  tahun: number,
  bulan: number,
  tipe: "masuk" | "keluar",
  status?: "disetujui"
): Promise<KategoriNominal[]> {
  const awal = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
  const bulanBerikut = bulan === 12 ? 1 : bulan + 1;
  const tahunBerikut = bulan === 12 ? tahun + 1 : tahun;
  const awalBerikut = `${tahunBerikut}-${String(bulanBerikut).padStart(2, "0")}-01`;

  const kondisi = [
    eq(transaksiKas.masjidId, masjidId),
    eq(transaksiKas.tipe, tipe),
    gte(transaksiKas.tanggal, awal),
    lt(transaksiKas.tanggal, awalBerikut),
  ];
  if (status) kondisi.push(eq(transaksiKas.status, status));

  const rows = await db
    .select({
      kategori: transaksiKas.kategori,
      nominal: sql<number>`coalesce(sum(${transaksiKas.nominal}), 0)::int`,
    })
    .from(transaksiKas)
    .where(and(...kondisi))
    .groupBy(transaksiKas.kategori)
    .orderBy(sql`sum(${transaksiKas.nominal}) desc`);

  return rows
    .map((r) => ({
      kategori: r.kategori,
      label: labelKategori[r.kategori] ?? r.kategori,
      nominal: Number(r.nominal),
    }))
    .filter((r) => r.nominal > 0);
}

// Ringkasan satu tahun kalender penuh (1 Jan - 31 Des).
export async function ringkasanTahun(
  masjidId: string,
  tahun: number
): Promise<RingkasanKas> {
  return agregat(masjidId, `${tahun}-01-01`, `${tahun}-12-31`);
}

export type AnggaranBaris = {
  kategori: string;
  label: string;
  target: number;
  realisasi: number;
  persen: number;
};

// Anggaran vs realisasi pengeluaran bulan berjalan, hanya kategori yang
// punya target. Realisasi cuma menghitung transaksi disetujui.
export async function anggaranVsRealisasi(
  masjidId: string,
  tahun: number,
  bulan: number
): Promise<AnggaranBaris[]> {
  const [targets, realisasi] = await Promise.all([
    db
      .select()
      .from(anggaranKategori)
      .where(eq(anggaranKategori.masjidId, masjidId)),
    ringkasanKategoriBulan(masjidId, tahun, bulan, "keluar", "disetujui"),
  ]);

  const realisasiPerKategori = new Map(
    realisasi.map((r) => [r.kategori, r.nominal])
  );

  return targets
    .filter((t) => t.targetNominal > 0)
    .map((t) => {
      const r = realisasiPerKategori.get(t.kategori) ?? 0;
      return {
        kategori: t.kategori,
        label: labelKategori[t.kategori] ?? t.kategori,
        target: t.targetNominal,
        realisasi: r,
        persen: Math.round((r / t.targetNominal) * 100),
      };
    })
    .sort((a, b) => b.persen - a.persen);
}

export type StatistikRingkas = {
  danaTersalurkan: number;
  kegiatanTerlaksana: number;
  jumlahPengurus: number;
};

// Angka ringkas untuk section statistik di halaman depan publik. Tampil
// apa adanya walau 0 (masjid baru) — angka nol tetap informasi yang jujur.
export async function statistikRingkas(
  masjidId: string,
  tahun: number
): Promise<StatistikRingkas> {
  const [tahunIni, [kegiatan], [pengurus]] = await Promise.all([
    ringkasanTahun(masjidId, tahun),
    db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(agendaKegiatan)
      .where(
        and(
          eq(agendaKegiatan.masjidId, masjidId),
          sql`${agendaKegiatan.tanggalMulai} < current_date`
        )
      ),
    db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(strukturPengurus)
      .where(eq(strukturPengurus.masjidId, masjidId)),
  ]);

  return {
    danaTersalurkan: tahunIni.keluar,
    kegiatanTerlaksana: Number(kegiatan?.jumlah ?? 0),
    jumlahPengurus: Number(pengurus?.jumlah ?? 0),
  };
}

// Agenda mendatang untuk halaman depan publik — agenda yang tanggalnya
// sudah lewat otomatis tidak ikut (filter tanggal saja, tanpa status).
export async function agendaMendatang(masjidId: string, limit = 5) {
  return db
    .select()
    .from(agendaKegiatan)
    .where(
      and(
        eq(agendaKegiatan.masjidId, masjidId),
        sql`${agendaKegiatan.tanggalMulai} >= current_date`
      )
    )
    .orderBy(asc(agendaKegiatan.tanggalMulai))
    .limit(limit);
}

// Struktur pengurus untuk halaman publik — SENGAJA tidak join ke akunTakmir
// (tabel ini murni data tampilan, bukan akun login).
export async function strukturPengurusPublik(masjidId: string) {
  return db
    .select({
      id: strukturPengurus.id,
      nama: strukturPengurus.nama,
      jabatan: strukturPengurus.jabatan,
    })
    .from(strukturPengurus)
    .where(eq(strukturPengurus.masjidId, masjidId))
    .orderBy(asc(strukturPengurus.urutan));
}

// 8 foto terbaru untuk grid galeri di halaman depan publik.
export async function fotoTerbaru(masjidId: string, limit = 8) {
  return db
    .select()
    .from(galeriFoto)
    .where(eq(galeriFoto.masjidId, masjidId))
    .orderBy(desc(galeriFoto.createdAt))
    .limit(limit);
}

// Jumlah & total nominal transaksi yang menunggu verifikasi (untuk badge
// nav admin dan baris ringkasan di beranda).
export async function jumlahMenunggu(
  masjidId: string
): Promise<{ jumlah: number; total: number }> {
  const [row] = await db
    .select({
      jumlah: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${transaksiKas.nominal}), 0)::int`,
    })
    .from(transaksiKas)
    .where(
      and(
        eq(transaksiKas.masjidId, masjidId),
        eq(transaksiKas.status, "menunggu")
      )
    );
  return { jumlah: Number(row?.jumlah ?? 0), total: Number(row?.total ?? 0) };
}

export type TitikSaldo = { label: string; saldo: number };

// Saldo kumulatif (sejak awal) di penghujung tiap bulan, untuk N bulan terakhir
// (bulan berjalan pakai tanggal hari ini karena belum selesai).
export async function saldoPerBulan(
  masjidId: string,
  jumlahBulan = 6
): Promise<TitikSaldo[]> {
  const sekarang = new Date();

  const rencana = Array.from({ length: jumlahBulan }, (_, idx) => {
    const i = jumlahBulan - 1 - idx;
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    const tahun = d.getFullYear();
    const bulan = d.getMonth() + 1;
    const akhirBulan = new Date(tahun, bulan, 0).getDate();
    const cutoff =
      i === 0
        ? sekarang.toISOString().slice(0, 10)
        : `${tahun}-${String(bulan).padStart(2, "0")}-${String(akhirBulan).padStart(2, "0")}`;
    return { label: BULAN_SINGKAT[bulan - 1], cutoff };
  });

  return Promise.all(
    rencana.map(async ({ label, cutoff }) => ({
      label,
      saldo: (await agregat(masjidId, undefined, cutoff)).saldo,
    }))
  );
}
