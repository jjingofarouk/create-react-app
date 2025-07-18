// src/components/DebtForm.jsx
import React, { useState } from "react";
import { addDoc, doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { X } from "lucide-react";
import { format } from "date-fns";

const DebtForm = ({ debt, clients, userId, onClose }) => {
  const [formData, setFormData] = useState({
    debtor: debt?.debtor || "",
    amount: debt?.amount || 0,
    status: debt?.status || "outstanding",
    notes: debt?.notes || "",
    date: debt?.date?.toDate() || new Date(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.debtor) newErrors.debtor = "Debtor is required";
    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const debtData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (debt) {
        // Update existing debt
        await updateDoc(doc(db, `users/${userId}/debts`, debt.id), debtData);
      } else {
        // Add new debt
        await addDoc(collection(db, `users/${userId}/debts`), debtData);
      }
      onClose();
    } catch (err) {
      console.error("Error saving debt:", err);
      setErrors({ submit: "Failed to save debt. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            {debt ? "Edit Debt" : "Add New Debt"}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-error-100 text-error-800 rounded-md">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Debtor</label>
            <AutocompleteInput
              options={clients}
              value={formData.debtor}
              onChange={(value) => setFormData({ ...formData, debtor: value })}
              placeholder="Select debtor"
            />
            {errors.debtor && <p className="mt-1 text-sm text-error-600">{errors.debtor}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Amount (UGX)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.amount && <p className="mt-1 text-sm text-error-600">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="outstanding">Outstanding</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
            <input
              type="datetime-local"
              name="date"
              value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : debt ? "Update Debt" : "Save Debt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtForm;