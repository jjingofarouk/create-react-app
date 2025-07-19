import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit, Search, X } from "lucide-react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import ExpenseForm from "./ExpenseForm";

const ExpensesPage = ({ expenses, categories, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState(expenses || []);

  useEffect(() => {
    const filtered = (expenses || []).filter(expense => {
      const matchesCategory = expense.category?.toLowerCase().includes(filter.toLowerCase());
      const matchesPayee = expense.payee?.toLowerCase().includes(filter.toLowerCase());
      return matchesCategory || matchesPayee;
    });
    setFilteredExpenses(filtered);
  }, [filter, expenses]);

  const columns = [
    {
      header: "Category",
      accessorKey: "category",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: info => (info.getValue() || 0).toLocaleString(),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Payee",
      accessorKey: "payee",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info => info.getValue() ? format(info.getValue(), 'MMM dd, yyyy') : '-',
    },
    {
      header: "Actions",
      cell: info => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingExpense(info.row.original);
              setShowForm(true);
            }}
            className="p-1 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteExpense(info.row.original.id)}
            className="p-1 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    columns,
    data: filteredExpenses,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/expenses`, id));
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Expenses Tracking</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            {filter && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 cursor-pointer"
                onClick={() => setFilter("")}
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-neutral-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {filter ? "No matching expenses found" : "No expenses recorded yet"}
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          userId={userId}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpensesPage;