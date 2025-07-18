import React from "react";
import { format, parseISO } from "date-fns";

function IncomeExpenseChart({ transactions }) {
  const groupedData = transactions.reduce((acc, trans) => {
    const date = format(parseISO(trans.timestamp), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = { income: 0, expense: 0 };
    acc[date][trans.type] += trans.amount;
    return acc;
  }, {});

  const labels = Object.keys(groupedData).sort();
  const incomeData = labels.map((date) => groupedData[date].income);
  const expenseData = labels.map((date) => groupedData[date].expense);

  const chartData = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income (UGX)",
          data: incomeData,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses (UGX)",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Amount (UGX)" },
        },
        x: { title: { display: true, text: "Date" } },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2>Income vs Expenses</h2>
      ```chartjs
      {chartData}
      ```
    </div>
  );
}

export default IncomeExpenseChart;
