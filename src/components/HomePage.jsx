import React, { useMemo } from "react";
import { format } from "date-fns";
import BalanceSummary from "./BalanceSummary";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

function HomePage({ sales, debts, expenses, clients, userId }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const dailySales = useMemo(
    () => sales.filter((s) => format(new Date(s.date), "yyyy-MM-dd") === today),
    [sales, today]
  );
  const totalSales = useMemo(
    () => dailySales.reduce((sum, s) => sum + s.totalAmount, 0),
    [dailySales]
  );
  const totalPaid = useMemo(
    () => dailySales.reduce((sum, s) => sum + s.amountPaid, 0),
    [dailySales]
  );
  const totalDebts = useMemo(
    () => debts.reduce((sum, d) => (d.status === "outstanding" ? sum + d.amount : sum), 0),
    [debts]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-neutral-700">Daily Sales</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-success-600" />
            <h3 className="text-lg font-semibold text-neutral-700">Total Paid</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-error-600" />
            <h3 className="text-lg font-semibold text-neutral-700">Outstanding Debts</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalDebts.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-700">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>
      <BalanceSummary sales={sales} debts={debts} expenses={expenses} />
    </div>
  );
}

export default HomePage;