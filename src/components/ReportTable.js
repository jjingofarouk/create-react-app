import React from "react";
import { flexRender } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";

const ReportTable = ({ table, reportType }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ minWidth: header.column.columnDef.minSize }}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <div className="flex flex-col">
                        {header.column.getIsSorted() === "desc" && (
                          <ChevronDown className="w-4 h-4 text-blue-500" />
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ChevronUp className="w-4 h-4 text-blue-500" />
                        )}
                        {!header.column.getIsSorted() && (
                          <div className="w-4 h-4 opacity-30">
                            <ChevronUp className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                  style={{ minWidth: cell.column.columnDef.minSize }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;