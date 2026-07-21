"use client";

import { useRef } from "react";

// Thumbnail bukti foto yang bisa diklik untuk lihat ukuran penuh.
// Pakai <dialog> native, tanpa library lightbox.
export default function FotoLightbox({
  src,
  alt = "Bukti foto nota",
  ukuran = 56,
}: {
  src: string;
  alt?: string;
  ukuran?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={ukuran}
        height={ukuran}
        className="cursor-zoom-in rounded-lg border border-gray-300 object-cover"
        style={{ width: ukuran, height: ukuran }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dialogRef.current?.showModal();
        }}
      />
      <dialog
        ref={dialogRef}
        className="rounded-2xl p-2 backdrop:bg-black/70"
        onClick={() => dialogRef.current?.close()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[80vh] max-w-full rounded-xl" />
        <p className="mt-2 text-center text-sm text-gray-500">
          Ketuk di mana saja untuk menutup
        </p>
      </dialog>
    </>
  );
}
