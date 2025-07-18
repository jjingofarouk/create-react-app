import React, { useState, useMemo } from "react";
import DebtForm from "./DebtForm";
import TransactionTable from "./TransactionTable";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { DollarSign } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DebtsPage({ debts, clients, sales, userId }) {
  const [filterDebtor, setFilterDebtor] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = (debtId) => {
    setSelectedDebtId(debtId);
    setShowPaymentModal(true);
  };

  const filteredDebts = useMemo(() => {
    let filtered = debts;
    if (filterDebtor) {
      filtered = filtered.filter((d) => d.debtor.toLowerCase().includes(filterDebtor.toLowerCase()));
    }
    if (filterDate === "today") {
      const today = new Date();
      filtered = filtered.filter(
        (d) => new Date(d.date) >= startOfDay(today) && new Date(d.date) <= endOfDay(today)
      );
    } else if (filterDate === "week") {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      filtered = filtered.filter(
        (d) => new Date(d.date) >= weekStart && new Date(d.date) <= weekEnd
      );
    } else if (filterDate === "month") {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      filtered = filtered.filter(
        (d) => new Date(d.date) >= monthStart && new Date(d.date) <= monthEnd
      );
    }
    return filtered;
  }, [debts, filterDebtor, filterDate]);

  const totalOutstanding = useMemo(
    () => filteredDebts.reduce((sum, d) => (d.status === "outstanding" ? sum + d.amount : sum), 0),
    [filteredDebts]
  );
  const totalPaid = useMemo(
    () => filteredDebts.reduce((sum, d) => (d.status === "paid" ? sum + d.amount : sum), 0),
    [filteredDebts]
  );

  const chartData = {
    labels: ["Today", "This Week", "This Month"],
    datasets: [
      {
        label: "Outstanding Debts (UGX)",
        data: [
          debts.filter(
            (d) =>
              d.status === "outstanding" &&
              new Date(d.date) >= startOfDay(new Date()) &&
              new Date(d.date) <= endOfDay(new Date())
          ).reduce((sum, d) => sum + d.amount, 0),
          debts.filter(
            (d) =>
              d.status === "outstanding" &&
              new Date(d.date) >= startOfWeek(new Date()) &&
              new Date(d.date) <= endOfWeek(new Date())
          ).reduce((sum, d) => sum + d.amount, 0),
          debts.filter(
            (d) =>
              d.status === "outstanding" &&
              new Date(d.date) >= startOfMonth(new Date()) &&
              new Date(d.date) <= endOfMonth(new Date())
          ).reduce((sum, d) => sum + d.amount, 0),
        ],
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        Debts
      </h2>
      <DebtForm clients={clients} userId={userId} sales={sales} debts={debts} onDebtPayment={handlePayment} />
      <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Filter by debtor"
            value={filterDebtor}
            onChange={(e) => setFilterDebtor(e.target.value)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-700">Total Outstanding</h3>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-700">Total Paid</h3>
          <p className="text-2xl font-bold text-neutral-800 mt-2">
            UGX {totalPaid.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-700 mb-4">Debt Trends</h3>
        <Bar
          data={chartData}
          options={{
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: true } },
          }}
        />
      </div>
      <TransactionTable debts={filteredDebts} userId={userId} sales={sales} onDebtPayment={handlePayment} />
    </div>
  );
}

export default DebtsPage;
