// DebtForm.jsx
import React, { useState, useEffect } from "react";
import { addDoc, doc, updateDoc, collection, query, onSnapshot, getDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { X, User } from "lucide-react";
import { format } from "date-fns";

const DebtForm = ({ debt, onClose }) => {
  const [formData, setFormData] = useState({
    client: debt?.client || "",
    amount: debt?.amount || 0,
    notes: debt?.notes || "",
    createdAt: debt?.createdAt ? debt.createdAt.toDate() : new Date(),
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const clientsQuery = query(collection(db, `users/${user.uid}/clients`));
      const unsubscribeClients = onSnapshot(
        clientsQuery,
        (snapshot) => {
          const clientsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setClients(clientsData);
        },
        (err) => {
          console.error("Error fetching clients:", err);
        }
      );
      return () => unsubscribeClients();
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = "Client is required";
    if (formData.amount < 0) newErrors.amount = "Amount cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      const debtData = {
        client: formData.client,
        amount: formData.amount,
        notes: formData.notes || null,
        createdAt: new Date(formData.createdAt),
        updatedAt: new Date(),
        saleId: debt?.saleId || null,
      };

      const batch = writeBatch(db);
      let debtRef;

      if (debt) {
        // Updating an existing debt
        debtRef = doc(db, `users/${user.uid}/debts`, debt.id);
        batch.update(debtRef, debtData);
      } else {
        // Adding a new debt
        debtRef = doc(collection(db, `users/${user.uid}/debts`)); // Create a new document reference
        batch.set(debtRef, debtData);
      }

      if (debt?.saleId) {
        const saleRef = doc(db, `users/${user.uid}/sales`, debt.saleId);
        const saleSnap = await getDoc(saleRef);
        if (saleSnap.exists()) {
          const saleData = saleSnap.data();
          const newAmountPaid = saleData.totalAmount - formData.amount;
          const newPaymentStatus =
            newAmountPaid >= saleData.totalAmount
              ? "paid"
              : newAmountPaid > 0
              ? "partial"
              : "unpaid";

          batch.update(saleRef, {
            amountPaid: newAmountPaid,
            paymentStatus: newPaymentStatus,
            updatedAt: new Date(),
          });

          if (formData.amount === 0) {
            batch.delete(debtRef);
          }
        }
      }

      await batch.commit();
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

        {debt?.saleId && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
            This debt is linked to a sale. Updating it will adjust the sale's payment status.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
            <AutocompleteInput
              options={clients.map((c) => ({ id: c.id, name: c.name }))}
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
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