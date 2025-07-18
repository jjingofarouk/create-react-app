// src/components/ExpenseForm.jsx
import React, { useState } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { db, addDoc, collection } from "../firebase";
import { TrendingDown } from "lucide-react";

function ExpenseForm({ categories, payees, userId }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [payee, setPayee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!category || amount <= 0) {
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, `users/${userId}/expenses`), {
        category,
        amount: Number(amount),
        description,
        payee,
        date: new Date(date).toISOString(),
      });

      setCategory("");
      setAmount(0);
      setDescription("");
      setPayee("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError("Failed to save expense. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
        <TrendingDown className="w-5 h-5 text-primary" />
        Record Expense
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteInput
            suggestions={categories}
            value={category}
            onChange={setCategory}
            placeholder="Category"
            required
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (UGX)"
            min="0"
            required
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <AutocompleteInput
            suggestions={payees}
            value={payee}
            onChange={setPayee}
            placeholder="Payee (Optional)"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
        </div>
        {error && (
          <p className="text-error-600 text-sm text-center bg-error-50 p-2 rounded-lg">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <TrendingDown className="w-5 h-5" />
          {loading ? "Saving..." : "Record Expense"}
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
