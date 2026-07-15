import type { Config } from "tailwindcss";

// Palet & tipografi dirancang ramah lansia (PRD §10):
// warna hijau-putih, kontras tinggi, ukuran font besar sebagai default.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Hijau masjid sebagai warna utama
        hijau: {
          50: "#effaf3",
          100: "#d8f3e0",
          200: "#b3e6c6",
          300: "#80d3a3",
          400: "#48b87a",
          500: "#249d5b", // warna aksen utama
          600: "#187e49",
          700: "#14653c",
          800: "#135032",
          900: "#10422b",
        },
      },
      fontSize: {
        // Naikkan skala dasar agar teks lebih besar & mudah dibaca lansia
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.85rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
