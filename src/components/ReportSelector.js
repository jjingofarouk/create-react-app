import React from "react";

const ReportSelector = ({ reportType, setReportType }) => {
  return (
    <div className="w-full sm:w-64">
      <label className="form-label">Report Type</label>
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        className="form-input"
      >
        <option value="sales">Sales</option>
        <option value="debts">Debts</option>
        <option value="expenses">Expenses</option>
      </select>
    </div>
  );
};

export default ReportSelector;