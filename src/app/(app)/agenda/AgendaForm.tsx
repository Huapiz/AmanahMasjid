"use client";

import { useActionState, useRef } from "react";
import { tambahAgenda, type AgendaState } from "./actions";
import { Label, Input, Textarea, TombolPrimer, PesanError } from "@/components/ui";

const kondisiAwal: AgendaState = {};

export default function AgendaForm() {
  const [state, formAction, pending] = useActionState(tambahAgenda, kondisiAwal);
  const formRef = useRef<HTMLFormElement>(null);
  const hariIni = new Date().toISOString().slice(0, 10);

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

      <div>
        <Label htmlFor="judul">Judul Kegiatan</Label>
        <Input
          id="judul"
          name="judul"
          type="text"
          placeholder="Contoh: Kajian Rutin Ba'da Maghrib"
          required
        />
      </div>

      <div>
        <Label htmlFor="tanggalMulai">Tanggal</Label>
        <Input
          id="tanggalMulai"
          name="tanggalMulai"
          type="date"
          defaultValue={hariIni}
          required
        />
      </div>

      <div>
        <Label htmlFor="deskripsi">Deskripsi (boleh dikosongkan)</Label>
        <Textarea id="deskripsi" name="deskripsi" rows={2} />
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Menyimpan…" : "Tambah Agenda"}
      </TombolPrimer>
    </form>
  );
}
