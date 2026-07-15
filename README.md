# AmanahMasjid

Aplikasi web untuk membantu takmir masjid mencatat kas & infaq, lalu menghasilkan
laporan transparan yang bisa diakses jemaah lewat tautan/QR tanpa perlu login.
Login cukup dengan nomor HP + PIN, dan aplikasi bisa dipasang sebagai PWA.

Dokumen acuan lengkap: [`AmanahMasjid_PRD.md`](./AmanahMasjid_PRD.md).

## Status (Fase 1)

Fase 1 (sesuai roadmap PRD §13) sudah dikerjakan:

- ✅ **Setup** — Next.js (App Router, TypeScript) + Tailwind + Drizzle ORM (Neon Postgres)
- ✅ **Autentikasi** — nomor HP + PIN 6 digit (bcrypt hash), sesi `iron-session` (cookie httpOnly 90 hari), rate-limit percobaan login, script CLI onboarding
- ✅ **Kas & Infaq** — saldo berjalan, catat/ubah/hapus transaksi (dengan log audit siapa & kapan), filter per bulan & kategori
- ✅ **Laporan Publik** — halaman read-only `/m/[slug]` (minim JS), QR code, tombol Unduh/Cetak PDF (dialog cetak browser)

Belum dikerjakan (iterasi berikutnya): PWA installable, modul Zakat musiman,
modul Kurban musiman, export PDF menyeluruh.

## Teknologi

| Bagian | Pilihan |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Database | Postgres (Neon) via Drizzle ORM |
| Auth | Custom nomor HP + PIN, `iron-session` |
| Hash PIN | `bcryptjs` |
| QR code | `qrcode` |

## Setup Lokal

