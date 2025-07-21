import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

function BalanceSummary({ sales, expenses }) {
  const income = sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = income - expenseTotal;

  const formatCurrency = (amount) => `UGX ${amount.toLocaleString()}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-4 sm:mb-6">
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg border border-success-200 bg-success-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-2 bg-secondary text-white rounded-md">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-500">Total Income</h3>
            <p className="text-lg sm:text-xl font-bold text-neutral-800">
              {formatCurrency(income)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-lg border border-error-200 bg-error-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="p-2 bg-danger text-white rounded-md">
            <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-500">Total Expenses</h3>
            <p className="text-lg sm:text-xl font-bold text-neutral-800">
              {formatCurrency(expenseTotal)}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${balance >= 0 ? 'border-blue-200 bg-blue-50' : 'border-error-200 bg-error-50'} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
          <div className={`p-2 ${balance >= 0 ? 'bg-primary' : 'bg-danger'} text-white rounded-md`}>
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-500">Net Balance</h3>
            <p className="text-lg sm:text-xl font-bold text-neutral-800">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceSummary;
