// src/components/DebtForm.jsx
import React, { useState } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { db, addDoc, collection, setDoc, doc } from "../firebase";
import { DollarSign } from "lucide-react";

function DebtForm({ clients, userId, sales, debts }) {
  const [debtor, setDebtor] = useState("");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!debtor || amount <= 0) {
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    try {
      const debtRef = await addDoc(collection(db, `users/${userId}/debts`), {
        debtor,
        amount: Number(amount),
        notes,
        date: new Date(date).toISOString(),
        status: "outstanding",
      });

      if (!clients.includes(debtor)) {
        await addDoc(collection(db, `users/${userId}/clients`), { name: debtor });
      }

      setDebtor("");
      setAmount(0);
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError("Failed to save debt. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (debtId) => {
    setSelectedDebtId(debtId);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (paymentAmount <= 0) {
      setError("Please enter a valid payment amount.");
      setLoading(false);
      return;
    }

    try {
      const debtRef = doc(db, `users/${userId}/debts`, selectedDebtId);
      const debt = debts.find((d) => d.id === selectedDebtId);
      const newAmount = debt.amount - paymentAmount;

      if (newAmount <= 0) {
        await setDoc(debtRef, { status: "paid", amount: 0 }, { merge: true });
      } else {
        await setDoc(debtRef, { amount: newAmount }, { merge: true });
      }

      if (debt.saleId) {
        const saleRef = doc(db, `users/${userId}/sales`, debt.saleId);
        const sale = sales.find((s) => s.id === debt.saleId);
        const newAmountPaid = sale.amountPaid + Number(paymentAmount);
        const newStatus = newAmountPaid >= sale.totalAmount ? "paid" : "partial";
        await setDoc(
          saleRef,
          { amountPaid: newAmountPaid, paymentStatus: newStatus, remainingDebt: sale.totalAmount - newAmountPaid },
          { merge: true }
        );
      }

      setPaymentAmount(0);
      setShowPaymentModal(false);
    } catch (err) {
      setError("Failed to process payment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Record Debt
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteInput
            suggestions={clients}
            value={debtor}
            onChange={setDebtor}
            placeholder="Debtor Name"
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
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
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
          <DollarSign className="w-5 h-5" />
          {loading ? "Saving..." : "Record Debt"}
        </button>
      </form>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Record Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Payment Amount (UGX)"
                min="0"
                required
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 bg-neutral-200 text-neutral-800 rounded-lg font-medium hover:bg-neutral-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebtForm;
