"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PESAN_STATUS: Record<string, string> = {
  tersimpan: "Transaksi tersimpan",
  dihapus: "Transaksi dihapus",
  disetujui: "Transaksi disetujui",
  ditolak: "Transaksi ditolak",
};

export default function Toast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pesan, setPesan] = useState<string | null>(null);

  const status = searchParams.get("status");

  useEffect(() => {
    if (!status || !PESAN_STATUS[status]) return;

    setPesan(PESAN_STATUS[status]);

    // Bersihkan parameter "status" dari URL agar toast tidak muncul lagi
    // saat halaman di-refresh atau saat kembali lewat tombol back.
    const sisaParam = new URLSearchParams(searchParams.toString());
    sisaParam.delete("status");
    const query = sisaParam.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    const timer = setTimeout(() => setPesan(null), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!pesan) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border-2 border-hijau-300 bg-hijau-50 px-5 py-3 text-lg font-medium text-hijau-800 shadow-lg"
      >
        {pesan}
      </div>
    </div>
  );
}
