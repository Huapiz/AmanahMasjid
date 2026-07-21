// Kompresi gambar di browser sebelum disimpan sebagai base64 (dipakai oleh
// bukti foto nota kas dan galeri foto kegiatan). Batas ukuran hasil
// kompresi (panjang string base64, ~500KB file).
export const MAKS_PANJANG_FOTO = 700_000;

// Resize max lebar 800px, JPEG kualitas 0.7.
export function kompresGambar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const skala = Math.min(1, 800 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * skala);
      canvas.height = Math.round(img.height * skala);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas tidak didukung."));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File bukan gambar yang valid."));
    };
    img.src = url;
  });
}
