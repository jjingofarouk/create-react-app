import React, { useState, useEffect } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { db, addDoc, collection, setDoc, doc } from "../firebase";
import { Plus, Package } from "lucide-react";

function SalesForm({ clients, products, userId }) {
  const [client, setClient] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedProduct = products.find((p) => p.name === product);
    if (selectedProduct) {
      setUnitPrice(selectedProduct.defaultPrice || 0);
    }
  }, [product, products]);

  useEffect(() => {
    const total = quantity * unitPrice - discount;
    setTotalAmount(total > 0 ? total : 0);
    if (paymentStatus === "paid") {
      setAmountPaid(total);
    } else if (paymentStatus === "unpaid") {
      setAmountPaid(0);
    }
  }, [quantity, unitPrice, discount, paymentStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!client || !product || quantity <= 0 || unitPrice <= 0) {
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    try {
      const saleData = {
        client,
        product,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        discount: Number(discount),
        totalAmount: Number(totalAmount),
        paymentStatus,
        amountPaid: Number(amountPaid),
        remainingDebt: paymentStatus !== "paid" ? totalAmount - amountPaid : 0,
        notes,
        date: new Date(date).toISOString(),
      };

      await addDoc(collection(db, `users/${userId}/sales`), saleData);

      if (paymentStatus !== "paid" && totalAmount - amountPaid > 0) {
        await addDoc(collection(db, `users/${userId}/debts`), {
          debtor: client,
          amount: totalAmount - amountPaid,
          notes: `Debt from sale of ${product} on ${date}`,
          date: new Date(date).toISOString(),
          status: "outstanding",
          saleId: saleData.id,
        });
      }

      if (!clients.includes(client)) {
        await addDoc(collection(db, `users/${userId}/clients`), { name: client });
      }

      setClient("");
      setProduct("");
      setQuantity(1);
      setUnitPrice(0);
      setDiscount(0);
      setTotalAmount(0);
      setPaymentStatus("paid");
      setAmountPaid(0);
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError("Failed to save sale. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName || newProductPrice <= 0) {
      setError("Please provide a valid product name and price.");
      return;
    }
    try {
      await addDoc(collection(db, `users/${userId}/products`), {
        name: newProductName,
        defaultPrice: Number(newProductPrice),
      });
      setNewProductName("");
      setNewProductPrice(0);
      setShowProductModal(false);
    } catch (err) {
      setError("Failed to add product. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-700 mb-4">Record Sale</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteInput
            suggestions={clients}
            value={client}
            onChange={setClient}
            placeholder="Client Name"
            required
          />
          <div className="relative">
            <AutocompleteInput
              suggestions={products.map((p) => p.name)}
              value={product}
              onChange={setProduct}
              placeholder="Product"
              required
            />
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary hover:text-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            min="1"
            required
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="Unit Price (UGX)"
            min="0"
            required
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="Discount (UGX)"
            min="0"
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          />
          <input
            type="text"
            value={totalAmount}
            disabled
            placeholder="Total Amount (UGX)"
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg bg-neutral-100 text-neutral-600"
          />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          >
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Amount Paid (UGX)"
            min="0"
            disabled={paymentStatus === "paid" || paymentStatus === "unpaid"}
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
          <TrendingUp className="w-5 h-5" />
          {loading ? "Saving..." : "Record Sale"}
        </button>
      </form>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Add New Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Product Name"
                required
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              />
              <input
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="Default Price (UGX)"
                min="0"
                required
                className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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

export default SalesForm;