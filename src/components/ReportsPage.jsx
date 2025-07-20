import React, { useState } from "react";
import ReportSelector from "./ReportSelector";
import DateRangeSelector from "./DateRangeSelector"; // Updated import
import ReportTable from "./ReportTable";
import PDFGenerator from "./PDFGenerator";

const ReportsPage = ({ sales, debts, expenses, clients, products, categories, userId }) => {
  const [reportType, setReportType] = useState("sales");
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: "",
    endDate: "",
  });

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-neutral-800">Reports</h2>
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4 sm:p-6">
        <div className="mobile-stack items-start sm:items-center">
          <ReportSelector reportType={reportType} setReportType={setReportType} />
          <DateRangeSelector dateFilter={dateFilter} setDateFilter={setDateFilter} />
          <PDFGenerator
            reportType={reportType}
            dateFilter={dateFilter}
            data={{ sales, debts, expenses }}
            clients={clients}
            products={products}
            categories={categories}
            userId={userId}
          />
        </div>
        <ReportTable
          reportType={reportType}
          dateFilter={dateFilter}
          data={{ sales, debts, expenses }}
        />
      </div>
    </div>
  );
};

export default ReportsPage;