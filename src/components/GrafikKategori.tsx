"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { KategoriNominal } from "@/lib/queries";
import { kategoriWarnaHex } from "@/lib/kategoriWarnaHex";
import { formatRupiah } from "@/lib/rupiah";

export default function GrafikKategori({
  data,
  judul,
}: {
  data: KategoriNominal[];
  judul: string;
}) {
  return (
    <div>
      <p className="mb-2 text-base font-semibold text-gray-700">{judul}</p>
      {data.length === 0 ? (
        <p className="py-8 text-center text-base text-gray-500">
          Belum ada transaksi bulan ini
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="nominal"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="70%"
              >
                {data.map((d) => (
                  <Cell
                    key={d.kategori}
                    fill={kategoriWarnaHex[d.kategori] ?? "#334155"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatRupiah(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
