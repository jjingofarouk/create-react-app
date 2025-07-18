// src/components/ReportsPage.jsx
import React, { useState, useMemo } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { FileText } from "lucide-react";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function ReportsPage({ sales, debts, expenses, userId }) {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("today");

  const filteredData = useMemo(() => {
    const today = new Date();
    let filteredSales = sales;
    let filteredDebts = debts;
    let filteredExpenses = expenses;

    if (dateRange === "today") {
      filteredSales = sales.filter(
        (s) => new Date(s.date) >= startOfDay(today) && new Date(s.date) <= endOfDay(today)
      );
      filteredDebts = debts.filter(
        (d) => new Date(d.date) >= startOfDay(today) && new Date(d.date) <= endOfDay(today)
      );
      filteredExpenses = expenses.filter(
        (e) => new Date(e.date) >= startOfDay(today) && new Date(e.date) <= endOfDay(today)
      );
    } else if (dateRange === "week") {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      filteredSales = sales.filter(
        (s) => new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd
      );
      filteredDebts = debts.filter(
        (d) => new Date(d.date) >= weekStart && new Date(d.date) <= weekEnd
      );
      filteredExpenses = expenses.filter(
        (e) => new Date(e.date) >= weekStart && new Date(e.date) <= weekEnd
      );
    } else if (dateRange === "month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      filteredSales = sales.filter(
        (s) => new Date(s.date) >= monthStart && new Date(s.date) <= monthEnd
      );
      filteredDebts = debts.filter(
        (d) => new Date(d.date) >= monthStart && new Date(d.date) <= monthEnd
      );
      filteredExpenses = expenses.filter(
        (e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd
      );
    }

    return { sales: filteredSales, debts: filteredDebts, expenses: filteredExpenses };
  }, [sales, debts, expenses, dateRange]);

  const generateReport = () => {
    const docDefinition = {
      content: [
        { text: "Product Distribution Report", style: "header" },
        { text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, style: "subheader" },
        { text: `Date Range: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, style: "subheader" },
        { text: "", margin: [0, 10] },
        reportType === "sales" && {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                "Client",
                "Product",
                "Quantity",
                "Unit Price",
                "Discount",
                "Total",
                "Paid",
                "Debt",
                "Date",
              ],
              ...filteredData.sales.map((s) => [
                s.client,
                s.product,
                s.quantity,
                `UGX ${s.unitPrice.toLocaleString()}`,
                `UGX ${s.discount.toLocaleString()}`,
                `UGX ${s.totalAmount.toLocaleString()}`,
                `UGX ${s.amountPaid.toLocaleString()}`,
                `UGX ${s.remainingDebt.toLocaleString()}`,
                format(new Date(s.date), "PP"),
              ]),
            ],
          },
        },
        reportType === "debts" && {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "auto", "auto"],
            body: [
              ["Debtor", "Amount", "Status", "Notes", "Date"],
              ...filteredData.debts.map((d) => [
                d.debtor,
                `UGX ${d.amount.toLocaleString()}`,
                d.status,
                d.notes,
                format(new Date(d.date), "PP"),
              ]),
            ],
          },
        },
        reportType === "expenses" && {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "auto", "auto"],
            body: [
              ["Category", "Amount", "Description", "Payee", "Date"],
              ...filteredData.expenses.map((e) => [
                e.category,
                `UGX ${e.amount.toLocaleString()}`,
                e.description,
                e.payee || "-",
                format(new Date(e.date), "PP"),
              ]),
            ],
          },
        },
        { text: "", margin: [0, 10] },
        {
          text: "Balance Sheet",
          style: "subheader",
        },
        {
          ul: [
            `Total Sales: UGX ${filteredData.sales
              .reduce((sum, s) => sum + s.totalAmount, 0)
              .toLocaleString()}`,
            `Total Paid: UGX ${filteredData.sales
              .reduce((sum, s) => sum + s.amountPaid, 0)
              .toLocaleString()}`,
            `Total Outstanding Debts: UGX ${filteredData.debts
              .reduce((sum, d) => (d.status === "outstanding" ? sum + d.amount : sum), 0)
              .toLocaleString()}`,
            `Total Expenses: UGX ${filteredData.expenses
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()}`,
            `Net Balance: UGX ${(
              filteredData.sales.reduce((sum, s) => sum + s.amountPaid, 0) -
              filteredData.expenses.reduce((sum, e) => sum + e.amount, 0)
            ).toLocaleString()}`,
          ],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${reportType}_report_${dateRange}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary" />
        Reports
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          >
            <option value="sales">Sales</option>
            <option value="debts">Debts</option>
            <option value="expenses">Expenses</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button
          onClick={generateReport}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Generate PDF Report
        </button>
      </div>
    </div>
  );
}

export default ReportsPage;
