import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Download, Calendar, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ReportsPage = ({ userId }) => {
  const [reportType, setReportType] = useState("debts");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let collectionPath;
        switch (reportType) {
          case "debts":
            collectionPath = `users/${userId}/debts`;
            break;
          case "sales":
            collectionPath = `users/${userId}/sales`;
            break;
          case "expenses":
            collectionPath = `users/${userId}/expenses`;
            break;
          default:
            return;
        }

        const q = collection(db, collectionPath);
        const snapshot = await getDocs(q);
        let items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          items = items.filter(item => {
            const itemDate = item.createdAt;
            return itemDate >= start && itemDate <= end;
          });
        }

        const calculatedTotals = items.reduce(
          (acc, item) => {
            acc.total += item.amount || 0;
            acc.count += 1;
            return acc;
          },
          { total: 0, count: 0 }
        );

        setData(items);
        setTotals(calculatedTotals);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [reportType, startDate, endDate, userId]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    const dateRangeText = startDate && endDate 
      ? `From: ${format(new Date(startDate), "MMM dd, yyyy")} To: ${format(new Date(endDate), "MMM dd, yyyy")}`
      : `All Time`;
    doc.setFontSize(12);
    doc.text(dateRangeText, 14, 30);
    
    const tableData = data.map(item => {
      if (reportType === "debts") {
        return [
          item.client || "-",
          (item.amount || 0).toLocaleString(),
          item.amount === 0 ? "Paid" : "Pending",
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      } else if (reportType === "sales") {
        return [
          item.client || "-",
          item.product || "-",
          item.quantity || 0,
          (item.amount || 0).toLocaleString(),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
        ];
      } else {
        return [
          item.category || "-",
          (item.amount || 0).toLocaleString(),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      }
    });

    autoTable(doc, {
      startY: 40,
      head: [
        reportType === "debts"
          ? ["Client", "Amount (UGX)", "Status", "Date", "Notes"]
          : reportType === "sales"
          ? ["Client", "Product", "Quantity", "Amount (UGX)", "Date"]
          : ["Category", "Amount (UGX)", "Date", "Notes"],
      ],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 40 },
    });

    doc.setFontSize(12);
    doc.text(
      `Total: ${totals.total.toLocaleString()} UGX | Count: ${totals.count}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save(`${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  // Prepare chart data
  const prepareChartData = () => {
    // Group data by date
    const groupedData = data.reduce((acc, item) => {
      const dateKey = format(item.createdAt, "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, amount: 0, count: 0 };
      }
      acc[dateKey].amount += item.amount || 0;
      acc[dateKey].count += 1;
      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Reports</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="debts">Debts</option>
            <option value="sales">Sales</option>
            <option value="expenses">Expenses</option>
          </select>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                {reportType === "debts" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount (UGX)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Notes</th>
                  </>
                ) : reportType === "sales" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount (UGX)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount (UGX)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Notes</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  {reportType === "debts" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.client || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{(item.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.amount === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.amount === 0 ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                        {format(item.createdAt, "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-800">{item.notes || "-"}</td>
                    </>
                  ) : reportType === "sales" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.client || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.product || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.quantity || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{(item.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                        {format(item.createdAt, "MMM dd, yyyy HH:mm")}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{item.category || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{(item.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                        {format(item.createdAt, "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-800">{item.notes || "-"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No {reportType} found for the selected period
          </div>
        )}

        <div className="mt-4 p-4 bg-neutral-50 rounded-md">
          <p className="text-sm font-medium text-neutral-700">
            Total: {totals.total.toLocaleString()} UGX | Count: {totals.count}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Insights</h3>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-neutral-700">
              {reportType === "debts" ? "Debt Summary" : reportType === "sales" ? "Sales Summary" : "Expense Summary"}
            </span>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} UGX`, 'Amount']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;