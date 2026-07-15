"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Label, Input, TombolPrimer, PesanError } from "@/components/ui";

const kondisiAwal: LoginState = {};

export default function MasukForm() {
  const [state, formAction, pending] = useActionState(login, kondisiAwal);

  return (
    <form action={formAction} className="space-y-5">
      <PesanError>{state.error}</PesanError>

      <div>
        <Label htmlFor="nomorHp">Nomor HP</Label>
        <Input
          id="nomorHp"
          name="nomorHp"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="Contoh: 0812xxxxxxx"
          required
        />
      </div>

      <div>
        <Label htmlFor="pin">PIN (6 angka)</Label>
        <Input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          pattern="\d{6}"
          maxLength={6}
          placeholder="••••••"
          required
        />
      </div>

      <TombolPrimer type="submit" className="w-full" disabled={pending}>
        {pending ? "Sedang masuk…" : "Masuk"}
      </TombolPrimer>
    </form>
  );
}
