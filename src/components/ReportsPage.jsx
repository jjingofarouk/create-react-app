import React, { useState } from "react";
import { format, startOfDay } from "date-fns";
import DateRangeSelector from "./DateRangeSelector";
import PDFGenerator from "./PDFGenerator";

const ReportsPage = ({ sales, debts, expenses, clients, products, categories, bankDeposits, depositors, userId }) => {
  const today = format(startOfDay(new Date()), "yyyy-MM-dd");
  const [dateFilter, setDateFilter] = useState({
    type: "today",
    startDate: today,
    endDate: today,
  });

  const safeData = {
    sales: Array.isArray(sales) ? sales : [],
    debts: Array.isArray(debts) ? debts : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    bankDeposits: Array.isArray(bankDeposits) ? bankDeposits : [],
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeDepositors = Array.isArray(depositors) ? depositors : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Generate Consolidated Report</h2>
        <DateRangeSelector dateFilter={dateFilter} setDateFilter={setDateFilter} />
        <PDFGenerator
          reportType="consolidated"
          dateFilter={dateFilter}
          data={safeData}
          clients={safeClients}
          products={safeProducts}
          categories={safeCategories}
          bankDeposits={safeData.bankDeposits}
          depositors={safeDepositors}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default ReportsPage;