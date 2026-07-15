import type { TitikSaldo } from "@/lib/queries";
import { formatRupiah } from "@/lib/rupiah";

const LEBAR = 320;
const TINGGI = 64;
const PAD_X = 10;
const PAD_Y = 10;

export default function SparklineSaldo({ data }: { data: TitikSaldo[] }) {
  if (data.length === 0) return null;

  const nilai = data.map((d) => d.saldo);
  const min = Math.min(...nilai);
  const max = Math.max(...nilai);
  const rentang = max - min;

  const titik = data.map((d, i) => {
    const x =
      data.length === 1
        ? LEBAR / 2
        : PAD_X + (i * (LEBAR - PAD_X * 2)) / (data.length - 1);
    const y =
      rentang === 0
        ? TINGGI / 2
        : PAD_Y + (1 - (d.saldo - min) / rentang) * (TINGGI - PAD_Y * 2);
    return { x, y };
  });

  const akhir = titik[titik.length - 1];
  const naik = data[data.length - 1].saldo >= data[0].saldo;
  const ringkasan = `Tren saldo ${data[0].label} sampai ${data[data.length - 1].label}: ${
    naik ? "naik" : "turun"
  } dari ${formatRupiah(data[0].saldo)} menjadi ${formatRupiah(
    data[data.length - 1].saldo
  )}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${LEBAR} ${TINGGI}`}
        className="h-16 w-full"
        role="img"
        aria-label={ringkasan}
      >
        <polyline
          points={titik.map((t) => `${t.x},${t.y}`).join(" ")}
          fill="none"
          className="stroke-hijau-600"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={akhir.x}
          cy={akhir.y}
          r={5}
          className="fill-hijau-700 stroke-white"
          strokeWidth={2}
        />
      </svg>
      <div className="mt-1 flex justify-between text-sm text-gray-500">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
