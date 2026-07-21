"use client";

import { useActionState } from "react";
import { tambahPreset, type PresetState } from "./actions";
import {
  Label,
  Input,
  Select,
  TombolPrimer,
  PesanError,
} from "@/components/ui";
import { tipeOpsi, kategoriKasUmum, kategoriKasTerikat } from "@/lib/labels";

const kondisiAwal: PresetState = {};

export default function PresetForm() {
  const [state, formAction, pending] = useActionState(tambahPreset, kondisiAwal);

  return (
    <form action={formAction} className="space-y-4">
      <PesanError>{state.error}</PesanError>

      <div>
        <Label htmlFor="label">Nama Tombol</Label>
        <Input
          id="label"
          name="label"
          type="text"
          placeholder="Contoh: Infaq Jumat Pagi"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tipe">Jenis</Label>
          <Select id="tipe" name="tipe" defaultValue="masuk">
            {tipeOpsi.map((o) => (
              <option key={o.nilai} value={o.nilai}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="kategori">Kategori</Label>
          <Select id="kategori" name="kategori" defaultValue="kas_umum">
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
      </div>

      <div>
        <Label htmlFor="keterangan">Keterangan Otomatis (boleh dikosongkan)</Label>
        <Input
          id="keterangan"
          name="keterangan"
          type="text"
          placeholder="Contoh: Infaq kotak amal Jumat"
        />
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : "Tambah Preset"}
      </TombolPrimer>
    </form>
  );
}
