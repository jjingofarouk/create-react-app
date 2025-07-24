import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";

const KeyMetrics = ({ filteredExpenses, dateFilter }) => {
  const keyMetrics = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      return {
        totalExpenses: 0,
        thisMonthTotal: 0,
        highestExpense: { amount: 0, description: "N/A" },
        topCategory: { name: "N/A", total: 0 },
        avgExpense: 0,
        expenseCount: 0
      };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    const thisMonthExpenses = filteredExpenses.filter(expense => {
      if (!expense.createdAt) return false;
      const expenseDate = expense.createdAt.toDate ? expense.createdAt.toDate() : new Date(expense.createdAt);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    const highestExpense = filteredExpenses.reduce((max, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return amount > max.amount ? { amount, description: expense.description || "N/A" } : max;
    }, { amount: 0, description: "N/A" });

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || "Uncategorized";
      const amount = parseFloat(expense.amount) || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [name, total]) => total > max.total ? { name, total } : max,
      { name: "N/A", total: 0 }
    );

    const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    return {
      totalExpenses,
      thisMonthTotal,
      highestExpense,
      topCategory,
      avgExpense,
      expenseCount: filteredExpenses.length
    };
  }, [filteredExpenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            TOTAL
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          UGX {keyMetrics.totalExpenses.toLocaleString()}
        </h3>
        <p className="text-gray-500 text-sm">{dateFilter.type === 'all' ? 'All time expenses' : `Expenses for ${dateFilter.type}`}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            THIS MONTH
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          UGX {keyMetrics.thisMonthTotal.toLocaleString()}
        </h3>
        <p className="text-gray-500 text-sm">{format(new Date(), 'MMMM yyyy')}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            HIGHEST
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          UGX {keyMetrics.highestExpense.amount.toLocaleString()}
        </h3>
        <p className="text-gray-500 text-sm truncate">
          {keyMetrics.highestExpense.description}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            TOP CATEGORY
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          UGX {keyMetrics.topCategory.total.toLocaleString()}
        </h3>
        <p className="text-gray-500 text-sm">
          {keyMetrics.topCategory.name}
        </p>
      </div>
    </div>
  );
};

export default KeyMetrics;