import React, { useState, useMemo } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
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
      <div className="transaction-table">
        <div className="table-header">
          <h2 className="table-title">Recent Transactions</h2>
        </div>
        <div className="empty-state">
          <p>No transactions yet. Add your first transaction above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-table">
      <div className="table-header">
        <h2 className="table-title">Recent Transactions</h2>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search transactions..."
            className="search-input"
          />
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "sortable" : ""}
                  >
                    <div className="header-content">
                      {header.column.columnDef.header}
                      <span className="sort-indicator">
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
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
