import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
