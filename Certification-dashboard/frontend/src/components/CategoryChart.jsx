import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart({ categories }) {
  const labels = categories?.labels || ['Kudapan Kering', 'Makanan Basah', 'Minuman'];
  const dataValues = categories?.data || [25, 16, 4];
  const percentages = categories?.percentages || [55, 35, 10];
  const colors = categories?.colors || ['#1E4D2B', '#D97706', '#3B82F6'];

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const count = context.raw || 0;
            const pct = percentages[context.dataIndex] || 0;
            return ` ${context.label}: ${count} Usaha (${pct}%)`;
          }
        }
      }
    },
    cutout: '68%'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="p-2 bg-nu-50 rounded-xl text-nu-700">
          <PieIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Distribusi Kategori Produk Olahan
          </h2>
          <p className="text-xs text-slate-500">
            Komposisi usaha binaan Fatayat NU Mersi
          </p>
        </div>
      </div>

      <div className="relative h-56 sm:h-64 my-auto">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl font-extrabold text-nu-900">
            {dataValues.reduce((a, b) => a + b, 0)}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Total UMKM</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
        {labels.map((lbl, idx) => (
          <div key={lbl} className="bg-slate-50 rounded-xl p-2">
            <span className="text-xs text-slate-500 block truncate">{lbl}</span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {dataValues[idx]} ({percentages[idx]}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
