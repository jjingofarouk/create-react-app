import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
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

const ReportsPage = ({ userId, sales, debts, expenses, bankDeposits, depositors }) => {
  const [reportType, setReportType] = useState("debts");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0, paid: 0, pending: 0 });
  const [products, setProducts] = useState([]);
  const [sorting, setSorting] = useState([]);

  // Debug logging
  useEffect(() => {
    console.log("Report Type Changed:", reportType);
    console.log("Sales Data:", sales);
    console.log("Products Data:", products);
  }, [reportType, sales, products]);

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
          console.log("Fetched products:", productsData);
          setProducts(productsData);
        } catch (err) {
          console.error("Error fetching products:", err);
          setProducts([]); // Set empty array on error
        }
      }
    };
    fetchProducts();
  }, [reportType, userId]);

  // Helper function to safely get date
  const getItemDate = (item) => {
    try {
      // Try different date field names and formats
      const dateValue = item.date || item.createdAt || item.timestamp;
      
      if (!dateValue) {
        console.warn("No date found for item:", item);
        return new Date(); // fallback to current date
      }

      // Handle Firestore Timestamp
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      
      // Handle Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }
      
      console.warn("Unknown date format:", dateValue);
      return new Date(); // fallback
    } catch (error) {
      console.error("Error processing date:", error);
      return new Date(); // fallback
    }
  };

  // Process data for reports
  useEffect(() => {
    const processData = () => {
      try {
        let items = [];
        
        console.log("Processing data for report type:", reportType);

        switch (reportType) {
          case "debts":
            items = Array.isArray(debts) ? debts : [];
            break;
          case "sales":
            items = Array.isArray(sales) ? sales : [];
            console.log("Processing sales items:", items);
            break;
          case "expenses":
            items = Array.isArray(expenses) ? expenses : [];
            break;
          case "bank":
            items = Array.isArray(bankDeposits) 
              ? bankDeposits.filter((deposit) => !deposit.isDepositorOnly) 
              : [];
            break;
          default:
            items = [];
        }

        // Normalize dates with better error handling
        items = items.map((item, index) => {
          try {
            const processedItem = {
              ...item,
              createdAt: getItemDate(item),
            };
            return processedItem;
          } catch (error) {
            console.error(`Error processing item ${index}:`, error, item);
            return {
              ...item,
              createdAt: new Date(), // fallback
            };
          }
        });

        // Apply date filtering
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include end of day
          
          items = items.filter((item) => {
            const itemDate = item.createdAt;
            return itemDate >= start && itemDate <= end;
          });
        }

        // Calculate totals with better error handling
        const calculatedTotals = items.reduce(
          (acc, item) => {
            try {
              let amount = 0;
              
              if (reportType === "sales") {
                // Try different amount field names
                amount = item.totalAmount || item.total || item.amount || 0;
              } else if (reportType === "debts") {
                amount = item.amount || 0;
                if (amount === 0) acc.paid += 1;
                else acc.pending += 1;
              } else if (reportType === "expenses") {
                amount = item.amount || 0;
              } else if (reportType === "bank") {
                amount = item.amount || 0;
              }
              
              acc.total += Number(amount) || 0;
              acc.count += 1;
              return acc;
            } catch (error) {
              console.error("Error calculating totals for item:", error, item);
              acc.count += 1; // Still count the item
              return acc;
            }
          },
          { total: 0, count: 0, paid: 0, pending: 0 }
        );

        console.log("Processed data:", items);
        console.log("Calculated totals:", calculatedTotals);

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

  // Table columns configuration with better error handling
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    try {
      const baseColumns = [
        columnHelper.accessor("createdAt", {
          header: "Date",
          cell: (info) => {
            try {
              const date = info.getValue();
              return format(date, "MMM dd, yyyy HH:mm");
            } catch (error) {
              console.error("Error formatting date:", error);
              return "Invalid Date";
            }
          },
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
            cell: (info) => {
              try {
                const amount = info.getValue() || 0;
                return Number(amount).toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                });
              } catch (error) {
                return "UGX 0";
              }
            },
            minSize: 120,
          }),
          columnHelper.accessor("amount", {
            header: "Status",
            cell: (info) => (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  (info.getValue() || 0) === 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {(info.getValue() || 0) === 0 ? "Paid" : "Pending"}
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
          columnHelper.accessor((row) => row.product || row.productId, {
            header: "Product",
            cell: (info) => {
              try {
                const cellValue = info.getValue();
                
                // If cellValue is an object with name
                if (cellValue && typeof cellValue === 'object' && cellValue.name) {
                  return cellValue.name;
                }
                
                // If cellValue is a product ID, find the product
                if (typeof cellValue === 'string') {
                  const product = products.find(p => p.id === cellValue);
                  if (product) return product.name;
                }
                
                // Try to get product name from the row data directly
                const row = info.row.original;
                if (row.productName) return row.productName;
                if (row.product && row.product.name) return row.product.name;
                
                return cellValue || "-";
              } catch (error) {
                console.error("Error rendering product:", error);
                return "-";
              }
            },
            minSize: 150,
          }),
          columnHelper.accessor((row) => {
            // Try different quantity field paths
            return row.quantity || 
                   (row.product && row.product.quantity) || 
                   row.qty || 
                   0;
          }, {
            header: "Quantity",
            cell: (info) => info.getValue() || 0,
            minSize: 100,
          }),
          columnHelper.accessor((row) => row.totalAmount || row.total || row.amount, {
            header: "Amount (UGX)",
            cell: (info) => {
              try {
                const amount = info.getValue() || 0;
                return Number(amount).toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                });
              } catch (error) {
                return "UGX 0";
              }
            },
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
            cell: (info) => {
              try {
                const amount = info.getValue() || 0;
                return Number(amount).toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                });
              } catch (error) {
                return "UGX 0";
              }
            },
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
            cell: (info) => {
              try {
                const amount = info.getValue() || 0;
                return Number(amount).toLocaleString("en-UG", {
                  style: "currency",
                  currency: "UGX",
                });
              } catch (error) {
                return "UGX 0";
              }
            },
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
      
      return baseColumns;
    } catch (error) {
      console.error("Error creating columns:", error);
      return []; // Return empty columns on error
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

  // Chart data preparation with error handling
  const chartData = useMemo(() => {
    try {
      const groupedData = data.reduce((acc, item) => {
        try {
          const dateKey = format(item.createdAt, "MMM dd");
          if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, amount: 0, count: 0 };
          }
          const amount =
            reportType === "sales"
              ? item.totalAmount || item.total || item.amount || 0
              : item.amount || 0;
          acc[dateKey].amount += Number(amount) || 0;
          acc[dateKey].count += 1;
          return acc;
        } catch (error) {
          console.error("Error processing chart data item:", error, item);
          return acc;
        }
      }, {});
      
      return Object.values(groupedData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    } catch (error) {
      console.error("Error creating chart data:", error);
      return [];
    }
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
      <ReportTable table={table} reportType={reportType} />
      {data.length === 0 && (
        <div className="text-center py-8 text-neutral-500 bg-white rounded-lg shadow">
          No {reportType} found for the selected period
        </div>
      )}
      <ReportSummary totals={totals} reportType={reportType} />
    </div>
  );
};

export default ReportsPage;