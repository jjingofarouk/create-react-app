import React, { useState, useMemo } from "react";
import SalesForm from "./SalesForm";
import TransactionTable from "./TransactionTable";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { TrendingUp } from "lucide-react";

function SalesPage({ sales, clients, products, userId }) {
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterDate, setFilterDate] = useState("today");

  const filteredSales = useMemo(() => {
    let filtered = sales;
    if (filterClient) {
      filtered = filtered.filter((s) => s.client.toLowerCase().includes(filterClient.toLowerCase()));
    }
    if (filterProduct) {
      filtered = filtered.filter((s) => s.product.toLowerCase().includes(filterProduct.toLowerCase()));
    }
    if (filterDate === "today") {
      const today = new Date();
      filtered = filtered.filter(
        (s) => new Date(s.date) >= startOfDay(today) && new Date(s.date) <= endOfDay(today)
      );
    } else if (filterDate === "week") {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      filtered = filtered.filter(
        (s) => new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd
      );
    }
    return filtered;
  }, [sales, filterClient, filterProduct, filterDate]);

  const totalSales = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0),
    [filteredSales]
  );
  const totalPaid = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.amountPaid, 0),
    [filteredSales]
  );
  const totalDebts = useMemo(
    () => filteredSales.reduce((sum, s) => sum + (s.totalAmount - s.amountPaid), 0),
    [filteredSales]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-primary" />
        Sales
      </h2>
      <SalesForm clients={clients} products={products} userId={userId} />
      <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by client"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Filter by product"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-700">Total Sales</h3>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-700">Total Paid</h3>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-700">Total Debts</h3>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalDebts.toLocaleString()}
          </p>
        </div>
      </div>
      <TransactionTable sales={filteredSales} userId={userId} />
    </div>
  );
}

export default SalesPage;