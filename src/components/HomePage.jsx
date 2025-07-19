import React, { useState, useEffect } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { CreditCard, ShoppingCart, TrendingDown, AlertCircle } from "lucide-react";

const HomePage = ({ sales, debts, expenses, clients, products, categories }) => {
  const [todaySales, setTodaySales] = useState([]);
  const [todayDebts, setTodayDebts] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState([]);

  useEffect(() => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    setTodaySales(
      sales.filter(s => {
        const saleDate = s.date.toDate();
        return saleDate >= todayStart && saleDate <= todayEnd;
      })
    );

    setTodayDebts(
      debts.filter(d => {
        const debtDate = d.createdAt.toDate();
        return debtDate >= todayStart && debtDate <= todayEnd;
      })
    );

    setTodayExpenses(
      expenses.filter(e => {
        const expenseDate = e.date.toDate();
        return expenseDate >= todayStart && expenseDate <= todayEnd;
      })
    );
  }, [sales, debts, expenses]);

  const totalTodaySales = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalTodayPaid = todaySales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
  const totalTodayDebts = todayDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
  const totalTodayExpenses = todayExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const todayBalance = totalTodayPaid - totalTodayExpenses;

  const salesChart = {
    type: 'bar',
    data: {
      labels: ["Sales", "Paid", "Debts"],
      datasets: [
        {
          label: "Amount (UGX)",
          data: [totalTodaySales, totalTodayPaid, totalTodayDebts],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Today's Sales, Paid Amount, and Debts",
        },
      },
    }
  };

  const expensesChart = {
    type: 'pie',
    data: {
      labels: todayExpenses.map(e => e.category),
      datasets: [
        {
          data: todayExpenses.map(e => e.amount),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: true,
          text: "Today's Expenses by Category",
        },
      },
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Today's Sales</p>
              <p className="text-2xl font-bold">UGX {totalTodaySales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Today's Paid</p>
              <p className="text-2xl font-bold">UGX {totalTodayPaid.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-full">
              <CreditCard className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Today's Debts</p>
              <p className="text-2xl font-bold">UGX {totalTodayDebts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-error/10 rounded-full">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Today's Expenses</p>
              <p className="text-2xl font-bold">UGX {totalTodayExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-full">
              <TrendingDown className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-neutral-700 mb-2">Sales Overview</h4>
            <div className="h-64">
              {salesChart}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-neutral-700 mb-2">Expenses Breakdown</h4>
            <div className="h-64">
              {expensesChart}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Today's Balance</p>
            <p className={`text-2xl font-bold ${todayBalance >= 0 ? "text-success-600" : "text-error-600"}`}>
              UGX {todayBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;