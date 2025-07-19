import React from "react";

const ReportSummary = ({ totals, reportType }) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm font-semibold text-gray-700">
        Total: {totals.total.toLocaleString("en-UG", {
          style: "currency",
          currency: "UGX",
        })} | Count: {totals.count}
        {reportType === "debts" &&
          ` | Paid: ${totals.paid} | Pending: ${totals.pending}`}
      </p>
    </div>
  );
};

export default ReportSummary;