"use client";

import { useActionState } from "react";
import { daftarInfo, type DaftarInfoState } from "@/app/actions";

const kondisiAwal: DaftarInfoState = {};

export default function DaftarInfoForm() {
  const [state, formAction, pending] = useActionState(daftarInfo, kondisiAwal);

  if (state.sukses) {
    return (
      <p className="rounded-xl border-2 border-hijau-300 bg-hijau-50 px-4 py-3 text-lg font-medium text-hijau-800">
        Terima kasih, nomor WA sudah tercatat.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
      <input
        name="nomorWa"
        type="text"
        inputMode="tel"
        placeholder="Contoh: 0812xxxxxxxx"
        required
        className="w-full min-h-[3.25rem] rounded-xl border-2 border-gray-300 bg-white px-4 text-lg text-gray-900 focus:border-hijau-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[3.25rem] shrink-0 items-center justify-center rounded-xl bg-hijau-600 px-6 text-lg font-semibold text-white transition hover:bg-hijau-700 disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Daftar"}
      </button>
      {state.error && (
        <p
          role="alert"
          className="w-full text-base font-medium text-red-700 sm:basis-full"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
