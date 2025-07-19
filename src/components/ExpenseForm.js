import React, { useState } from "react";
import { addDoc, doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { X, Tag } from "lucide-react";
import { format } from "date-fns";

const ExpenseForm = ({ expense, categories, userId, onClose }) => {
  const [formData, setFormData] = useState({
    category: expense?.category || "",
    amount: expense?.amount || 0,
    description: expense?.description || "",
    payee: expense?.payee || "",
    createdAt: expense?.createdAt ? expense.createdAt.toDate() : new Date(),
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
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const expenseData = {
        category: formData.category,
        amount: formData.amount,
        description: formData.description || null,
        payee: formData.payee || null,
        createdAt: new Date(formData.createdAt),
        updatedAt: new Date(),
      };

      if (expense) {
        await updateDoc(doc(db, `users/${userId}/expenses`, expense.id), expenseData);
      } else {
        await addDoc(collection(db, `users/${userId}/expenses`), expenseData);
        // Add new category to Firestore if it doesn't exist
        const existingCategory = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase());
        if (!existingCategory && formData.category) {
          await addDoc(collection(db, `users/${userId}/categories`), {
            name: formData.category,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      onClose();
    } catch (err) {
      console.error("Error saving expense:", err);
      setErrors({ submit: "Failed to save expense. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            {expense ? "Edit Expense" : "Add New Expense"}
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
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <AutocompleteInput
              options={categories.map(c => ({ id: c.id, name: c.name }))}
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              placeholder="Select or type category"
              allowNew
              icon={<Tag className="w-5 h-5 text-neutral-400" />}
            />
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
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
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Payee (Optional)</label>
            <input
              type="text"
              value={formData.payee}
              onChange={(e) => handleChange("payee", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
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
              {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;