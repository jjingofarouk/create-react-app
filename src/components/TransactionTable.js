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
        cell: ({ row }) => row.original.type.toUpperCase(),
      },
      {
        accessorKey: "amount",
        header: "Amount (UGX)",
        cell: ({ row }) => `UGX ${row.original.amount.toFixed(2)}`,
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => row.original.client || "N/A",
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original.category || "N/A",
      },
      {
        accessorKey: "timestamp",
        header: "Date",
        cell: ({ row }) => new Date(row.original.timestamp).toLocaleDateString(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!transactions.length) {
    return <Skeleton count={5} height={40} />;
  }

  return (
    <div className="transaction-table">
      <div className="table-toolbar">
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
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.column.columnDef.header}
                  {{
                    asc: " ↑",
                    desc: " ↓",
                  }[header.column.getIsSorted()] ?? null}
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
  );
}

export default TransactionTable;
