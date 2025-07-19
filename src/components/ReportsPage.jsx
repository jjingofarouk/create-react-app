import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Download, Calendar, BarChart2 } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ReportHeader from "./ReportHeader";
import DateRangeSelector from "./DateRangeSelector";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";
import ReportSummary from "./ReportSummary";
import ReportTypeSelector from "./ReportTypeSelector";

const ReportsPage = ({ userId, sales, debts, expenses, bankDeposits, depositors }) => {
  const [reportType, setReportType] = useState("debts");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0, paid: 0, pending: 0 });
  const [products, setProducts] = useState([]);
  const [sorting, setSorting] = useState([]);

  // Fetch products for sales reports
  useEffect(() => {
    const fetchProducts = async () => {
      if (reportType === "sales") {
        try {
          const productsCollection = collection(db, `users/${userId}/products`);
          const snapshot = await getDocs(productsCollection);
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(productsData);
        } catch (err) {
          console.error("Error fetching products:", err);
        }
      }
    };
    fetchProducts();
  }, [reportType, userId]);

  // Process data for reports
  useEffect(() => {
    const processData = () => {
      try {
        let items = [];
        switch (reportType) {
          case "debts":
            items = debts || [];
            break;
          case "sales":
            items = sales || [];
            break;
          case "expenses":
            items = expenses || [];
            break;
          case "bank":
            items = bankDeposits?.filter((deposit) => !deposit.isDepositorOnly) || [];
            break;
          default:
            return;
        }

        // Normalize dates
        items = items.map((item) => ({
          ...item,
          createdAt: item.date?.toDate
            ? item.date.toDate()
            : item.createdAt?.toDate
            ? item.createdAt.toDate()
            : item.date instanceof Date
            ? item.date
            : item.createdAt instanceof Date
            ? item.createdAt
            : new Date(),
        }));

        // Apply date filtering
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          items = items.filter((item) => {
            const itemDate = item.createdAt;
            return itemDate >= start && itemDate <= end;
          });
        }

        // Calculate totals
        const calculatedTotals = items.reduce(
          (acc, item) => {
            let amount = 0;
            if (reportType === "sales") {
              amount = item.totalAmount || 0;
            } else if (reportType === "debts") {
              amount = item.amount || 0;
              if (item.amount === 0) acc.paid += 1;
              else acc.pending += 1;
            } else if (reportType === "expenses") {
              amount = item.amount || 0;
            } else if (reportType === "bank") {
              amount = item.amount || 0;
            }
            acc.total += amount;
            acc.count += 1;
            return acc;
          },
          { total: 0, count: 0, paid: 0, pending: 0 }
        );

        setData(items);
        setTotals(calculatedTotals);
      } catch (err) {
        console.error("Error processing data:", err);
        setData([]);
        setTotals({ total: 0, count: 0, paid: 0, pending: 0 });
      }
    };
    processData();
  }, [reportType, startDate, endDate, sales, debts, expenses, bankDeposits]);

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Corporate branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Richmond Manufacturer's Ltd", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const contactInfo = [
      "Plot 123, Industrial Area, Kampala, Uganda",
      "Phone: +256 123 456 789 | Email: info@richmondltd.ug",
      "Prepared by: Shadia Nakitto | shadia@richmondltd.ug"
    ];
    contactInfo.forEach((line, index) => {
      doc.text(line, 14, 30 + index * 5);
    });

    // Report title
    const title = `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } Report`;
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(title, 14, 50);

    // Date range
    const dateRangeText = startDate && endDate
      ? `From: ${format(new Date(startDate), "MMM dd, yyyy")} To: ${format(
          new Date(endDate),
          "MMM dd, yyyy"
        )}`
      : `All Time`;
    doc.setFontSize(12);
    doc.text(dateRangeText, 14, 60);

    // Table configuration
    const tableData = data.map((item) => {
      if (reportType === "debts") {
        return [
          item.client || "-",
          (item.amount || 0).toLocaleString("en-UG", {
            style: "currency",
            currency: "UGX",
          }),
          item.amount === 0 ? "Paid" : "Pending",
          format hem.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      } else if (reportType === "sales") {
        const product = products.find((p) => p.id === item.product?.productId);
        return [
          item.client || "-",
          product?.name || item.product?.name || "-",
          item.product?.quantity || 0,
          (item.totalAmount || 0).toLocaleString("en-UG", {
            style: "currency",
            currency: "UGX",
          }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
        ];
      } else if (reportType === "expenses") {
        return [
          item.category || "-",
率先
          (item.amount || 0).toLocaleString("en-UG", {
            style: "currency",
            currency: "UGX",
          }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      } else if (reportType === "bank") {
        return [
          item.depositor || "-",
          (item.amount || 0).toLocaleString("en-UG", {
            style: "currency",
            currency: "UGX",
          }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.description || "-",
        ];
      }
    });

    autoTable(doc, {
      startY: 70,
      head: [
        reportType === "debts"
          ? ["Client", "Amount", "Status", "Date", "Notes"]
          : reportType === "sales"
          ? ["Client", "Product", "Quantity", "Amount", "Date"]
          : reportType === "expenses"
          ? ["Category", "Amount", "Date", "Notes"]
          : ["Depositor", "Amount", "Date", "Description"],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 70 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    // Summary statistics
    doc.setFontSize(12);
    doc.setTextColor(0);
    const summaryText = `Total: ${totals.total.toLocaleString("en-UG", {
      style: "currency",
      currency: "UGX",
    })} | Count: ${totals.count}${
      reportType === "debts"
        ? ` | Paid: ${totals.paid} | Pending: ${totals.pending}`
        : ""
    }`;
    doc.text(summaryText, 14, doc.lastAutoTable.finalY + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Richmond Manufacturer's Ltd | Confidential Report",
      14,
      doc.internal.pageSize.height - 10
    );

    doc.save(
      `${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`
    );
  };

  // Table columns configuration
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) =>
          format(info.getValue(), "MMM dd, yyyy HH:mm"),
        minSize: 150,
      }),
    ];

    if (reportType === "debts") {
      return [
        columnHelper.accessor("client", {
          header: "Client",
          cell: (info) => info.getValue() || "-",
          minSize: 150,
        }),
        columnHelper.accessor("amount", {
          header: "Amount (UGX)",
          cell: (info) =>
            info.getValue().toLocaleString("en-UG", {
              style: "currency",
              currency: "UGX",
            }),
          minSize: 120,
        }),
        columnHelper.accessor("amount", {
          header: "Status",
          cell: (info) => (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                info.getValue() === 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {info.getValue() === 0 ? "Paid" : "Pending"}
            </span>
          ),
          minSize: 100,
        }),
        ...baseColumns,
        columnHelper.accessor("notes", {
          header: "Notes",
          cell: (info) => info.getValue() || "-",
          minSize: 200,
        }),
      ];
    } else if (reportType === "sales") {
      return [
        columnHelper.accessor("client", {
          header: "Client",
          cell: (info) => info.getValue() || "-",
          minSize: 150,
        }),
        columnHelper.accessor("product", {
          header: "Product",
          cell: (info) => {
            const product = products.find(
              (p) => p.id === info.getValue()?.productId
            );
            return product?.name || info.getValue()?.name || "-";
          },
          minSize: 150,
        }),
        columnHelper.accessor("product.quantity", {
          header: "Quantity",
          cell: (info) => info.getValue() || 0,
          minSize: 100,
        }),
        columnHelper.accessor("totalAmount", {
          header: "Amount (UGX)",
          cell: (info) =>
            info.getValue().toLocaleString("en-UG", {
              style: "currency",
              currency: "UGX",
            }),
          minSize: 120,
        }),
        ...baseColumns,
      ];
    } else if (reportType === "expenses") {
      return [
        columnHelper.accessor("category", {
          header: "Category",
          cell: (info) => info.getValue() || "-",
          minSize: 150,
        }),
        columnHelper.accessor("amount", {
          header: "Amount (UGX)",
          cell: (info) =>
            info.getValue().toLocaleString("en-UG", {
              style: "currency",
              currency: "UGX",
            }),
          minSize: 120,
        }),
        ...baseColumns,
        columnHelper.accessor("notes", {
          header: "Notes",
          cell: (info) => info.getValue() || "-",
          minSize: 200,
        }),
      ];
    } else if (reportType === "bank") {
      return [
        columnHelper.accessor("depositor", {
          header: "Depositor",
          cell: (info) => info.getValue() || "-",
          minSize: 150,
        }),
        columnHelper.accessor("amount", {
          header: "Amount (UGX)",
          cell: (info) =>
            info.getValue().toLocaleString("en-UG", {
              style: "currency",
              currency: "UGX",
            }),
          minSize: 120,
        }),
        ...baseColumns,
        columnHelper.accessor("description", {
          header: "Description",
          cell: (info) => info.getValue() || "-",
          minSize: 200,
        }),
      ];
    }
  }, [reportType, products]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Chart data preparation
  const chartData = useMemo(() => {
    const groupedData = data.reduce((acc, item) => {
      const dateKey = format(item.createdAt, "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, amount: 0, count: 0 };
      }
      const amount =
        reportType === "sales"
          ? item.totalAmount || 0
          : item.amount || 0;
      acc[dateKey].amount += amount;
      acc[dateKey].count += 1;
      return acc;
    }, {});
    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [data, reportType]);

  return (
    <div className="space-y-6 p-6">
      <ReportHeader title="Reports" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ReportTypeSelector
          reportType={reportType}
          setReportType={setReportType}
          includeBank={true}
        />
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Export PDF</span>
        </button>
      </div>
      <DateRangeSelector
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <ReportTable table={table} reportType={reportType} />
      {data.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No {reportType} found for the selected period
        </div>
      )}
      <ReportSummary totals={totals} reportType={reportType} />
      {data.length > 0 && (
        <ReportChart chartData={chartData} reportType={reportType} />
      )}
    </div>
  );
};

export default ReportsPage;