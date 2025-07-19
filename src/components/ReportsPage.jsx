import React, { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { pdfMake } from "pdfmake/build/pdfmake";
import { Download, Calendar, X } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportsPage = ({ sales, debts, expenses, products }) => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const today = new Date();
    switch (dateRange) {
      case "today":
        setStartDate(startOfDay(today));
        setEndDate(endOfDay(today));
        break;
      case "week":
        setStartDate(startOfWeek(today));
        setEndDate(endOfWeek(today));
        break;
      case "month":
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case "custom":
        break;
      default:
        break;
    }
  }, [dateRange]);

  const filteredData = {
    sales: sales.filter(s => {
      const saleDate = s.date.toDate();
      return saleDate >= startDate && saleDate <= endDate;
    }),
    debts: debts.filter(d => {
      const debtDate = d.createdAt.toDate();
      return debtDate >= startDate && debtDate <= endDate;
    }),
    expenses: expenses.filter(e => {
      const expenseDate = e.date.toDate();
      return expenseDate >= startDate && expenseDate <= endDate;
    }),
  };

  const totalSales = filteredData.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalPaid = filteredData.sales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
  const totalDebts = filteredData.debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
  const totalExpenses = filteredData.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const balance = totalPaid - totalExpenses;

  const createGradient = (ctx, chartArea, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  const salesChartData = {
    labels: ["Sales", "Paid", "Debts"],
    datasets: [
      {
        label: "Amount (UGX)",
        data: [totalSales, totalPaid, totalDebts],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;
          return createGradient(ctx, chartArea, "rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.3)");
        },
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 8,
        barThickness: 40,
        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const expensesChartData = {
    labels: filteredData.expenses.map(e => e.category),
    datasets: [
      {
        data: filteredData.expenses.map(e => e.amount),
        backgroundColor: [
          (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, chartArea, "rgba(255, 99, 132, 0.8)", "rgba(255, 99, 132, 0.3)");
          },
          (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, chartArea, "rgba(54, 162, 235, 0.8)", "rgba(54, 162, 235, 0.3)");
          },
          (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, chartArea, "rgba(255, 206, 86, 0.8)", "rgba(255, 206, 86, 0.3)");
          },
          (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, chartArea, "rgba(75, 192, 192, 0.8)", "rgba(75, 192, 192, 0.3)");
          },
          (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, chartArea, "rgba(153, 102, 255, 0.8)", "rgba(153, 102, 255, 0.3)");
          },
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
        hoverOffset: 20,
      },
    ],
  };

  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, style: "header" },
        { text: `Date Range: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`, style: "subheader" },
        "\n",
        ...getReportContent(),
        "\n",
        { text: `Total ${reportType}: UGX ${getTotal().toLocaleString()}`, style: "total" },
        reportType !== "expenses" && { text: `Balance: UGX ${balance.toLocaleString()}`, style: "balance" },
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
          margin: [0, 10, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "black",
        },
        total: {
          bold: true,
          fontSize: 14,
          margin: [0, 10, 0, 0],
        },
        balance: {
          bold: true,
          fontSize: 14,
          margin: [0, 10, 0, 0],
          color: balance >= 0 ? "green" : "red",
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`${reportType}_report_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const getReportContent = () => {
    switch (reportType) {
      case "sales":
        return [
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*", "*", "*"],
              body: [
                [
                  { text: "Client", style: "tableHeader" },
                  { text: "Products", style: "tableHeader" },
                  { text: "Total Quantity", style: "tableHeader" },
                  { text: "Total", style: "tableHeader" },
                  { text: "Status", style: "tableHeader" },
                  { text: "Date", style: "tableHeader" },
                ],
                ...filteredData.sales.map(sale => [
                  sale.client || "-",
                  sale.products?.map(p => products.find(prod => prod.id === p.productId)?.name || "Unknown").join(", ") || "-",
                  sale.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0,
                  `UGX ${(sale.totalAmount || 0).toLocaleString()}`,
                  sale.paymentStatus || "unpaid",
                  sale.date ? format(sale.date.toDate(), "MMM dd, yyyy") : "-",
                ]),
              ],
            },
          },
        ];
      case "debts":
        return [
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*"],
              body: [
                [
                  { text: "Debtor", style: "tableHeader" },
                  { text: "Amount", style: "tableHeader" },
                  { text: "Status", style: "tableHeader" },
                  { text: "Date", style: "tableHeader" },
                ],
                ...filteredData.debts.map(debt => [
                  debt.client || "-",
                  `UGX ${(debt.amount || 0).toLocaleString()}`,
                  debt.amount === 0 ? "Paid" : "Pending",
                  debt.createdAt ? format(debt.createdAt.toDate(), "MMM dd, yyyy") : "-",
                ]),
              ],
            },
          },
        ];
      case "expenses":
        return [
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*"],
              body: [
                [
                  { text: "Category", style: "tableHeader" },
                  { text: "Amount", style: "tableHeader" },
                  { text: "Description", style: "tableHeader" },
                  { text: "Date", style: "tableHeader" },
                ],
                ...filteredData.expenses.map(expense => [
                  expense.category || "-",
                  `UGX ${(expense.amount || 0).toLocaleString()}`,
                  expense.description || "-",
                  expense.date ? format(expense.date.toDate(), "MMM dd, yyyy") : "-",
                ]),
              ],
            },
          },
        ];
      default:
        return [];
    }
  };

  const getTotal = () => {
    switch (reportType) {
      case "sales":
        return totalSales;
      case "debts":
        return totalDebts;
      case "expenses":
        return totalExpenses;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Reports</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Report Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="sales">Sales</option>
                  <option value="debts">Debts</option>
                  <option value="expenses">Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateRange === "custom" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={format(startDate, "yyyy-MM-dd")}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={format(endDate, "yyyy-MM-dd")}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Summary</h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Date Range</p>
                  <p className="font-medium">
                    {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Total Sales</p>
                  <p className="font-medium">UGX {totalSales.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Total Paid</p>
                  <p className="font-medium">UGX {totalPaid.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Total Debts</p>
                  <p className="font-medium">UGX {totalDebts.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Total Expenses</p>
                  <p className="font-medium">UGX {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">Balance</p>
                  <p className={`font-medium ${balance >= 0 ? "text-success-600" : "text-error-600"}`}>
                    UGX {balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Visualizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-neutral-700 mb-2">Sales Overview</h4>
            <div className="h-64">
              <Bar
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Sales, Paid Amount, and Debts",
                    },
                  },
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-neutral-700 mb-2">Expenses Breakdown</h4>
            <div className="h-64">
              <Pie
                data={expensesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                    title: {
                      display: true,
                      text: "Expenses by Category",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;