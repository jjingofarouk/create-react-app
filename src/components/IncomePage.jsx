import React, { useState } from "react";
import { db, addDoc, collection } from "../firebase";
import TransactionTable from "./TransactionTable";
import AutocompleteInput from "./AutocompleteInput";
import { TrendingUp } from "lucide-react";

function IncomePage({ transactions, clients, categories, userId }) {
  const [amount, setAmount] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "income",
        amount: parseFloat(amount),
        client: client || null,
        category: category || null,
        timestamp: new Date().toISOString(),
      });
      setAmount("");
      setClient("");
      setCategory("");
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Error adding income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
            Add Income
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">UGX</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              required
              disabled={loading}
              step="0.01"
              min="0"
              className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <AutocompleteInput
            value={client}
            onChange={setClient}
            suggestions={clients}
            placeholder="Client Name"
            disabled={loading}
          />
          <AutocompleteInput
            value={category}
            onChange={setCategory}
            suggestions={categories}
            placeholder="Category (e.g., Salary)"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:col-span-2 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            <TrendingUp className="w-5 h-5" />
            {loading ? "Adding..." : "Add Income"}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
              Income Records
            </h2>
          </div>
          <div className="text-sm font-semibold text-neutral-800">
            Total: UGX {totalIncome.toLocaleString()}
          </div>
        </div>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}

export default IncomePage;
