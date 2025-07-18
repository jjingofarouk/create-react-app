// src/components/SalesForm.jsx
import React, { useState, useEffect } from "react";
import { addDoc, doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { X } from "lucide-react";
import { format } from "date-fns";

const SalesForm = ({ sale, clients, products, userId, onClose }) => {
  const [formData, setFormData] = useState({
    client: sale?.client || "",
    product: sale?.product || "",
    quantity: sale?.quantity || 1,
    unitPrice: sale?.unitPrice || 0,
    discount: sale?.discount || 0,
    totalAmount: sale?.totalAmount || 0,
    paymentStatus: sale?.paymentStatus || "unpaid",
    amountPaid: sale?.amountPaid || 0,
    notes: sale?.notes || "",
    date: sale?.date?.toDate() || new Date(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.product) {
      const selectedProduct = products.find(p => p.name === formData.product);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          unitPrice: selectedProduct.price,
          totalAmount: (prev.quantity * selectedProduct.price) - (prev.discount || 0)
        }));
      }
    }
  }, [formData.product, products]);

  useEffect(() => {
    const newTotal = (formData.quantity * formData.unitPrice) - formData.discount;
    setFormData(prev => ({
      ...prev,
      totalAmount: newTotal > 0 ? newTotal : 0,
      amountPaid: prev.paymentStatus === "unpaid" ? 0 : 
                 prev.paymentStatus === "paid" ? newTotal : prev.amountPaid
    }));
  }, [formData.quantity, formData.unitPrice, formData.discount, formData.paymentStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "unitPrice" || name === "discount" || name === "amountPaid" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = "Client is required";
    if (!formData.product) newErrors.product = "Product is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (formData.unitPrice <= 0) newErrors.unitPrice = "Unit price must be greater than 0";
    if (formData.discount < 0) newErrors.discount = "Discount cannot be negative";
    if (formData.totalAmount < 0) newErrors.totalAmount = "Total amount cannot be negative";
    if (formData.paymentStatus === "partial" && formData.amountPaid <= 0) {
      newErrors.amountPaid = "Partial payment must be greater than 0";
    }
    if (formData.paymentStatus === "partial" && formData.amountPaid >= formData.totalAmount) {
      newErrors.amountPaid = "Partial payment must be less than total amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const saleData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (sale) {
        // Update existing sale
        await updateDoc(doc(db, `users/${userId}/sales`, sale.id), saleData);
      } else {
        // Add new sale
        await addDoc(collection(db, `users/${userId}/sales`), saleData);
      }
      onClose();
    } catch (err) {
      console.error("Error saving sale:", err);
      setErrors({ submit: "Failed to save sale. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            {sale ? "Edit Sale" : "Add New Sale"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
              <AutocompleteInput
                options={clients}
                value={formData.client}
                onChange={(value) => setFormData({ ...formData, client: value })}
                placeholder="Select client"
              />
              {errors.client && <p className="mt-1 text-sm text-error-600">{errors.client}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product</label>
              <AutocompleteInput
                options={products.map(p => p.name)}
                value={formData.product}
                onChange={(value) => setFormData({ ...formData, product: value })}
                placeholder="Select product"
              />
              {errors.product && <p className="mt-1 text-sm text-error-600">{errors.product}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.quantity && <p className="mt-1 text-sm text-error-600">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Unit Price (UGX)</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-error-600">{errors.unitPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Discount (UGX)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.discount && <p className="mt-1 text-sm text-error-600">{errors.discount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Total Amount (UGX)</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {formData.paymentStatus !== "unpaid" && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Amount Paid (UGX)</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  min="0"
                  max={formData.paymentStatus === "partial" ? formData.totalAmount - 0.01 : undefined}
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.amountPaid && <p className="mt-1 text-sm text-error-600">{errors.amountPaid}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
              <input
                type="datetime-local"
                name="date"
                value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
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
              {isSubmitting ? "Saving..." : sale ? "Update Sale" : "Save Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesForm;