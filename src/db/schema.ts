import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Enum (PRD §7) ─────────────────────────────────────────────────────────
export const peranEnum = pgEnum("peran", [
  "bendahara",
  "panitia_zakat",
  "panitia_kurban",
  "admin",
]);

export const tipeTransaksiEnum = pgEnum("tipe_transaksi", ["masuk", "keluar"]);

export const kategoriKasEnum = pgEnum("kategori_kas", [
  "kas_umum",
  "infaq_jumat",
  "infaq_lain",
  "operasional",
  "lainnya",
]);

export const statusMusimEnum = pgEnum("status_musim", ["aktif", "selesai"]);

export const tipeZakatEnum = pgEnum("tipe_zakat", ["muzakki", "mustahik"]);

export const asnafEnum = pgEnum("asnaf", [
  "fakir",
  "miskin",
  "amil",
  "mualaf",
  "riqab",
  "gharimin",
  "fisabilillah",
  "ibnu_sabil",
]);

export const jenisHewanEnum = pgEnum("jenis_hewan", [
  "kambing",
  "domba",
  "sapi",
  "sapi_patungan",
]);

export const statusBayarEnum = pgEnum("status_bayar", ["lunas", "cicil"]);

export const statusDistribusiEnum = pgEnum("status_distribusi", [
  "belum",
  "terkirim",
]);

// ── Tabel ─────────────────────────────────────────────────────────────────

export const masjid = pgTable("masjid", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").notNull(),
  slug: text("slug").notNull().unique(), // dipakai di URL publik /m/[slug]
  alamat: text("alamat"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const akunTakmir = pgTable("akun_takmir", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  nomorHp: text("nomor_hp").notNull().unique(), // format E.164 (+62...)
  pinHash: text("pin_hash").notNull(),
  nama: text("nama").notNull(),
  peran: peranEnum("peran").notNull().default("bendahara"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transaksiKas = pgTable("transaksi_kas", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  tipe: tipeTransaksiEnum("tipe").notNull(),
  kategori: kategoriKasEnum("kategori").notNull(),
  nominal: integer("nominal").notNull(), // Rupiah, tanpa desimal
  keterangan: text("keterangan"),
  dibuatOleh: uuid("dibuat_oleh")
    .notNull()
    .references(() => akunTakmir.id),
  // Audit perubahan (PRD §10 "siapa & kapan")
  diubahOleh: uuid("diubah_oleh").references(() => akunTakmir.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const musimZakat = pgTable("musim_zakat", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // mis. "Ramadhan 2027"
  status: statusMusimEnum("status").notNull().default("aktif"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const catatanZakat = pgTable("catatan_zakat", {
  id: uuid("id").primaryKey().defaultRandom(),
  musimZakatId: uuid("musim_zakat_id")
    .notNull()
    .references(() => musimZakat.id, { onDelete: "cascade" }),
  tipe: tipeZakatEnum("tipe").notNull(),
  nama: text("nama"),
  kategoriAsnaf: asnafEnum("kategori_asnaf"), // hanya untuk mustahik
  nominal: integer("nominal").notNull(),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const musimKurban = pgTable("musim_kurban", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // mis. "Idul Adha 2027"
  status: statusMusimEnum("status").notNull().default("aktif"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pesertaKurban = pgTable("peserta_kurban", {
  id: uuid("id").primaryKey().defaultRandom(),
  musimKurbanId: uuid("musim_kurban_id")
    .notNull()
    .references(() => musimKurban.id, { onDelete: "cascade" }),
  namaPeserta: text("nama_peserta").notNull(),
  atasNama: text("atas_nama"), // niat kurban
  jenisHewan: jenisHewanEnum("jenis_hewan").notNull(),
  slotKe: integer("slot_ke"), // untuk sapi patungan, 1-7
  nominal: integer("nominal"),
  statusBayar: statusBayarEnum("status_bayar").notNull().default("cicil"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const distribusiKurban = pgTable("distribusi_kurban", {
  id: uuid("id").primaryKey().defaultRandom(),
  musimKurbanId: uuid("musim_kurban_id")
    .notNull()
    .references(() => musimKurban.id, { onDelete: "cascade" }),
  kelompokPenerima: text("kelompok_penerima").notNull(),
  jumlahPaket: integer("jumlah_paket").notNull().default(0),
  status: statusDistribusiEnum("status").notNull().default("belum"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tipe bantu untuk dipakai di aplikasi
export type Masjid = typeof masjid.$inferSelect;
export type AkunTakmir = typeof akunTakmir.$inferSelect;
export type TransaksiKas = typeof transaksiKas.$inferSelect;
