import React, { useState } from "react";
import { addDoc, doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { X, User } from "lucide-react";
import { format } from "date-fns";

const DebtForm = ({ debt, clients, userId, onClose }) => {
  const [formData, setFormData] = useState({
    client: debt?.client || "",
    amount: debt?.amount || 0,
    notes: debt?.notes || "",
    createdAt: debt?.createdAt ? debt.createdAt.toDate() : new Date(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = "Client is required";
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
        client: formData.client,
        amount: formData.amount,
        notes: formData.notes || null,
        createdAt: new Date(formData.createdAt),
        updatedAt: new Date(),
        saleId: debt?.saleId || null, // Retain saleId if editing, null for new manual debts
      };

      if (debt) {
        await updateDoc(doc(db, `users/${userId}/debts`, debt.id), debtData);
      } else {
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
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
            <AutocompleteInput
              options={clients.map(c => ({ id: c.id, name: c.name }))}
              value={formData.client}
              onChange={(value) => handleChange("client", value)}
              placeholder="Select or type client name"
              allowNew
              icon={<User className="w-5 h-5 text-neutral-400" />}
            />
            {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Amount (UGX)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
            <input
              type="date"
              value={format(formData.createdAt, "yyyy-MM-dd")}
              onChange={(e) => handleChange("createdAt", new Date(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
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