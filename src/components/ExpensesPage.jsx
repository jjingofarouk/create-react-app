// src/components/ExpensesPage.jsx
import React, { useState, useMemo } from "react";
import ExpenseForm from "./ExpenseForm";
import TransactionTable from "./TransactionTable";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { TrendingDown } from "lucide-react";

function ExpensesPage({ expenses, categories, payees, userId }) {
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("all");

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    if (filterCategory) {
      filtered = filtered.filter((e) => e.category.toLowerCase().includes(filterCategory.toLowerCase()));
    }
    if (filterDate === "today") {
      const today = new Date();
      filtered = filtered.filter(
        (e) => new Date(e.date) >= startOfDay(today) && new Date(e.date) <= endOfDay(today)
      );
    } else if (filterDate === "week") {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      filtered = filtered.filter(
        (e) => new Date(e.date) >= weekStart && new Date(e.date) <= weekEnd
      );
    } else if (filterDate === "month") {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      filtered = filtered.filter(
        (e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd
      );
    }
    return filtered;
  }, [expenses, filterCategory, filterDate]);

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
        <TrendingDown className="w-6 h-6 text-primary" />
        Expenses
      </h2>
      <ExpenseForm categories={categories} payees={payees} userId={userId} />
      <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700">Total Expenses</h3>
        <p className="text-2xl font-bold text-neutral-800 mt-2">
          UGX {totalExpenses.toLocaleString()}
        </p>
      </div>
      <TransactionTable expenses={filteredExpenses} userId={userId} />
    </div>
  );
}

export default ExpensesPage;
