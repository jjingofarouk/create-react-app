import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart2 } from "lucide-react";

const ReportChart = ({ chartData, reportType }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-neutral-700">
          {reportType === "debts"
            ? "Debt Summary"
            : reportType === "sales"
            ? "Sales Summary"
            : reportType === "expenses"
            ? "Expense Summary"
            : "Bank Deposit Summary"}
        </span>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                value.toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                })
              }
            />
            <Tooltip
              formatter={(value) =>
                `${value.toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                })}`
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar
              dataKey="amount"
              fill="#003366"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportChart;