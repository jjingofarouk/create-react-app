import React from "react";

const ReportTypeSelector = ({ reportType, setReportType, includeBank }) => {
  return (
    <select
      value={reportType}
      onChange={(e) => setReportType(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
    >
      <option value="debts">Debts</option>
      <option value="sales">Sales</option>
      <option value="expenses">Expenses</option>
      {includeBank && <option value="bank">Bank Deposits</option>}
    </select>
  );
};

export default ReportTypeSelector;