"use client";

import { useActionState, useRef, useState } from "react";
import type { TransaksiState } from "./actions";
import {
  Label,
  Input,
  Select,
  Textarea,
  TombolPrimer,
  PesanError,
} from "@/components/ui";
import { tipeOpsi, kategoriKasUmum, kategoriKasTerikat } from "@/lib/labels";
import { kompresGambar, MAKS_PANJANG_FOTO } from "@/lib/kompresGambar";

type NilaiAwal = {
  tanggal?: string;
  tipe?: string;
  kategori?: string;
  nominal?: number;
  keterangan?: string;
  buktiFoto?: string;
};

const kondisiAwal: TransaksiState = {};

export default function TransaksiForm({
  action,
  awal,
  labelTombol,
}: {
  action: (state: TransaksiState, formData: FormData) => Promise<TransaksiState>;
  awal?: NilaiAwal;
  labelTombol: string;
}) {
  const [state, formAction, pending] = useActionState(action, kondisiAwal);
  const [buktiFoto, setBuktiFoto] = useState<string>(awal?.buktiFoto ?? "");
  const [errorFoto, setErrorFoto] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const hariIni = new Date().toISOString().slice(0, 10);

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorFoto("");
    try {
      const hasil = await kompresGambar(file);
      if (hasil.length > MAKS_PANJANG_FOTO) {
        setErrorFoto(
          "Foto terlalu besar, coba foto ulang dengan pencahayaan lebih sederhana."
        );
        return;
      }
      setBuktiFoto(hasil);
    } catch {
      setErrorFoto("File tidak bisa dibaca sebagai foto. Coba file lain.");
    }
  }

  function hapusFoto() {
    setBuktiFoto("");
    setErrorFoto("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={formAction} className="space-y-5">
      <PesanError>{state.error}</PesanError>

      <div>
        <Label htmlFor="tanggal">Tanggal</Label>
        <Input
          id="tanggal"
          name="tanggal"
          type="date"
          defaultValue={awal?.tanggal ?? hariIni}
          required
        />
      </div>

      <div>
        <Label htmlFor="tipe">Jenis</Label>
        <Select id="tipe" name="tipe" defaultValue={awal?.tipe ?? "masuk"}>
          {tipeOpsi.map((o) => (
            <option key={o.nilai} value={o.nilai}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="kategori">Kategori</Label>
        <Select
          id="kategori"
          name="kategori"
          defaultValue={awal?.kategori ?? "kas_umum"}
        >
          <optgroup label="Dana Umum">
            {kategoriKasUmum.map((o) => (
              <option key={o.nilai} value={o.nilai}>
                {o.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Dana Terikat">
            {kategoriKasTerikat.map((o) => (
              <option key={o.nilai} value={o.nilai}>
                {o.label}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>

      <div>
        <Label htmlFor="nominal">Nominal (Rupiah)</Label>
        <Input
          id="nominal"
          name="nominal"
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 500000"
          defaultValue={awal?.nominal ? String(awal.nominal) : ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="keterangan">Keterangan (boleh dikosongkan)</Label>
        <Textarea
          id="keterangan"
          name="keterangan"
          rows={2}
          placeholder="Contoh: Infaq kotak amal Jumat"
          defaultValue={awal?.keterangan ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="fotoNota">Bukti Foto Nota (boleh dikosongkan)</Label>
        {/* Input file tanpa `name`: tidak ikut ter-submit, hasil kompresinya
            dikirim lewat hidden input di bawah sebagai base64. */}
        <input
          ref={fileRef}
          id="fotoNota"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pilihFoto}
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900"
        />
        <input type="hidden" name="buktiFoto" value={buktiFoto} />
        {errorFoto && (
          <p className="mt-1 text-base font-semibold text-red-700">{errorFoto}</p>
        )}
        {buktiFoto && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buktiFoto}
              alt="Preview bukti foto"
              className="h-20 w-20 rounded-lg border border-gray-300 object-cover"
            />
            <button
              type="button"
              onClick={hapusFoto}
              className="min-h-[2.75rem] rounded-lg border-2 border-red-400 px-4 text-base font-semibold text-red-700 hover:bg-red-50"
            >
              Hapus Foto
            </button>
          </div>
        )}
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : labelTombol}
      </TombolPrimer>
    </form>
  );
}