Prasyarat: Node.js 20+ dan akun [Neon](https://neon.tech) (gratis).

1. **Install dependency**

   ```bash
   npm install
   ```

2. **Siapkan environment**

   Salin `.env.example` menjadi `.env`, lalu isi:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — connection string dari dashboard Neon (pakai yang mengandung `-pooler`).
   - `SESSION_SECRET` — string acak minimal 32 karakter. Buat dengan:

     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

3. **Buat tabel di database**

   ```bash
   npm run db:push
   ```

   (Alternatif: `npm run db:generate` untuk membuat file migrasi SQL di `./drizzle`, lalu terapkan.)

4. **Daftarkan masjid + akun takmir pertama** (onboarding manual, PRD §6.1)

   ```bash
   npm run seed:admin
   ```

   Script interaktif ini menanyakan nama masjid, slug, nomor HP, dan PIN, lalu
   membuat akun pertama. PIN disimpan ter-hash, tidak pernah plaintext.

5. **Jalankan server pengembangan**

   ```bash
   npm run dev
   ```

   Buka http://localhost:3000 → diarahkan ke halaman **Masuk**. Login dengan
   nomor HP + PIN yang tadi dibuat. Laporan publik ada di `http://localhost:3000/m/<slug>`.

## Peran (Roles)

Setiap akun takmir (`akun_takmir.peran`) punya salah satu dari 4 peran berikut
(PRD §4, §7):

| Peran | Untuk siapa | Tanggung jawab |
|---|---|---|
| `admin` | Pengurus utama/penanggung jawab masjid | Onboarding masjid & akun takmir lain, akses penuh ke semua modul |
| `bendahara` | Bendahara/takmir harian | Catat transaksi kas & infaq masuk/keluar, lihat saldo berjalan, bagikan tautan/QR laporan publik ke jemaah |
| `panitia_zakat` | Relawan musiman Ramadhan | Kelola musim zakat, catat data muzakki (pembayar) & mustahik (penerima) beserta alokasi 8 asnaf |
| `panitia_kurban` | Relawan musiman Idul Adha | Kelola musim kurban, catat peserta (termasuk sapi patungan) & checklist distribusi daging per kelompok |

Akun pertama yang dibuat lewat `npm run seed:admin` biasanya berperan `admin`,
tapi script yang sama dipakai untuk mendaftarkan akun takmir dengan peran
lainnya juga — saat prompt `Peran [admin]:` muncul, ketik salah satu:
`bendahara`, `panitia_zakat`, atau `panitia_kurban` (bukan hanya menekan Enter).
Setiap peran login dengan cara yang sama (nomor HP + PIN 6 digit); belum ada
pembatasan akses per peran di level UI (direncanakan untuk iterasi
berikutnya seiring modul Zakat & Kurban dibangun).

### Akun test tim (masjid: Al-Hakim / `masjidnyahakim`)

⚠️ **Untuk testing internal saja** — PIN sama di semua akun, jangan dipakai
di produksi nyata. Ganti PIN masing-masing lewat database/script kalau akun
ini mulai dipakai serius (lihat catatan Reset PIN di bawah).

| Nama | Nomor HP | PIN | Peran |
|---|---|---|---|
| Bendahara Test | `081200000001` | `123456` | `bendahara` |
| Panitia Zakat Test | `081200000002` | `123456` | `panitia_zakat` |
| Panitia Kurban Test | `081200000003` | `123456` | `panitia_kurban` |

## Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run db:push` | Terapkan skema ke database |
| `npm run db:generate` | Buat file migrasi SQL |
| `npm run db:studio` | Buka Drizzle Studio (lihat data) |
| `npm run seed:admin` | Daftarkan masjid + takmir baru (CLI) |

## Struktur Folder

```
src/
  db/            skema Drizzle (schema.ts) & koneksi (index.ts)
  lib/           auth (PIN hash), session, validasi nomor HP, format Rupiah,
                 query saldo/ringkasan, rate-limit, label UI
  components/    komponen UI ramah lansia (tombol besar, kontras tinggi)
  app/
    (auth)/masuk/     halaman login
    (app)/            halaman terproteksi (butuh sesi)
      beranda/        saldo + ringkasan bulan + tautan laporan
      kas/            riwayat, tambah, ubah/hapus transaksi
    m/[slug]/         laporan publik read-only + QR + cetak PDF
scripts/
  seed-admin.ts  script onboarding CLI
```

## Deploy ke Vercel

> Langkah berikut dilakukan sendiri di luar repo ini (belum dieksekusi).

1. Push repository ini ke GitHub.
2. Di [Vercel](https://vercel.com), **Add New → Project**, import repo dari GitHub.
   Vercel mendeteksi Next.js otomatis, tanpa konfigurasi tambahan.
3. Di **Settings → Environment Variables**, tambahkan:
   - `DATABASE_URL` (dari Neon — bisa juga dibuat langsung lewat Vercel Marketplace → Neon)
   - `SESSION_SECRET` (string acak 32+ karakter)
4. **Deploy**. Setiap `git push` ke branch utama akan otomatis men-deploy ulang.
5. Setelah database siap, terapkan skema sekali dari lokal (dengan `DATABASE_URL`
   produksi di `.env`): `npm run db:push`, lalu `npm run seed:admin` untuk membuat
   akun masjid produksi pertama.

### Menghubungkan Domain lewat Cloudflare

1. Di Vercel **Settings → Domains**, tambahkan domain kustom Anda (mis. `amanahmasjid.id`).
   Vercel menampilkan target CNAME/A record.
2. Di dashboard **Cloudflare** domain tersebut, buka **DNS**:
   - Tambahkan record `CNAME` untuk `www` (atau `@` dengan CNAME flattening)
     mengarah ke target yang diberikan Vercel (`cname.vercel-dns.com`).
   - Untuk root/apex, ikuti instruksi record dari Vercel.
3. Set mode proxy sesuai kebutuhan (biasanya **DNS only / abu-abu** dulu sampai
   verifikasi Vercel berhasil, lalu boleh diaktifkan proxy oranye).
4. Tunggu propagasi DNS, verifikasi domain hijau di Vercel.

## Catatan

- **Keamanan PIN**: PIN 6 digit di-hash dengan bcrypt; tidak pernah disimpan/di-log
  sebagai plaintext. Percobaan login dibatasi (rate-limit in-memory per instance —
  untuk skala besar ganti ke store bersama, mis. Upstash Redis).
- **Reset PIN**: belum ada self-service (tidak ada OTP di MVP). Reset dilakukan tim
  via database / script, sesuai PRD §6.1.
- **Tanpa integrasi pembayaran/QRIS** di MVP ini (lihat catatan syariah PRD §11).
- Aset visual (logo/ikon) masih placeholder; ganti dengan aset final saat tersedia.
# AmanahMasjid
# AmanahMasjid
