# Prompt Pembuatan Aplikasi: AmanahMasjid

Gunakan prompt di bawah ini di Claude Code, Cursor, atau AI coding assistant lain. Taruh file `AmanahMasjid_PRD.md` di root repo sebelum menjalankan prompt ini, supaya asisten bisa membacanya sebagai referensi lengkap.

---

## PROMPT (salin dari sini)

Kamu akan membangun MVP aplikasi web bernama **AmanahMasjid**. Baca dulu file `AmanahMasjid_PRD.md` di root project untuk konteks lengkap (masalah, fitur, model data, tech stack). Ikuti PRD tersebut sebagai sumber kebenaran utama. Jika ada instruksi di prompt ini yang bertentangan dengan PRD, tanyakan ke saya dulu sebelum melanjutkan.

### Tech stack wajib

- Next.js (App Router, TypeScript) sebagai frontend dan backend (API routes/server actions).
- Database: Postgres lewat Neon, diakses dengan Drizzle ORM.
- Deployment target: Vercel, terhubung dari GitHub repo (siapkan struktur project supaya langsung bisa di-import ke Vercel tanpa konfigurasi tambahan).
- Styling: Tailwind CSS.
- Tidak ada bot WhatsApp/Telegram, tidak ada n8n/Make.com, tidak ada integrasi pembayaran di MVP ini.

### Batasan lingkup kerja

Fokus hanya pada penulisan kode aplikasi secara lokal. Jangan menjalankan `git init`, membuat commit, membuat repo GitHub, push ke remote manapun, menghubungkan project ke Vercel, atau mengubah pengaturan domain/DNS. Semua itu akan dilakukan sendiri oleh saya di luar sesi ini setelah kode selesai. Kalau ada langkah yang biasanya butuh itu (misalnya deploy), cukup jelaskan langkahnya di README, jangan dieksekusi.

### Yang perlu dibangun, urutkan sesuai roadmap di PRD bagian 13

1. **Setup project**: inisialisasi Next.js + TypeScript + Tailwind, siapkan skema Drizzle sesuai model data di PRD bagian 7, siapkan file `.env.example` untuk `DATABASE_URL` (Neon connection string).

2. **Autentikasi nomor HP + PIN** (PRD 6.1):
   - Halaman daftar/login dengan input nomor HP (validasi format Indonesia, +62) dan PIN 6 digit.
   - PIN di-hash pakai bcrypt sebelum disimpan, jangan pernah simpan atau log PIN plaintext.
   - Session pakai cookie httpOnly, masa berlaku panjang (misal 90 hari) supaya takmir tidak perlu login berulang.
   - Buat halaman admin sederhana (bisa berupa route terproteksi atau script CLI) untuk tim mendaftarkan akun masjid + akun takmir pertama secara manual saat onboarding, sesuai catatan di PRD bahwa MVP ini tidak pakai OTP otomatis.

3. **Kas Umum & Infaq** (PRD 6.3):
   - Dashboard menampilkan saldo berjalan.
   - Form tambah transaksi (tanggal, tipe masuk/keluar, kategori, nominal, keterangan).
   - Daftar riwayat transaksi dengan filter per bulan dan kategori, bisa edit/hapus dengan log siapa-kapan mengubah.

4. **Laporan Publik** (PRD 6.6):
   - Halaman publik read-only di route `/m/[slug]`, tanpa perlu login.
   - Tampilkan saldo terkini, ringkasan pemasukan/pengeluaran bulan berjalan.
   - Generate QR code yang mengarah ke URL halaman ini (bisa pakai library `qrcode` di sisi server atau client).
   - Optimalkan untuk cepat dimuat di koneksi lambat, minimalkan JavaScript yang dikirim ke halaman ini.

5. **PWA** (PRD 6.2):
   - Buat `manifest.json` (nama "AmanahMasjid", ikon 192x192 dan 512x512 — buat placeholder ikon sederhana jika belum ada aset final, display: standalone, theme_color dan background_color yang sesuai branding masjid/hijau-putih).
   - Daftarkan service worker minimal untuk cache app shell.
   - Tambahkan tombol "Pasang Aplikasi" di dashboard yang memicu event `beforeinstallprompt`; sediakan juga teks instruksi manual untuk browser yang tidak mendukung prompt otomatis.

6. **Modul Zakat Musiman** (PRD 6.4):
   - CRUD "musim zakat" (label, status aktif/selesai).
   - Form catat muzakki dan mustahik per musim, termasuk kategori 8 asnaf untuk mustahik.
   - Kalkulator zakat fitrah dan zakat maal dasar sebagai alat bantu terpisah, tampilkan disclaimer bahwa ini bukan fatwa mengikat.
   - Halaman rekap per musim yang bisa dibandingkan dengan musim tahun sebelumnya.

7. **Modul Kurban Musiman** (PRD 6.5):
   - CRUD "musim kurban".
   - Form catat peserta kurban (nama, atas nama, jenis hewan, untuk sapi patungan validasi maksimal 7 slot per ekor, status bayar).
   - Checklist distribusi daging per kelompok/RT penerima.
   - Tampilkan ringkasan musim kurban di halaman laporan publik.

8. **Cetak/Export PDF** (PRD 6.7, prioritas P2, kerjakan setelah fitur inti selesai):
   - Tombol unduh PDF dari halaman laporan publik dan dashboard.

### Panduan implementasi

- Ikuti model data di PRD bagian 7 sebagai skema Drizzle awal, boleh disesuaikan penamaan kolom mengikuti konvensi TypeScript/Drizzle tapi jangan ubah relasi/entitasnya tanpa memberi tahu saya.
- UI harus ramah untuk pengguna lansia sesuai PRD bagian 10: font besar, kontras tinggi, hindari jargon teknis, tombol jelas dan besar. Gunakan bahasa Indonesia yang sederhana di semua label UI, bukan istilah seperti "dashboard" tapi "Beranda", dsb.
- Setiap perubahan transaksi kas harus tercatat log-nya (siapa, kapan) sesuai prinsip auditability di PRD bagian 10.
- Jangan implementasikan integrasi pembayaran/QRIS apa pun di MVP ini, sesuai catatan pembatasan di PRD bagian 11.
- Setelah tiap modul selesai, jalankan build lokal untuk memastikan tidak ada error sebelum lanjut ke modul berikutnya.
- Di akhir, buat file `README.md` singkat berisi langkah setup lokal (clone, install, `.env`, migrasi database, run dev server) dan langkah deploy ke Vercel + hubungkan domain lewat Cloudflare.

Mulai dari langkah 1 (setup project). Tunjukkan rencana struktur folder singkat sebelum mulai menulis kode, supaya saya bisa konfirmasi dulu.

---

## Catatan pemakaian

- Prompt ini dirancang untuk dijalankan bertahap (Claude Code/Cursor biasanya bekerja lebih baik kalau dikerjakan modul per modul, bukan sekali generate semua). Kalau asisten coding kamu langsung menggenerate semuanya sekaligus, itu tidak masalah, tapi tetap review tiap modul sebelum lanjut.
- Ikon dan aset visual (logo AmanahMasjid) belum final di PRD, jadi asisten akan membuat placeholder. Ganti dengan aset asli begitu tim desain (Raihan) selesai membuatnya.
- Kalau nanti mau menambahkan OTP otomatis atau integrasi QRIS, itu perubahan besar terhadap asumsi keamanan dan model bisnis, sebaiknya diskusikan dan update PRD dulu sebelum minta AI coding assistant mengerjakannya.
