import React from "react";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BarChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function IncomeExpenseChart({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Income vs Expenses
          </h2>
        </div>
        <div className="flex items-center justify-center h-48 sm:h-64 text-neutral-500 italic">
          <p>No transaction data available to display chart.</p>
        </div>
      </div>
    );
  }

  const groupedData = transactions.reduce((acc, trans) => {
    try {
      const date = format(parseISO(trans.timestamp), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = { income: 0, expense: 0 };
      acc[date][trans.type] += trans.amount;
    } catch (error) {
      console.error("Error parsing date:", trans.timestamp, error);
    }
    return acc;
  }, {});

  const labels = Object.keys(groupedData).sort();
  const incomeData = labels.map((date) => groupedData[date].income);
  const expenseData = labels.map((date) => groupedData[date].expense);

  const chartData = {
    labels: labels.map(date => format(parseISO(date), "MMM dd")),
    datasets: [
      {
        label: "Income (UGX)",
        data: incomeData,
        backgroundColor: "#10B981",
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Expenses (UGX)",
        data: expenseData,
        backgroundColor: "#EF4444",
        borderColor: "#DC2626",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            weight: "500",
          },
          color: "#374151",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        cornerRadius: 8,
        displayColors: false,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: UGX ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (UGX)",
          color: "#6B7280",
          font: {
            size: 12,
            weight: "500",
          },
          padding: { top: 10 },
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          callback: function(value) {
            return `UGX ${value.toLocaleString()}`;
          },
        },
        grid: {
          color: "#F3F4F6",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#6B7280",
          font: {
            size: 12,
            weight: "500",
          },
          padding: { top: 10 },
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-6 h-6 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
          Income vs Expenses
        </h2>
      </div>
      <div className="relative h-64 sm:h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default IncomeExpenseChart;