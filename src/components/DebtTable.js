import React, { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Search, Table } from "lucide-react";
import { format } from "date-fns";

function DebtTable({ debts }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "client",
        header: "Debtor",
        cell: ({ row }) => row.original.client || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount (UGX)",
        cell: ({ row }) => (
          <span className="font-semibold text-neutral-800">
            UGX {(row.original.amount || 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => row.original.notes || "—",
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          try {
            return row.original.createdAt ? format(row.original.createdAt.toDate(), "MMM dd, yyyy") : "—";
          } catch (error) {
            return "Invalid Date";
          }
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: debts || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!debts || debts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-6 h-6 text-blue-600" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Debt Records
          </h2>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search debts..."
            className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all duration-200 text-sm text-neutral-800 placeholder-neutral-400"
          />
        </div>
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

export default DebtTable;