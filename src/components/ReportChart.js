import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart2 } from "lucide-react";

const ReportChart = ({ chartData, reportType }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-6 h-6 text-blue-600" />
        <span className="text-lg font-semibold text-neutral-800">
          {reportType === "debts"
            ? "Debt Summary"
            : reportType === "sales"
            ? "Sales Summary"
            : reportType === "expenses"
            ? "Expense Summary"
            : "Bank Deposit Summary"}
        </span>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#4b5563" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#4b5563" }}
              tickFormatter={(value) =>
                value.toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                  minimumFractionDigits: 0,
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
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="amount"
              fill="#003366"
              radius={[4, 4, 0, 0]}
              name="Amount"
              barSize={40}
            />
            <Bar
              dataKey="count"
              fill="#60a5fa"
              radius={[4, 4, 0, 0]}
              name="Transaction Count"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {chartData.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {chartData.map((item, index) =>
              item.remarks?.map((remark, i) => (
                <li key={`${index}-${i}`}>{remark} on {item.date}</li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportChart;