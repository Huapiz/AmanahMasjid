# Product Requirements Document (PRD): AmanahMasjid

**Versi**: 1.0
**Tanggal**: 15 Juli 2026
**Tim**: Majelis Islam Mandiri (MIM)
**Turunan dari**: AmanahMasjid_Ide_Bisnis.docx (versi 3.0)

---

## 1. Ringkasan Produk

AmanahMasjid adalah aplikasi web untuk membantu takmir masjid mencatat kas umum, infaq, zakat, dan kurban, lalu secara otomatis menghasilkan laporan transparan yang bisa diakses jemaah. Login cukup pakai nomor HP tanpa email/password, dan aplikasi bisa dipasang di layar HP sebagai Progressive Web App (PWA) tanpa perlu Play Store.

Target utama: takmir masjid kampung/perumahan usia 45 tahun ke atas yang masih mencatat manual di kertas atau Excel/Word, dan minim literasi digital.

## 2. Latar Belakang & Masalah

1. Pencatatan kas manual (kertas, Excel/Word tanpa format baku) menyita waktu dan rawan hilang, terutama saat musim padat (Ramadhan, Idul Adha).
2. Laporan musiman (zakat, kurban) dibuat ulang dari nol tiap tahun tanpa riwayat, berisiko salah bagi/salah catat penerima manfaat.
3. Aplikasi digital yang ada umumnya butuh pendaftaran rumit (email/password, unduh dari Play Store) yang jadi hambatan bagi takmir generasi tua.

## 3. Tujuan Produk

* Mengurangi waktu rekap laporan kas masjid, khususnya di musim Ramadhan dan Idul Adha.
* Menyediakan format baku untuk zakat dan kurban yang bisa dipakai ulang tiap tahun.
* Menyediakan laporan publik yang bisa diakses jemaah kapan saja tanpa perlu login.
* Menurunkan hambatan masuk (onboarding) serendah mungkin lewat login nomor HP dan instalasi PWA satu klik.

### Non-Goals (di luar cakupan MVP)

* Tidak ada integrasi pembayaran/QRIS otomatis di MVP (lihat catatan syariah di bagian 11).
* Tidak ada bot WhatsApp/Telegram atau otomasi n8n/Make.com.
* Tidak ada modul akuntansi umum (general ledger) di luar kas umum, infaq, zakat, kurban.
* Tidak ada aplikasi native Android/iOS terpisah, cukup PWA.

## 4. Target Pengguna & Persona

**Persona 1: Pak Bendahara (Takmir/Bendahara Masjid)**
Usia 50 tahun, terbiasa mencatat kas di buku tulis, familiar WhatsApp tapi tidak nyaman dengan aplikasi berlapis menu. Kebutuhan: input transaksi secepat menulis di buku, tanpa istilah teknis.

**Persona 2: Panitia Zakat/Kurban Musiman**
Relawan yang hanya aktif saat Ramadhan atau menjelang Idul Adha, butuh sistem yang bisa langsung dipakai tanpa training panjang, dan format yang sama dipakai lagi tahun berikutnya.

**Persona 3: Jemaah**
Pengguna pasif yang hanya ingin melihat laporan kas masjid lewat tautan atau QR code yang dibagikan di grup WhatsApp, tanpa perlu akun.

## 5. Ruang Lingkup Fitur (MVP)

| Modul | Prioritas |
|---|---|
| Autentikasi nomor HP + PIN | Wajib (P0) |
| PWA (installable, ikon di layar HP) | Wajib (P0) |
| Kas Umum & Infaq (CRUD transaksi, saldo berjalan) | Wajib (P0) |
| Laporan Publik (halaman tanpa login, tautan/QR) | Wajib (P0) |
| Modul Zakat Musiman (kalkulator fitrah/maal, muzakki-mustahik) | Wajib (P1) |
| Modul Kurban Musiman (peserta, distribusi daging) | Wajib (P1) |
| Cetak/Export PDF laporan untuk papan pengumuman | Sebaiknya ada (P2) |
| Multi-masjid per akun sponsor (kemitraan) | Nice-to-have (P3) |

## 6. Fitur & User Stories

### 6.1 Autentikasi Nomor HP

* Sebagai takmir, saya ingin mendaftar dengan nomor HP dan membuat PIN 6 digit, supaya saya tidak perlu mengingat email/password.
* Sebagai takmir, saya ingin login ulang hanya dengan nomor HP + PIN, tanpa proses OTP otomatis di tahap awal (verifikasi manual saat onboarding oleh tim).
* Sebagai admin/tim, saya ingin bisa mendaftarkan akun masjid baru secara manual (nomor HP awal + PIN awal) saat sesi pendampingan tatap muka.

**Kriteria Penerimaan**
- Nomor HP disimpan dalam format E.164 (+62...), divalidasi format Indonesia.
- PIN disimpan ter-hash (bukan plaintext), minimal 6 digit numerik.
- Sesi login bertahan lama (long-lived session/cookie) supaya takmir tidak perlu login berulang kali di HP yang sama.
- Ada mekanisme reset PIN oleh admin/tim (bukan self-service di MVP, karena tidak ada OTP otomatis).

### 6.2 PWA (Installable Web App)

* Sebagai takmir, saya ingin memasang AmanahMasjid sebagai ikon di layar HP saya, supaya terasa seperti aplikasi biasa.

**Kriteria Penerimaan**
- `manifest.json` lengkap (nama, ikon 192x192 dan 512x512, theme_color, start_url, display: standalone).
- Service worker terdaftar untuk caching dasar (app shell), agar tetap bisa dibuka meski koneksi lambat.
- Tombol "Pasang Aplikasi" di dashboard memicu `beforeinstallprompt` di Chrome/Android; untuk browser yang tidak mendukung prompt otomatis, tampilkan instruksi manual ("buka menu titik tiga, pilih Instal dan buat pintasan").

### 6.3 Kas Umum & Infaq

* Sebagai bendahara, saya ingin mencatat transaksi masuk/keluar (tanggal, kategori, nominal, keterangan), supaya kas selalu ter-update.
* Sebagai bendahara, saya ingin melihat saldo berjalan otomatis, supaya tidak perlu menghitung manual.
* Sebagai bendahara, saya ingin memfilter riwayat transaksi per bulan/kategori.

**Kriteria Penerimaan**
- Form input: tanggal, jenis (masuk/keluar), kategori (kas umum, infaq Jumat, infaq lain, operasional, dll — dapat dikustomisasi per masjid), nominal (Rupiah, tanpa desimal), keterangan bebas.
- Saldo dihitung dari akumulasi transaksi, ditampilkan di dashboard utama.
- Riwayat transaksi bisa diedit/dihapus oleh bendahara dengan log perubahan (siapa, kapan) untuk transparansi.

### 6.4 Modul Zakat Musiman

* Sebagai panitia zakat, saya ingin menghitung zakat fitrah dan zakat maal dasar, supaya perhitungan konsisten dengan ketentuan syariah.
* Sebagai panitia zakat, saya ingin mencatat muzakki (pembayar) dan mustahik (penerima) beserta alokasi 8 asnaf.
* Sebagai panitia zakat, saya ingin laporan otomatis per periode (misal Ramadhan 2027) yang terpisah dari kas umum tapi tetap terhubung ke saldo total.

**Kriteria Penerimaan**
- Kalkulator zakat fitrah: input jumlah jiwa dan nilai per jiwa (beras/uang, mengikuti ketetapan masjid setempat), hasil otomatis terkalkulasi.
- Kalkulator zakat maal dasar: input jenis harta, nisab, dan persentase (2.5%), sebagai alat bantu bukan fatwa mengikat — sertakan disclaimer "konsultasikan ke ustadz/lembaga amil zakat setempat untuk kasus kompleks".
- Data muzakki: nama (opsional bisa anonim), jumlah, tanggal.
- Data mustahik: nama, kategori asnaf (fakir, miskin, amil, mualaf, riqab, gharimin, fisabilillah, ibnu sabil), jumlah diterima.
- Setiap periode zakat punya ID musim sendiri (misal `zakat-2027-ramadhan`) agar riwayat antar tahun bisa dibandingkan.

### 6.5 Modul Kurban Musiman

* Sebagai panitia kurban, saya ingin mencatat peserta kurban (nama, jenis hewan, status patungan jika sapi).
* Sebagai panitia kurban, saya ingin checklist distribusi daging per kelompok/RT penerima.
* Sebagai jemaah, saya ingin melihat laporan kurban tahun ini (jumlah hewan, jumlah peserta, progres distribusi) di halaman publik.

