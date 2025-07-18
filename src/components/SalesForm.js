import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { X, Plus, Trash2 } from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";

const SalesForm = ({ sale, clients, products, userId, onClose }) => {
  const [formData, setFormData] = useState({
    client: "",
    products: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
    paymentStatus: "unpaid",
    amountPaid: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sale) {
      setFormData({
        client: sale.client,
        products: sale.products,
        paymentStatus: sale.paymentStatus,
        amountPaid: sale.amountPaid,
        date: sale.date.toDate().toISOString().split("T")[0],
      });
    }
  }, [sale]);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const updatedProducts = [...formData.products];
      updatedProducts[index][name] = name === "quantity" || name === "unitPrice" || name === "discount" ? parseFloat(value) || 0 : value;
      setFormData({ ...formData, products: updatedProducts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const handleClientSelect = (clientName) => {
    setFormData({ ...formData, client: clientName });
    setErrors({ ...errors, client: "" });
  };

  const handleProductSelect = (product, index) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      productId: product.id,
      unitPrice: product.price,
    };
    setFormData({ ...formData, products: updatedProducts });
  };

  const calculateTotal = () => {
    return formData.products.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice - (item.discount || 0);
      return total + (subtotal > 0 ? subtotal : 0);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = "Client is required";
    if (formData.products.some(item => !item.productId)) newErrors.products = "All products must be selected";
    if (formData.products.some(item => item.quantity <= 0)) newErrors.quantity = "Quantity must be greater than 0";
    if (parseFloat(formData.amountPaid) > calculateTotal()) newErrors.amountPaid = "Amount paid cannot exceed total";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const saleData = {
      ...formData,
      totalAmount: calculateTotal(),
      amountPaid: parseFloat(formData.amountPaid) || 0,
      date: new Date(formData.date),
      updatedAt: new Date(),
    };

    try {
      if (sale) {
        await updateDoc(doc(db, `users/${userId}/sales`, sale.id), saleData);
        if (saleData.totalAmount > saleData.amountPaid) {
          await addDoc(collection(db, `users/${userId}/debts`), {
            saleId: sale.id,
            client: saleData.client,
            amount: saleData.totalAmount - saleData.amountPaid,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        const docRef = await addDoc(collection(db, `users/${userId}/sales`), {
          ...saleData,
          createdAt: new Date(),
        });
        if (saleData.totalAmount > saleData.amountPaid) {
          await addDoc(collection(db, `users/${userId}/debts`), {
            saleId: docRef.id,
            client: saleData.client,
            amount: saleData.totalAmount - saleData.amountPaid,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      onClose();
    } catch (err) {
      console.error("Error saving sale:", err);
      setErrors({ form: "Failed to save sale. Please try again." });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">{sale ? "Edit Sale" : "New Sale"}</h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Client <span className="text-red-500">*</span>
          </label>
          <AutocompleteInput
            suggestions={clients.map(c => c.name)}
            value={formData.client}
            onChange={(value) => handleClientSelect(value)}
            placeholder="Select or type client name"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
          {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Products</label>
          {formData.products.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-neutral-50 rounded-lg">
              <div className="flex-1">
                <AutocompleteInput
                  suggestions={products.map(p => ({ id: p.id, name: p.name, price: p.price }))}
                  value={products.find(p => p.id === item.productId)?.name || ""}
                  onChange={(value) => {
                    const selected = products.find(p => p.name === value);
                    if (selected) handleProductSelect(selected, index);
                  }}
                  placeholder="Select product"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                {errors.products && <p className="mt-1 text-sm text-red-500">{errors.products}</p>}
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(e, index)}
                  min="1"
                  placeholder="Quantity"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  name="unitPrice"
                  value={item.unitPrice}
                  onChange={(e) => handleInputChange(e, index)}
                  min="0"
                  step="0.01"
                  placeholder="Unit Price"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  name="discount"
                  value={item.discount}
                  onChange={(e) => handleInputChange(e, index)}
                  min="0"
                  step="0.01"
                  placeholder="Discount"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
              {formData.products.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddProduct}
            className="flex items-center gap-2 text-primary hover:text-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Another Product
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Payment Status</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Amount Paid (UGX)</label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
            {errors.amountPaid && <p className="mt-1 text-sm text-red-500">{errors.amountPaid}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-700">Total: UGX {calculateTotal().toLocaleString()}</div>
          <div className="text-sm text-neutral-600">Outstanding: UGX {(calculateTotal() - (parseFloat(formData.amountPaid) || 0)).toLocaleString()}</div>
        </div>

        {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {sale ? "Update Sale" : "Save Sale"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;