import React from "react";

const ReportTypeSelector = ({ reportType, setReportType, includeBank }) => {
  return (
    <select
      value={reportType}
      onChange={(e) => setReportType(e.target.value)}
      className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      <option value="debts">Debts</option>
      <option value="sales">Sales</option>
      <option value="expenses">Expenses</option>
      {includeBank && <option value="bank">Bank Deposits</option>}
    </select>
  );
};

export default ReportTypeSelector;