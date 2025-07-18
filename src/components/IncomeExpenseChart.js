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
      <div className="chart-container">
        <h2 className="chart-title">Income vs Expenses</h2>
        <div className="no-data">
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
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        cornerRadius: 8,
        displayColors: false,
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
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">Income vs Expenses</h2>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default IncomeExpenseChart;
