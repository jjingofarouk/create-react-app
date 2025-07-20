import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ReportHeader from "./ReportHeader";
import DateRangeSelector from "./DateRangeSelector";
import ReportTypeSelector from "./ReportTypeSelector";
import ReportPDF from "./ReportPDF";

const ReportsPage = ({ userId }) => {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0, paid: 0, pending: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products for sales reports
  useEffect(() => {
    if (reportType !== "sales") {
      setProducts([]);
      setLoading(false);
      return;
    }

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
  }, [userId, reportType]);

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
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-8 text-neutral-500 bg-white rounded-lg shadow">
          No {reportType} found for the selected period
        </div>
      )}
    </div>
  );
};

export default ReportsPage;