import React from "react";

const ReportSummary = ({ totals, reportType }) => {
  return (
    <div className="mt-4 p-4 bg-neutral-50 rounded-md">
      <p className="text-sm font-medium text-neutral-700">
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