// src/components/reports/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { format, startOfDay } from "date-fns";
import DateFilter from "./reports/DateFilter";
import PDFGenerator from "./reports/PDFGenerator";
import useFirestoreData from "./reports/useFirestoreData";

const ReportsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = format(startOfDay(new Date()), "yyyy-MM-dd");
  const [dateFilter, setDateFilter] = useState({
    type: "today",
    startDate: today,
    endDate: today,
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  const { sales, debts, expenses, clients, products, categories, bankDeposits, supplies } = useFirestoreData(user, setLoading);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setError("Please log in to generate reports.");
      }
    });
    return () => unsubscribe();
  }, []);

  const safeData = {
    sales: Array.isArray(sales) ? sales : [],
    debts: Array.isArray(debts) ? debts : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    bankDeposits: Array.isArray(bankDeposits) ? bankDeposits : [],
    supplies: Array.isArray(supplies) ? supplies : [],
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-auto bg-white p-6">
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Financial Reports
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
            Generate comprehensive reports to analyze your business performance across sales, debts, expenses, and bank deposits.
          </p>
        </div>
      </div>

      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
      />

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Generate Consolidated Report</h2>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Loading data...</p>
          </div>
        ) : user ? (
          <PDFGenerator
            reportType="consolidated"
            dateFilter={dateFilter}
            data={safeData}
            clients={safeClients}
            products={safeProducts}
            categories={safeCategories}
            userId={user.uid}
            setError={setError}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ReportsPage;