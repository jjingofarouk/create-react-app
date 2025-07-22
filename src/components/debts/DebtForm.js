import React, { useState, useEffect } from "react";
import { addDoc, doc, updateDoc, collection, query, onSnapshot, getDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../../firebase";
import AutocompleteInput from "../AutocompleteInput";
import { X, User, Package, Calendar, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";

const DebtForm = ({ debt, onClose }) => {
  const [formData, setFormData] = useState({
    client: debt?.client || "",
    amount: debt?.amount || "",
    paidToday: "",
    productId: debt?.productId || "",
    notes: debt?.notes || "",
    createdAt: debt?.createdAt ? debt.createdAt.toDate() : new Date(),
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [showClientForm, setShowClientForm] = useState(false);

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

      const productsQuery = query(collection(db, `users/${user.uid}/products`));
      const unsubscribeProducts = onSnapshot(
        productsQuery,
        (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(productsData);
        },
        (err) => {
          console.error("Error fetching products:", err);
        }
      );

      return () => {
        unsubscribeClients();
        unsubscribeProducts();
      };
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "amount" || field === "paidToday" ? (value === "" ? "" : parseFloat(value) || 0) : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.client) newErrors.client = "Client is required";
    if (formData.amount < 0) newErrors.amount = "Amount cannot be negative";
    if (formData.paidToday < 0) newErrors.paidToday = "Paid amount cannot be negative";
    if (!debt?.saleId && !formData.productId) newErrors.productId = "Product is required for non-sale debts";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClientSelect = async (value) => {
    if (!clients.find((c) => c.name === value) && value.trim()) {
      setNewClient({ ...newClient, name: value });
      setShowClientForm(true);
    } else {
      handleChange("client", value);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim() || !user) return;

    try {
      const clientRef = await addDoc(collection(db, `users/${user.uid}/clients`), {
        name: newClient.name.trim(),
        email: newClient.email.trim() || null,
        phone: newClient.phone.trim() || null,
        address: newClient.address.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setFormData((prev) => ({ ...prev, client: newClient.name }));
      setNewClient({ name: "", email: "", phone: "", address: "" });
      setShowClientForm(false);
    } catch (err) {
      console.error("Error adding client:", err);
      setErrors({ submit: "Failed to add client. Please try again." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      const remainingAmount = formData.amount - (parseFloat(formData.paidToday) || 0);
      const debtData = {
        client: formData.client,
        amount: remainingAmount,
        productId: debt?.saleId ? null : formData.productId,
        notes: formData.notes || null,
        createdAt: new Date(formData.createdAt),
        updatedAt: new Date(),
        saleId: debt?.saleId || null,
      };

      const batch = writeBatch(db);
      let debtRef;

      if (debt) {
        debtRef = doc(db, `users/${user.uid}/debts`, debt.id);
        batch.update(debtRef, debtData);
      } else {
        debtRef = doc(collection(db, `users/${user.uid}/debts`));
        batch.set(debtRef, debtData);
      }

      if (debt?.saleId) {
        const saleRef = doc(db, `users/${user.uid}/sales`, debt.saleId);
        const saleSnap = await getDoc(saleRef);
        if (saleSnap.exists()) {
          const saleData = saleSnap.data();
          const newAmountPaid = (saleData.amountPaid || 0) + (parseFloat(formData.paidToday) || 0);
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

          if (remainingAmount === 0) {
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
    <>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {debt ? "Edit Debt" : "New Debt"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Error Alert */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
                </div>
              )}

              {/* Sale Link Alert */}
              {debt?.saleId && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-800 text-sm">
                    This debt is linked to a sale. Changes will update the sale's payment status.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client
                  </label>
                  <AutocompleteInput
                    options={clients.map((c) => ({ id: c.id, name: c.name }))}
                    value={formData.client}
                    onChange={handleClientSelect}
                    placeholder="Select or add new client"
                    allowNew
                    icon={<User className="w-5 h-5 text-gray-400" />}
                  />
                  {errors.client && (
                    <p className="text-red-600 text-sm font-medium">{errors.client}</p>
                  )}
                </div>

                {/* Product Field */}
                {!debt?.saleId && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Product
                    </label>
                    <AutocompleteInput
                      options={products.map((p) => ({ id: p.id, name: p.name }))}
                      value={formData.productId}
                      onChange={(value) => handleChange("productId", value)}
                      placeholder="Select product"
                      allowNew={false}
                      icon={<Package className="w-5 h-5 text-gray-400" />}
                    />
                    {errors.productId && (
                      <p className="text-red-600 text-sm font-medium">{errors.productId}</p>
                    )}
                  </div>
                )}

                {/* Amount Fields Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Total Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        UGX
                      </span>
                    </div>
                    {errors.amount && (
                      <p className="text-red-600 text-sm font-medium">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Paid Today
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.paidToday}
                        onChange={(e) => handleChange("paidToday", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        UGX
                      </span>
                    </div>
                    {errors.paidToday && (
                      <p className="text-red-600 text-sm font-medium">{errors.paidToday}</p>
                    )}
                  </div>
                </div>

                {/* Remaining Balance */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Remaining Balance</span>
                    <span className="text-lg font-bold text-red-600">
                      {(formData.amount - (parseFloat(formData.paidToday) || 0)).toLocaleString()} UGX
                    </span>
                  </div>
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(formData.createdAt, "yyyy-MM-dd")}
                    onChange={(e) => handleChange("createdAt", new Date(e.target.value))}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>

                {/* Notes Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                    placeholder="Add any additional notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Saving..." : debt ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Client</h3>
              </div>
              <button
                onClick={() => setShowClientForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <form onSubmit={handleAddClient} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter client name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Email</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="client@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Phone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+256 700 000 000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Address</label>
                    <textarea
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Client address"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowClientForm(false)}
                      className="flex-1 h-12 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newClient.name.trim()}
                      className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebtForm;