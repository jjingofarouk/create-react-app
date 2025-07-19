import React from "react";
import { X } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const ClientForm = ({ newClient, setNewClient, setShowClientForm, userId }) => {
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    
    try {
      await addDoc(collection(db, `users/${userId}/clients`), {
        name: newClient.name.trim(),
        email: newClient.email.trim() || null,
        phone: newClient.phone.trim() || null,
        address: newClient.address.trim() || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewClient({ name: "", email: "", phone: "", address: "" });
      setShowClientForm(false);
    } catch (err) {
      console.error("Error adding client:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-neutral-800">Add New Client</h3>
          <button
            onClick={() => {
              setShowClientForm(false);
              setNewClient({ name: "", email: "", phone: "", address: "" });
            }}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
              />
            </div>
          </form>
        </div>
        
        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowClientForm(false);
              setNewClient({ name: "", email: "", phone: "", address: "" });
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddClient}
            disabled={!newClient.name.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
          >
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
