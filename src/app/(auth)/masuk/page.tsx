import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Card } from "@/components/ui";
import MasukForm from "./MasukForm";

export const metadata = {
  title: "Masuk — AmanahMasjid",
};

export default async function HalamanMasuk() {
  // Kalau sudah login, langsung ke Beranda.
  const session = await getSession();
  if (session.takmirId) redirect("/beranda");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-hijau-700">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
          AmanahMasjid
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Masuk untuk mencatat kas masjid Anda.
        </p>
      </div>

      <Card>
        <MasukForm />
      </Card>

      <p className="mt-6 text-center text-base text-gray-600">
        Belum punya akun? Akun masjid dibuatkan oleh tim AmanahMasjid saat
        pendampingan. Hubungi pendamping Anda.
      </p>
    </main>
  );
}
