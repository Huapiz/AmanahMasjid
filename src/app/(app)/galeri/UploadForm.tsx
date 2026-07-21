"use client";

import { useActionState, useRef, useState } from "react";
import { unggahFoto, type GaleriState } from "./actions";
import { Label, Input, TombolPrimer, PesanError } from "@/components/ui";
import { kompresGambar, MAKS_PANJANG_FOTO } from "@/lib/kompresGambar";

const kondisiAwal: GaleriState = {};

export default function UploadForm() {
  const [state, formAction, pending] = useActionState(unggahFoto, kondisiAwal);
  const [foto, setFoto] = useState<string>("");
  const [errorFoto, setErrorFoto] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      setFoto(hasil);
    } catch {
      setErrorFoto("File tidak bisa dibaca sebagai foto. Coba file lain.");
    }
  }

  function hapusPilihan() {
    setFoto("");
    setErrorFoto("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        hapusPilihan();
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <PesanError>{state.error}</PesanError>

      <div>
        <Label htmlFor="fotoGaleri">Pilih Foto</Label>
        <input
          ref={fileRef}
          id="fotoGaleri"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pilihFoto}
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900"
        />
        <input type="hidden" name="foto" value={foto} />
        {errorFoto && (
          <p className="mt-1 text-base font-semibold text-red-700">
            {errorFoto}
          </p>
        )}
        {foto && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto}
              alt="Preview foto"
              className="h-20 w-20 rounded-lg border border-gray-300 object-cover"
            />
            <button
              type="button"
              onClick={hapusPilihan}
              className="min-h-[2.75rem] rounded-lg border-2 border-red-400 px-4 text-base font-semibold text-red-700 hover:bg-red-50"
            >
              Hapus Foto
            </button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="keterangan">Keterangan (boleh dikosongkan)</Label>
        <Input id="keterangan" name="keterangan" type="text" />
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Mengunggah…" : "Unggah Foto"}
      </TombolPrimer>
    </form>
  );
}