**Kriteria Penerimaan**
- Data peserta: nama, jenis hewan (kambing/domba/sapi/patungan sapi), nominal, status bayar (lunas/cicil), atas nama (untuk niat kurban).
- Untuk sapi patungan: sistem mendukung hingga 7 peserta per satu ekor sapi, dengan validasi otomatis (tidak lebih dari 7).
- Checklist distribusi: daftar kelompok/RT penerima, status terkirim/belum, jumlah paket.
- Setiap periode kurban punya ID musim sendiri (misal `kurban-2027`).

### 6.6 Laporan Publik

* Sebagai jemaah, saya ingin membuka tautan atau scan QR code untuk melihat laporan kas masjid tanpa perlu login.

**Kriteria Penerimaan**
- Halaman publik per masjid di URL unik (misal `amanahmasjid.id/m/{slug-masjid}`), read-only, tidak menampilkan data sensitif (nomor HP takmir, dll).
- Menampilkan: saldo kas terkini, ringkasan pemasukan/pengeluaran bulan berjalan, ringkasan musim zakat/kurban terakhir (jika ada).
- QR code digenerate otomatis mengarah ke URL laporan publik, bisa diunduh sebagai gambar untuk dicetak.
- Halaman dioptimalkan untuk dibuka di HP dengan koneksi lambat (ringan, minim JS di sisi publik).

### 6.7 Cetak/Export PDF (P2)

* Sebagai bendahara, saya ingin mencetak laporan sebagai PDF untuk ditempel di papan pengumuman fisik.

**Kriteria Penerimaan**
- Tombol "Unduh PDF" di halaman laporan publik dan dashboard, menghasilkan PDF ringkas siap cetak (A4 atau A5).

## 7. Model Data (Skema Awal)

```
masjid
  id (uuid, pk)
  nama
  slug (unik, dipakai di URL publik)
  alamat
  created_at

akun_takmir
  id (uuid, pk)
  masjid_id (fk -> masjid.id)
  nomor_hp (unik, format E.164)
  pin_hash
  nama
  peran (bendahara | panitia_zakat | panitia_kurban | admin)
  created_at

transaksi_kas
  id (uuid, pk)
  masjid_id (fk)
  tanggal
  tipe (masuk | keluar)
  kategori (kas_umum | infaq_jumat | infaq_lain | operasional | lainnya)
  nominal (integer, rupiah)
  keterangan
  dibuat_oleh (fk -> akun_takmir.id)
  created_at

musim_zakat
  id (uuid, pk)
  masjid_id (fk)
  label (mis. "Ramadhan 2027")
  status (aktif | selesai)

catatan_zakat
  id (uuid, pk)
  musim_zakat_id (fk)
  tipe (muzakki | mustahik)
  nama
  kategori_asnaf (nullable, hanya untuk mustahik)
  nominal
  catatan

musim_kurban
  id (uuid, pk)
  masjid_id (fk)
  label (mis. "Idul Adha 2027")
  status (aktif | selesai)

peserta_kurban
  id (uuid, pk)
  musim_kurban_id (fk)
  nama_peserta
  atas_nama (niat kurban)
  jenis_hewan (kambing | domba | sapi_patungan)
  slot_ke (integer, untuk sapi patungan, 1-7)
  nominal
  status_bayar (lunas | cicil)

distribusi_kurban
  id (uuid, pk)
  musim_kurban_id (fk)
  kelompok_penerima
  jumlah_paket
  status (belum | terkirim)
```

## 8. Alur Pengguna Utama

**Onboarding masjid baru**
1. Tim mendampingi takmir secara tatap muka, membuat akun masjid dan akun takmir pertama (nomor HP + PIN).
2. Takmir login pertama kali, diarahkan ke tombol "Pasang Aplikasi" untuk instalasi PWA.
3. Takmir memasukkan transaksi kas beberapa minggu terakhir (migrasi data dari buku/Excel) sebagai riwayat awal.

**Rutin mingguan**
1. Bendahara login (PWA sudah terpasang, tinggal buka ikon).
2. Input transaksi kas/infaq Jumat.
3. Bagikan tautan/QR laporan publik ke grup WhatsApp jemaah.

**Musiman (Ramadhan/Idul Adha)**
1. Panitia zakat/kurban membuat musim baru.
2. Input data muzakki-mustahik atau peserta-distribusi sepanjang musim berjalan.
3. Tutup musim di akhir periode, laporan otomatis tersimpan sebagai riwayat untuk dibandingkan tahun depan.

## 9. Tech Stack & Arsitektur

