// src/components/DebtsPage.jsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit, Search, X, CreditCard } from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import DebtForm from "./DebtForm";

const DebtsPage = ({ debts, sales, clients, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredDebts, setFilteredDebts] = useState(debts);

  useEffect(() => {
    const filtered = debts.filter(debt => {
      const matchesDebtor = debt.debtor?.toLowerCase().includes(filter.toLowerCase());
      return matchesDebtor;
    });
    setFilteredDebts(filtered);
  }, [filter, debts]);

  const columns = [
    {
      header: "Debtor",
      accessorKey: "debtor",
      cell: info => info.getValue(),
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: info => info.getValue().toLocaleString(),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          info.getValue() === 'paid' ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
        }`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: info => format(info.getValue().toDate(), 'MMM dd, yyyy'),
    },
    {
      header: "Actions",
      cell: info => (
        <div className="flex gap-2">
          {info.row.original.status !== 'paid' && (
            <>
              <button
                onClick={() => {
                  setEditingDebt(info.row.original);
                  setShowForm(true);
                }}
                className="p-1 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const table = useTable({
    columns,
    data: filteredDebts,
  });

  const handleDeleteDebt = async (id) => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/debts`, id));
      } catch (err) {
        console.error("Error deleting debt:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Debts Management</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingDebt(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Debt</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search debts..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
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
                      {header.column.columnDef.header}
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
                      {cell.renderCell()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDebts.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {filter ? "No matching debts found" : "No debts recorded yet"}
          </div>
        )}
      </div>

      {showForm && (
        <DebtForm
          debt={editingDebt}
          clients={clients}
          userId={userId}
          onClose={() => {
            setShowForm(false);
            setEditingDebt(null);
          }}
        />
      )}
    </div>
  );
};

export default DebtsPage;