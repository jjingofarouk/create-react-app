import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import ReportHeader from "./ReportHeader";
import DateRangeSelector from "./DateRangeSelector";
import ReportTable from "./ReportTable";
import ReportSummary from "./ReportSummary";
import ReportTypeSelector from "./ReportTypeSelector";
import ReportPDF from "./ReportPDF";
import ReportChart from "./ReportChart";

const ReportsPage = ({ userId }) => {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0, paid: 0, pending: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);

  // Fetch products for sales reports
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(collection(db, `users/${userId}/products`));
        const unsubscribe = onSnapshot(
          productsQuery,
          (snapshot) => {
            const productsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(productsData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
            setLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up products listener:", err);
        setError("Failed to initialize product data. Please try again.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [userId]);

  // Fetch data based on report type
  useEffect(() => {
    setLoading(true);
    const collections = {
      sales: `users/${userId}/sales`,
      debts: `users/${userId}/debts`,
      expenses: `users/${userId}/expenses`,
      bank: `users/${userId}/bankDeposits`,
    };

    const collectionPath = collections[reportType];
    if (!collectionPath) {
      setError("Invalid report type selected.");
      setData([]);
      setTotals({ total: 0, count: 0, paid: 0, pending: 0 });
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, collectionPath)),
      (snapshot) => {
        try {
          let items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Normalize dates
          items = items.map((item) => {
            let date;
            try {
              date = item.date?.toDate
                ? item.date.toDate()
                : item.createdAt?.toDate
                ? item.createdAt.toDate()
                : item.date instanceof Date
                ? item.date
                : item.createdAt instanceof Date
                ? item.createdAt
                : new Date();
            } catch (err) {
              console.warn(`Invalid date in ${reportType} item:`, item);
              date = new Date();
            }
            return { ...item, createdAt: date };
          });

          // Apply date filtering
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            items = items.filter((item) => {
              const itemDate = item.createdAt;
              return itemDate >= start && itemDate <= end;
            });
          }

          // Filter bank deposits
          if (reportType === "bank") {
            items = items.filter((deposit) => !deposit.isDepositorOnly);
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
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error(`Error processing ${reportType} data:`, err);
          setError(`Failed to process ${reportType} data. Please try again.`);
          setData([]);
          setTotals({ total: 0, count: 0, paid: 0, pending: 0 });
          setLoading(false);
        }
      },
      (err) => {
        console.error(`Error fetching ${reportType}:`, err);
        setError(`Failed to load ${reportType} data. Please try again.`);
        setData([]);
        setTotals({ total: 0, count: 0, paid: 0, pending: 0 });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [reportType, startDate, endDate, userId]);

  // Table columns configuration
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => format(info.getValue(), "MMM dd, yyyy HH:mm"),
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
            (info.getValue() || 0).toLocaleString("en-UG", {
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
            (info.getValue() || 0).toLocaleString("en-UG", {
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
            (info.getValue() || 0).toLocaleString("en-UG", {
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
            (info.getValue() || 0).toLocaleString("en-UG", {
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
    return [];
  }, [reportType, products]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Modern chart data preparation with remarks
  const chartData = useMemo(() => {
    const groupedData = data.reduce((acc, item) => {
      const dateKey = format(item.createdAt, "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, amount: 0, count: 0, remarks: [] };
      }
      const amount =
        reportType === "sales"
          ? item.totalAmount || 0
          : item.amount || 0;
      acc[dateKey].amount += amount;
      acc[dateKey].count += 1;

      // Generate remarks based on amount thresholds
      if (amount > 1000000) {
        acc[dateKey].remarks.push("High-value transaction detected");
      } else if (amount < 10000) {
        acc[dateKey].remarks.push("Low-value transaction recorded");
      }
      if (reportType === "sales" && item.product?.quantity > 50) {
        acc[dateKey].remarks.push("Large quantity sale");
      }
      return acc;
    }, {});
    
    return Object.values(groupedData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
  }, [data, reportType]);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <ReportHeader title="Financial Reports" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ReportTypeSelector
          reportType={reportType}
          setReportType={setReportType}
          includeBank={true}
        />
        <ReportPDF
          reportType={reportType}
          data={data}
          totals={totals}
          products={products}
          startDate={startDate}
          endDate={endDate}
          chartData={chartData}
        />
      </div>
      <DateRangeSelector
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      {loading && (
        <div className="text-center py-4 text-gray-500 bg-white rounded-lg shadow">
          Loading {reportType} data...
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500 bg-white rounded-lg shadow">
          {error}
        </div>
      )}
      {!loading && !error && (
        <>
          <ReportChart chartData={chartData} reportType={reportType} />
          <ReportTable table={table} reportType={reportType} />
          {data.length === 0 && (
            <div className="text-center py-8 text-neutral-500 bg-white rounded-lg shadow">
              No {reportType} found for the selected period
            </div>
          )}
          <ReportSummary totals={totals} reportType={reportType} />
        </>
      )}
    </div>
  );
};

export default ReportsPage;