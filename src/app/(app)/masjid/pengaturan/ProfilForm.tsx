"use client";

import { useActionState } from "react";
import { simpanProfil, type ProfilState } from "./actions";
import {
  Label,
  Input,
  Textarea,
  TombolPrimer,
  PesanError,
  PesanSukses,
} from "@/components/ui";

type NilaiAwal = {
  deskripsi?: string;
  pengumuman?: string;
  nomorWaKontak?: string;
  sambutanTakmir?: string;
  latitude?: number;
  longitude?: number;
};

const kondisiAwal: ProfilState = {};

export default function ProfilForm({ awal }: { awal: NilaiAwal }) {
  const [state, formAction, pending] = useActionState(simpanProfil, kondisiAwal);

  return (
    <form action={formAction} className="space-y-5">
      <PesanError>{state.error}</PesanError>
      <PesanSukses>{state.sukses ? "Profil masjid tersimpan." : ""}</PesanSukses>

      <div>
        <Label htmlFor="deskripsi">Deskripsi / Sejarah Singkat</Label>
        <Textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          placeholder="Contoh: Masjid ini berdiri sejak tahun ..."
          defaultValue={awal.deskripsi ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="pengumuman">
          Pengumuman (running text di halaman depan, boleh dikosongkan)
        </Label>
        <Textarea
          id="pengumuman"
          name="pengumuman"
          rows={2}
          placeholder="Contoh: Kajian rutin tiap Sabtu ba'da Maghrib"
          defaultValue={awal.pengumuman ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="sambutanTakmir">
          Kata Sambutan Ketua Takmir (opsional)
        </Label>
        <Textarea
          id="sambutanTakmir"
          name="sambutanTakmir"
          rows={3}
          placeholder="Contoh: Selamat datang di rumah Allah ini..."
          defaultValue={awal.sambutanTakmir ?? ""}
        />
        <p className="mt-1 text-sm text-gray-500">
          Tampil sebagai kutipan di halaman depan, bersebelahan dengan
          profil masjid.
        </p>
      </div>

      <div>
        <Label htmlFor="nomorWaKontak">Nomor WA Kontak Publik</Label>
        <Input
          id="nomorWaKontak"
          name="nomorWaKontak"
          type="text"
          inputMode="tel"
          placeholder="Contoh: +6281234567890"
          defaultValue={awal.nomorWaKontak ?? ""}
        />
        <p className="mt-1 text-sm text-gray-500">
          Ini nomor kontak publik, beda dari nomor HP akun login takmir.
        </p>
      </div>

      <div>
        <Label>Koordinat Lokasi Masjid</Label>
        <p className="mb-2 text-sm text-gray-500">
          Buka Google Maps, klik kanan di lokasi masjid, klik koordinat yang
          muncul untuk menyalin (mis. -6.200000, 106.816666), lalu tempel
          terpisah ke dua kolom di bawah ini. Dipakai untuk hitung jadwal
          sholat di halaman depan.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="text"
              inputMode="decimal"
              placeholder="-6.200000"
              defaultValue={awal.latitude ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="text"
              inputMode="decimal"
              placeholder="106.816666"
              defaultValue={awal.longitude ?? ""}
            />
          </div>
        </div>
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : "Simpan Profil"}
      </TombolPrimer>
    </form>
  );
}
