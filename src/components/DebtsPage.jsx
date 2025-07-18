// DebtsPage.jsx
import React, { useState } from "react";
import { db, addDoc, collection, deleteDoc, doc } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { DollarSign, BarChart, Search } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO, startOfDay } from "date-fns";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DebtTable({ debts, onMarkAsPaid }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      accessorKey: "debtor",
      header: "Debtor",
      cell: ({ row }) => row.original.debtor || "—",
    },
    {
      accessorKey: "amount",
      header: "Amount (UGX)",
      cell: ({ row }) => (
        <span className="font-semibold text-neutral-800">
          UGX {row.original.amount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => row.original.notes || "—",
    },
    {
      accessorKey: "timestamp",
      header: "Date & Time",
      cell: ({ row }) => {
        try {
          return new Date(row.original.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          return "Invalid Date";
        }
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => onMarkAsPaid(row.original.id)}
          className="px-3 py-1 bg-success-600 text-white rounded-lg text-sm hover:bg-success-800 transition-all duration-200"
        >
          Mark as Paid
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: debts || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);

  if (!debts || debts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Debt Records
          </h2>
        </div>
        <div className="flex items-center justify-center py-8 text-neutral-500 italic">
          <p>No debts recorded yet. Add your first debt above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Debt Records
          </h2>
        </div>
        <div className="text-sm font-semibold text-neutral-800">
          Total: UGX {totalDebt.toLocaleString()}
        </div>
      </div>
      <div className="relative max-w-xs w-full mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search debts..."
          className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm text-neutral-800 placeholder-neutral-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-3 py-3 bg-neutral-50 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b-2 border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors duration-200 ${
                      header.column.getCanSort() ? "" : "cursor-default"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {header.column.columnDef.header}
                      <span className="text-neutral-500 text-xs">
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted()] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50 transition-colors duration-200">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 border-b border-neutral-100 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DebtsPage({ debts, debtors, userId }) {
  const [debtor, setDebtor] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${userId}/debts`), {
        debtor: debtor || null,
        amount: parseFloat(amount),
        notes: notes || null,
        timestamp: new Date().toISOString(),
      });
      setDebtor("");
      setAmount("");
      setNotes("");
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("Error adding debt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (debtId) => {
    // Fixed: Use window.confirm instead of confirm to avoid ESLint error
    if (!window.confirm("Are you sure you want to mark this debt as paid?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, `users/${userId}/debts`, debtId));
    } catch (error) {
      console.error("Error marking debt as paid:", error);
      alert("Error marking debt as paid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Safely handle date filtering with proper error handling
  const todaysDebts = debts.filter((d) => {
    try {
      if (!d.timestamp) return false;
      const debtDate = new Date(d.timestamp);
      const today = new Date();
      return (
        debtDate.getFullYear() === today.getFullYear() &&
        debtDate.getMonth() === today.getMonth() &&
        debtDate.getDate() === today.getDate()
      );
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  });

  const totalTodaysDebt = todaysDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

  const highestDebts = [...debts]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3)
    .map((d) => ({ debtor: d.debtor || "Unknown", amount: d.amount || 0 }));

  const longestDebts = [...debts]
    .sort((a, b) => {
      try {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateA - dateB;
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 3)
    .map((d) => ({ debtor: d.debtor || "Unknown", timestamp: d.timestamp }));

  const totalDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);

  const chartData = {
    labels: ["Today's Debts", "Total Debts"],
    datasets: [
      {
        label: "Debt Amount (UGX)",
        data: [totalTodaysDebt, totalDebt],
        backgroundColor: ["#3B82F6", "#EF4444"],
        borderColor: ["#2563EB", "#DC2626"],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12, weight: "500" },
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
        padding: 10,
        callbacks: {
          label: (context) => `UGX ${context.parsed.y.toLocaleString()}`,
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
          font: { size: 12, weight: "500" },
          padding: { top: 10 },
        },
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
          callback: (value) => `UGX ${value.toLocaleString()}`,
        },
        grid: { color: "#F3F4F6" },
      },
      x: {
        title: {
          display: true,
          text: "Category",
          color: "#6B7280",
          font: { size: 12, weight: "500" },
          padding: { top: 10 },
        },
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Add Debt
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteInput
            value={debtor}
            onChange={setDebtor}
            suggestions={debtors}
            placeholder="Debtor Name (Person or Business)"
            disabled={loading}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">UGX</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
              disabled={loading}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:col-span-2 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            <DollarSign className="w-5 h-5" />
            {loading ? "Adding..." : "Add Debt"}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Debt Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Today's Debt</h3>
            <p className="text-lg font-bold text-neutral-800">
              UGX {totalTodaysDebt.toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Top Debtors</h3>
            <ul className="text-sm text-neutral-800">
              {highestDebts.map((d, i) => (
                <li key={i}>
                  {d.debtor}: UGX {d.amount.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Longest Debts</h3>
            <ul className="text-sm text-neutral-800">
              {longestDebts.map((d, i) => (
                <li key={i}>
                  {d.debtor}: {d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'Unknown date'}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative h-64 sm:h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <DebtTable debts={debts} onMarkAsPaid={handleMarkAsPaid} />
    </div>
  );
}

export default DebtsPage;
