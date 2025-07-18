import React, { useState } from "react";
import { FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

function ReportsPage({ transactions, debts, userId }) {
  const [reportType, setReportType] = useState("transactions");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("Start date must be before end date.");
      return;
    }

    let data = [];
    let title = "";
    let columns = [];

    if (reportType === "transactions") {
      data = transactions.filter((t) => {
        try {
          const date = parseISO(t.timestamp);
          return date >= start && date <= end;
        } catch {
          return false;
        }
      });
      title = "Transactions Report";
      columns = ["Type", "Amount (UGX)", "Client", "Category", "Date & Time"];
    } else if (reportType === "debts") {
      data = debts.filter((d) => {
        try {
          const date = parseISO(d.timestamp);
          return date >= start && date <= end;
        } catch {
          return false;
        }
      });
      title = "Debts Report";
      columns = ["Debtor", "Amount (UGX)", "Notes", "Date & Time"];
    }

    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

    return { title, data, columns, total };
  };

  const generatePDF = () => {
    const { title, data, columns, total } = generateReport();
    if (!data.length) {
      alert("No data found for the selected period.");
      return;
    }

    const docDefinition = {
      content: [
        { text: title, style: "header" },
        { text: `Period: ${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`, style: "subheader" },
        { text: `Total: UGX ${total.toLocaleString()}`, style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: reportType === "transactions" ? ["auto", "auto", "*", "*", "*"] : ["*", "auto", "*", "*"],
            body: [
              columns,
              ...data.map((item) =>
                reportType === "transactions"
                  ? [
                      item.type.toUpperCase(),
                      `UGX ${item.amount.toLocaleString()}`,
                      item.client || "—",
                      item.category || "—",
                      new Date(item.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ]
                  : [
                      item.debtor || "—",
                      `UGX ${item.amount.toLocaleString()}`,
                      item.notes || "—",
                      new Date(item.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ]
              ),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, margin: [0, 5, 0, 5] },
      },
    };

    const pdfMake = require("pdfmake/build/pdfmake");
    const pdfFonts = require("pdfmake/build/vfs_fonts");
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.createPdf(docDefinition).download(`${title.replace(/\s+/g, "_").toLowerCase()}_${startDate}_${endDate}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
          Generate Report
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800"
        >
          <option value="transactions">Transactions</option>
          <option value="debts">Debts</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800"
        />
        <button
          onClick={generatePDF}
          disabled={loading}
          className="w-full sm:col-span-2 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:shadow-none disabled:hover:translate-y-0"
        >
          <FileText className="w-5 h-5" />
          {loading ? "Generating..." : "Generate PDF Report"}
        </button>
      </div>
    </div>
  );
}

export default ReportsPage;
