import React, { useState, useEffect } from "react";
import { addDoc, doc, updateDoc, collection, query, onSnapshot, getDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "../../firebase";
import AutocompleteInput from "../AutocompleteInput";
import { X, User, Package } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200">
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                onChange={handleClientSelect}
                placeholder="Select or type client name"
                allowNew
                icon={<User className="w-5 h-5 text-neutral-400" />}
              />
              {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
            </div>

            {!debt?.saleId && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product</label>
                <AutocompleteInput
                  options={products.map((p) => ({ id: p.id, name: p.name }))}
                  value={formData.productId}
                  onChange={(value) => handleChange("productId", value)}
                  placeholder="Select product"
                  allowNew={false}
                  icon={<Package className="w-5 h-5 text-neutral-400" />}
                />
                {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Total Amount (UGX)</label>
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Paid Today (UGX)</label>
              <input
                type="number"
                value={formData.paidToday}
                onChange={(e) => handleChange("paidToday", e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.paidToday && <p className="mt-1 text-sm text-red-600">{errors.paidToday}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Remaining Balance (UGX)</label>
              <input
                type="text"
                value={(formData.amount - (parseFloat(formData.paidToday) || 0)).toLocaleString()}
                readOnly
                className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-100 text-neutral-600"
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

        {showClientForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col" style={{ maxHeight: '80vh' }}>
              <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Add New Client</h3>
                <button
                  onClick={() => setShowClientForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      placeholder="+256 700 000 000"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      placeholder="Client address"
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowClientForm(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newClient.name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default DebtForm;