* **Frontend/Backend**: Next.js (App Router), di-deploy dari GitHub ke Vercel (CI/CD otomatis tiap push).
* **Database**: Postgres terkelola lewat Neon (Vercel Marketplace), diakses dengan ORM (Drizzle atau Prisma).
* **Auth**: custom, nomor HP + PIN hash (bcrypt/argon2), session cookie (mis. lewat `iron-session` atau NextAuth Credentials Provider dikustomisasi).
* **PWA**: `manifest.json` + service worker (bisa pakai `next-pwa` atau implementasi manual minimal).
* **Domain & DNS**: domain kustom diarahkan lewat Cloudflare (proxy DNS ke Vercel).
* **Hosting**: Vercel Hobby plan untuk MVP (gratis), upgrade ke Pro bila traffic/kebutuhan build meningkat.

## 10. Kebutuhan Non-Fungsional

* **Aksesibilitas untuk lansia**: ukuran font besar secara default, kontras warna tinggi, tombol besar dan jelas, hindari istilah teknis (gunakan bahasa sehari-hari, bukan "dashboard" tapi "Beranda", dsb).
* **Kinerja**: halaman laporan publik harus tetap cepat dibuka di koneksi 3G/4G lambat (skor Lighthouse mobile performance target di atas 80).
* **Keamanan**: PIN di-hash, tidak pernah menyimpan PIN plaintext di log; rate limiting pada percobaan login untuk mencegah brute force PIN 6 digit.
* **Ketersediaan data**: backup otomatis harian dari Neon (fitur bawaan point-in-time recovery).
* **Auditability**: setiap perubahan transaksi kas mencatat siapa dan kapan (log sederhana), untuk mendukung prinsip transparansi/amanah.

## 11. Catatan Syariah & Batasan Produk

* Kalkulator zakat adalah alat bantu hitung, bukan fatwa. Wajib menyertakan disclaimer di setiap hasil kalkulasi zakat maal.
* Semua model pendapatan (biaya setup, biaya perawatan tahunan, kemitraan sponsor) menggunakan akad ijarah (upah jasa), bukan bunga/riba.
* MVP sengaja tidak mengintegrasikan pembayaran donasi digital (QRIS) langsung ke dalam produk, karena MDR QRIS untuk kategori donasi sosial/tempat ibadah ditetapkan 0% oleh Bank Indonesia — mengenakan biaya tambahan di jalur itu berisiko dipersepsikan memotong dana infak jemaah. Jika di masa depan ingin ditambahkan, integrasi QRIS sebaiknya murni pass-through tanpa fee tambahan dari AmanahMasjid.

## 12. Metrik Keberhasilan (selaras dengan Lean Canvas)

* Jumlah masjid aktif terdaftar.
* Jumlah transaksi terinput per masjid per bulan.
* Kunjungan halaman laporan publik per masjid.
* Tingkat instalasi PWA dari total akun terdaftar.
* Jumlah masjid yang menyelesaikan minimal satu siklus musiman penuh (Ramadhan atau kurban) tanpa berhenti pakai.

## 13. Roadmap MVP

| Fase | Cakupan | Estimasi |
|---|---|---|
| Fase 1 | Autentikasi nomor HP + PIN, Kas Umum & Infaq, Laporan Publik dasar | Minggu 1-3 |
| Fase 2 | PWA installable, cetak PDF laporan | Minggu 4 |
| Fase 3 | Modul Zakat Musiman | Minggu 5-6 |
| Fase 4 | Modul Kurban Musiman | Minggu 7-8 |
| Fase 5 | Uji coba dengan 2-3 masjid mitra, perbaikan berdasarkan feedback | Minggu 9-10 |

## 14. Risiko & Asumsi

* **Asumsi**: takmir sasaran punya akses HP dengan browser modern (Chrome/Android) yang mendukung PWA install prompt. Risiko: sebagian pengguna masih pakai HP lama/browser yang tidak mendukung, perlu fallback instruksi manual.
* **Asumsi**: tanpa OTP otomatis, keamanan cukup dijaga lewat proses onboarding tatap muka. Risiko: tidak scalable kalau jumlah masjid tumbuh cepat tanpa tim onboarding yang sepadan.
* **Risiko regulasi**: jika di masa depan menambahkan fitur pembayaran, perlu tinjau ulang ketentuan Bank Indonesia soal QRIS kategori sosial (lihat bagian 11).

---

*Dokumen ini adalah spesifikasi produk turunan dari AmanahMasjid_Ide_Bisnis.docx. Perubahan pada model bisnis harus disinkronkan kembali ke kedua dokumen.*
