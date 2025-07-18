import React, { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Search, Table } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function TransactionTable({ transactions }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className={`type-badge ${row.original.type}`}>
            {row.original.type.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount (UGX)",
        cell: ({ row }) => (
          <span className={`amount ${row.original.type}`}>
            UGX {row.original.amount.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => row.original.client || "—",
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original.category || "—",
      },
      {
        accessorKey: "timestamp",
        header: "Date",
        cell: ({ row }) => {
          try {
            return new Date(row.original.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          } catch (error) {
            return "Invalid Date";
          }
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Recent Transactions
          </h2>
        </div>
        <div className="flex items-center justify-center py-8 text-neutral-500 italic">
          <p>No transactions yet. Add your first transaction above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Recent Transactions
          </h2>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-sm text-neutral-800 placeholder-neutral-400"
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

export default TransactionTable;