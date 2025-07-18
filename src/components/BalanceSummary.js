import React from "react";

function BalanceSummary({ transactions }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  return (
    <div className="balance-summary">
      <p>Total Income: UGX {income.toFixed(2)}</p>
      <p>Total Expenses: UGX {expenses.toFixed(2)}</p>
      <p>Balance: UGX {balance.toFixed(2)}</p>
    </div>
  );
}

export default BalanceSummary;
