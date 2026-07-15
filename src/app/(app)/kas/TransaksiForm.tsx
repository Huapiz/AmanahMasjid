"use client";

import { useActionState } from "react";
import type { TransaksiState } from "./actions";
import {
  Label,
  Input,
  Select,
  Textarea,
  TombolPrimer,
  PesanError,
} from "@/components/ui";
import { tipeOpsi, kategoriKasOpsi } from "@/lib/labels";

type NilaiAwal = {
  tanggal?: string;
  tipe?: string;
  kategori?: string;
  nominal?: number;
  keterangan?: string;
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

  const hariIni = new Date().toISOString().slice(0, 10);

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
          {kategoriKasOpsi.map((o) => (
            <option key={o.nilai} value={o.nilai}>
              {o.label}
            </option>
          ))}
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

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : labelTombol}
      </TombolPrimer>
    </form>
  );
}
