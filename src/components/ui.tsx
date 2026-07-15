import Link from "next/link";
import { twMerge } from "tailwind-merge";
import type { ComponentProps } from "react";

// Kumpulan komponen UI dasar ramah lansia (PRD §10):
// tombol besar, label jelas, kontras tinggi. Semua aman sebagai server component.

export function Card({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={twMerge("rounded-2xl border border-hijau-100 bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
}

export function TombolPrimer({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={twMerge("inline-flex min-h-[3.25rem] items-center justify-center rounded-xl bg-hijau-600 px-6 text-lg font-semibold text-white transition hover:bg-hijau-700 focus:outline-none disabled:opacity-60", className)}
      {...props}
    />
  );
}

export function TombolSekunder({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={twMerge("inline-flex min-h-[3.25rem] items-center justify-center rounded-xl border-2 border-hijau-600 bg-white px-6 text-lg font-semibold text-hijau-700 transition hover:bg-hijau-50 focus:outline-none disabled:opacity-60", className)}
      {...props}
    />
  );
}

export function TautanTombol({
  className = "",
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={twMerge("inline-flex min-h-[3.25rem] items-center justify-center rounded-xl bg-hijau-600 px-6 text-lg font-semibold text-white transition hover:bg-hijau-700", className)}
      {...props}
    />
  );
}

export function Label({
  className = "",
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      className={twMerge("mb-1 block text-lg font-semibold text-gray-800", className)}
      {...props}
    />
  );
}

const inputDasar =
  "w-full min-h-[3.25rem] rounded-xl border-2 border-gray-300 bg-white px-4 text-lg text-gray-900 focus:border-hijau-500 focus:outline-none";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={twMerge(inputDasar, className)} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={twMerge(inputDasar, className)} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={twMerge("w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:border-hijau-500 focus:outline-none", className)}
      {...props}
    />
  );
}

export function PesanError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-lg font-medium text-red-800"
    >
      {children}
    </div>
  );
}

export function PesanSukses({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="status"
      className="rounded-xl border-2 border-hijau-300 bg-hijau-50 px-4 py-3 text-lg font-medium text-hijau-800"
    >
      {children}
    </div>
  );
}
