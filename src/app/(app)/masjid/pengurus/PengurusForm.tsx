"use client";

import { useActionState, useRef } from "react";
import { tambahPengurus, type PengurusState } from "./actions";
import { Label, Input, TombolPrimer, PesanError } from "@/components/ui";

const kondisiAwal: PengurusState = {};

export default function PengurusForm() {
  const [state, formAction, pending] = useActionState(
    tambahPengurus,
    kondisiAwal
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <PesanError>{state.error}</PesanError>

      <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
        <div>
          <Label htmlFor="nama">Nama</Label>
          <Input id="nama" name="nama" type="text" required />
        </div>
        <div>
          <Label htmlFor="jabatan">Jabatan</Label>
          <Input
            id="jabatan"
            name="jabatan"
            type="text"
            placeholder="Contoh: Ketua Takmir"
            required
          />
        </div>
        <div>
          <Label htmlFor="urutan">Urutan</Label>
          <Input
            id="urutan"
            name="urutan"
            type="number"
            defaultValue={0}
          />
        </div>
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : "Tambah Pengurus"}
      </TombolPrimer>
    </form>
  );
}
