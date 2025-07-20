import React, { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

const ReportTable = ({ reportType, dateFilter, data }) => {
  const filteredData = useMemo(() => {
    const dataset = reportType === "sales" ? data.sales : reportType === "debts" ? data.debts : data.expenses;
    if (!dataset || !Array.isArray(dataset)) return [];

    if (dateFilter.type === "all") return dataset;

    const start = dateFilter.startDate ? parseISO(dateFilter.startDate) : null;
    const end = dateFilter.endDate ? parseISO(dateFilter.endDate) : null;

    if (!start || !end) return dataset;

    return dataset.filter(item => {
      if (!item.createdAt) return false;
      const itemDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      return isWithinInterval(itemDate, { start: startOfDay(start), end: endOfDay(end) });
    });
  }, [data, reportType, dateFilter]);

  const columns = useMemo(() => {
    if (reportType === "sales") {
      return [
        { header: "Client", accessorKey: "client", cell: info => info.getValue() || "-" },
        { header: "Product", accessorKey: "product", cell: info => info.getValue() || "-" },
        { header: "Quantity", accessorKey: "quantity", cell: info => info.getValue() || 0 },
        { header: "Amount (UGX)", accessorKey: "amount", cell: info => (info.getValue() || 0).toLocaleString() },
        { header: "Date", accessorKey: "createdAt", cell: info => info.getValue() ? format(info.getValue().toDate(), "MMM dd, yyyy") : "-" },
      ];
    } else if (reportType === "debts") {
      return [
        { header: "Debtor", accessorKey: "client", cell: info => info.getValue() || "-" },
        { header: "Amount (UGX)", accessorKey: "amount", cell: info => (info.getValue() || 0).toLocaleString() },
        {
          header: "Status",
          accessorKey: "amount",
          cell: info => (
            <span className={`badge ${info.getValue() === 0 ? "badge-success" : "badge-danger"}`}>
              {info.getValue() === 0 ? "Paid" : "Pending"}
            </span>
          ),
        },
        { header: "Date", accessorKey: "createdAt", cell: info => info.getValue() ? format(info.getValue().toDate(), "MMM dd, yyyy") : "-" },
      ];
    } else {
      return [
        { header: "Category", accessorKey: "category", cell: info => info.getValue() || "-" },
        { header: "Amount (UGX)", accessorKey: "amount", cell: info => (typeof info.getValue() === "number" ? info.getValue() : parseFloat(info.getValue()) || 0).toLocaleString() },
        { header: "Description", accessorKey: "description", cell: info => info.getValue() || "-" },
        { header: "Payee", accessorKey: "payee", cell: info => info.getValue() || "-" },
        { header: "Date", accessorKey: "createdAt", cell: info => info.getValue() ? format(info.getValue().toDate(), "MMM dd, yyyy") : "-" },
      ];
    }
  }, [reportType]);

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-responsive mt-6">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-neutral-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          {dateFilter.type !== "all" ? "No matching records found" : `No ${reportType} recorded yet`}
        </div>
      )}
    </div>
  );
};

export default ReportTable;