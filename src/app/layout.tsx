import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  // Berat statis (bukan variable font) — variable Inter di beberapa build
  // Chromium menyebabkan angka besar (mis. statistik "text-6xl tabular-nums")
  // dirender ganda/bertumpuk di layar tertentu.
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AmanahMasjid",
  description:
    "Catat kas, infaq, zakat, dan kurban masjid dengan mudah, dan bagikan laporan yang transparan kepada jemaah.",
};

export const viewport: Viewport = {
  themeColor: "#187e49",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
