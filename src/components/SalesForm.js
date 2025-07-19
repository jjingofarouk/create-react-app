import React, { useState } from "react";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { X, Package, User } from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";

const SalesForm = ({ sale, clients, products, userId, onClose }) => {
  const [formData, setFormData] = useState({
    client: sale?.client || "",
    productId: sale?.product?.productId || "",
    quantity: sale?.product?.quantity || 1,
    unitPrice: sale?.product?.unitPrice || "",
    discount: sale?.product?.discount || 0,
    amountPaid: sale?.amountPaid || 0,
    date: sale?.date ? sale.date.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const totalAmount = formData.quantity * formData.unitPrice - (formData.discount || 0);
      const paymentStatus = formData.amountPaid >= totalAmount ? "paid" : formData.amountPaid > 0 ? "partial" : "unpaid";
      const saleData = {
        client: formData.client,
        product: {
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          discount: parseFloat(formData.discount || 0),
        },
        totalAmount,
        amountPaid: parseFloat(formData.amountPaid || 0),
        paymentStatus,
        date: new Date(formData.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (sale) {
        await updateDoc(doc(db, `users/${userId}/sales`, sale.id), saleData);
        const existingDebtQuery = query(
          collection(db, `users/${userId}/debts`),
          where("saleId", "==", sale.id)
        );
        const querySnapshot = await getDocs(existingDebtQuery);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } else {
        const saleRef = await addDoc(collection(db, `users/${userId}/sales`), saleData);
        if (totalAmount > formData.amountPaid && formData.amountPaid < totalAmount) {
          await addDoc(collection(db, `users/${userId}/debts`), {
            client: formData.client,
            amount: totalAmount - formData.amountPaid,
            saleId: saleRef.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      onClose();
    } catch (err) {
      console.error("Error saving sale:", err);
      setError("Failed to save sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800">{sale ? "Edit Sale" : "Add New Sale"}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Client</label>
              <AutocompleteInput
                options={clients.map((c) => ({ id: c.id, name: c.name }))}
                value={formData.client}
                onChange={(value) => handleChange("client", value)}
                placeholder="Select or type client name"
                allowNew
                icon={<User className="w-5 h-5 text-neutral-400" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Product</label>
              <AutocompleteInput
                options={products.map((p) => ({ id: p.id, name: p.name }))}
                value={formData.productId}
                onChange={(value) => {
                  handleChange("productId", value);
                  const product = products.find((p) => p.id === value);
                  if (product) handleChange("unitPrice", product.price || "");
                }}
                placeholder="Select product"
                icon={<Package className="w-5 h-5 text-neutral-400" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Unit Price (UGX)</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleChange("unitPrice", e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Discount (UGX)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleChange("discount", e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Amount Paid (UGX)</label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => handleChange("amountPaid", e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.client || !formData.productId || !formData.unitPrice || !formData.quantity}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : sale ? "Update Sale" : "Add Sale"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;