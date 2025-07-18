import React, { useState } from "react";
import { db, addDoc, collection } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { DollarSign } from "lucide-react";

function DebtForm({ debtors, userId }) {
  const [debtor, setDebtor] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${userId}/debts`), {
        debtor: debtor || null,
        amount: parseFloat(amount),
        notes: notes || null,
        timestamp: new Date().toISOString(),
      });

      setDebtor("");
      setAmount("");
      setNotes("");
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("Error adding debt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
          Add New Debt
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AutocompleteInput
          value={debtor}
          onChange={setDebtor}
          suggestions={debtors}
          placeholder="Debtor Name (Person or Business)"
          disabled={loading}
        />
        
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
        
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          disabled={loading}
          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full sm:col-span-2 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:shadow-none disabled:hover:translate-y-0"
        >
          <DollarSign className="w-5 h-5" />
          {loading ? "Adding..." : "Add Debt"}
        </button>
      </form>
    </div>
  );
}

export default DebtForm;
