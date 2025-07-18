import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

function BalanceSummary({ transactions }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <div className="balance-summary">
      <h2 className="summary-title">Financial Overview</h2>
      <div className="summary-grid">
        <div className="summary-card income">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Income</h3>
            <p className="card-amount">{formatCurrency(income)}</p>
          </div>
        </div>
        
        <div className="summary-card expense">
          <div className="card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total Expenses</h3>
            <p className="card-amount">{formatCurrency(expenses)}</p>
          </div>
        </div>
        
        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3 className="card-title">Net Balance</h3>
            <p className="card-amount">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceSummary;
