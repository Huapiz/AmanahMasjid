import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  date,
  timestamp,
  unique,
  doublePrecision,
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
  // kelompok "umum"
  "kas_umum",
  "infaq_jumat",
  "infaq_pembangunan",
  "sewa_aset",
  "parkir",
  "operasional",
  "lainnya_umum",
  // kelompok "terikat"
  "wakaf",
  "santunan_yatim",
  "dana_sosial_kematian",
  "beasiswa",
  "lainnya_terikat",
]);

export const kelompokDanaEnum = pgEnum("kelompok_dana", ["umum", "terikat"]);

export const statusVerifikasiEnum = pgEnum("status_verifikasi", [
  "menunggu",
  "disetujui",
  "ditolak",
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
  slug: text("slug").notNull().unique(), // sisa dari era multi-masjid; tidak dipakai untuk routing publik lagi (lihat /, /laporan)
  alamat: text("alamat"),
  // Profil halaman depan publik (/)
  deskripsi: text("deskripsi"), // profil/sejarah singkat
  pengumuman: text("pengumuman"), // running text, null = tidak tampil
  // Kontak WA publik — SENGAJA terpisah dari akunTakmir.nomorHp (kredensial
  // login), jangan pernah pakai nomor HP akun manapun untuk ini.
  nomorWaKontak: text("nomor_wa_kontak"),
  sambutanTakmir: text("sambutan_takmir"), // kata sambutan ketua takmir, opsional
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
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
  kelompokDana: kelompokDanaEnum("kelompok_dana").notNull().default("umum"),
  nominal: integer("nominal").notNull(), // Rupiah, tanpa desimal
  keterangan: text("keterangan"),
  buktiFoto: text("bukti_foto"), // data URL base64 foto nota, opsional
  dibuatOleh: uuid("dibuat_oleh")
    .notNull()
    .references(() => akunTakmir.id),
  // Audit perubahan (PRD §10 "siapa & kapan")
  diubahOleh: uuid("diubah_oleh").references(() => akunTakmir.id),
  // Verifikasi 2 tingkat: transaksi lama otomatis dianggap disetujui
  // (default), transaksi baru di-set "menunggu" eksplisit di kode aplikasi.
  status: statusVerifikasiEnum("status").notNull().default("disetujui"),
  diverifikasiOleh: uuid("diverifikasi_oleh").references(() => akunTakmir.id),
  diverifikasiPada: timestamp("diverifikasi_pada", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Target anggaran per kategori: satu angka aktif per kategori (bukan per
// bulan-tahun), jadi patokan bulan berjalan terus sampai diubah admin.
export const anggaranKategori = pgTable(
  "anggaran_kategori",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    masjidId: uuid("masjid_id")
      .notNull()
      .references(() => masjid.id, { onDelete: "cascade" }),
    kategori: kategoriKasEnum("kategori").notNull(),
    targetNominal: integer("target_nominal").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    unikMasjidKategori: unique().on(t.masjidId, t.kategori),
  })
);

// Tombol pintas transaksi yang sering dipakai. Nominal sengaja tidak
// disimpan — nominal selalu beda tiap pencatatan, diisi manual.
export const presetTransaksi = pgTable("preset_transaksi", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // mis. "Infaq Jumat"
  tipe: tipeTransaksiEnum("tipe").notNull(),
  kategori: kategoriKasEnum("kategori").notNull(),
  keteranganDefault: text("keterangan_default"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Agenda kegiatan masjid, dipromosikan di halaman depan publik. Agenda
// yang tanggalnya sudah lewat otomatis tidak muncul (filter tanggal saja,
// tidak perlu status/soft-delete).
export const agendaKegiatan = pgTable("agenda_kegiatan", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  tanggalMulai: date("tanggal_mulai").notNull(),
  dibuatOleh: uuid("dibuat_oleh")
    .notNull()
    .references(() => akunTakmir.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Struktur pengurus untuk tampilan publik — SENGAJA terpisah dari
// akunTakmir (data tampilan, bukan akun login), jangan pernah di-join ke
// akunTakmir dari halaman publik.
export const strukturPengurus = pgTable("struktur_pengurus", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(), // teks bebas, mis. "Ketua Takmir"
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Galeri foto kegiatan (base64, pola sama dengan bukti nota kas).
export const galeriFoto = pgTable("galeri_foto", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  foto: text("foto").notNull(), // data URL base64
  keterangan: text("keterangan"),
  diunggahOleh: uuid("diunggah_oleh")
    .notNull()
    .references(() => akunTakmir.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Pendaftar formulir "info kegiatan" di halaman depan publik — pengunjung
// tanpa akun, cuma tinggalkan nomor WA. Tidak perlu relasi ke akunTakmir.
export const pendaftarInfo = pgTable("pendaftar_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  masjidId: uuid("masjid_id")
    .notNull()
    .references(() => masjid.id, { onDelete: "cascade" }),
  nomorWa: text("nomor_wa").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
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
