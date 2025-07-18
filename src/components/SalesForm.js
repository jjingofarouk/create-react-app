import React, { useState, useEffect } from "react";
import { addDoc, doc, updateDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";
import { ArrowLeft, Save } from "lucide-react";
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
    if (!formData.client.trim()) newErrors.client = "Client is required";
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
        client: formData.client.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (sale) {
        await updateDoc(doc(db, `users/${userId}/sales`, sale.id), saleData);
      } else {
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
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <h1 className="text-xl font-semibold text-neutral-800">
                {sale ? "Edit Sale" : "New Sale"}
              </h1>
            </div>
            <button
              type="submit"
              form="sales-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              {errors.submit}
            </div>
          )}

          <form id="sales-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  options={clients}
                  value={formData.client}
                  onChange={(value) => setFormData({ ...formData, client: value })}
                  placeholder="Select or enter client name"
                />
                {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <AutocompleteInput
                  options={products.map(p => p.name)}
                  value={formData.product}
                  onChange={(value) => setFormData({ ...formData, product: value })}
                  placeholder="Select or enter product"
                />
                {errors.product && <p className="mt-1 text-sm text-red-600">{errors.product}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Unit Price (UGX) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Discount (UGX)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Total Amount (UGX)
                </label>
                <div className="px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700 font-medium">
                  UGX {formData.totalAmount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {formData.paymentStatus !== "unpaid" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Amount Paid (UGX)
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    min="0"
                    max={formData.paymentStatus === "partial" ? formData.totalAmount - 0.01 : undefined}
                    step="0.01"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.amountPaid && <p className="mt-1 text-sm text-red-600">{errors.amountPaid}</p>}
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  placeholder="Additional notes about this sale..."
                />
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h3 className="font-medium text-neutral-800 mb-3">Sale Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="font-medium">UGX {(formData.quantity * formData.unitPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Discount:</span>
                  <span className="font-medium">-UGX {formData.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg sm:col-span-2 pt-2 border-t border-neutral-300">
                  <span>Total:</span>
                  <span className="text-primary">UGX {formData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;