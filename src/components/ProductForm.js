import React from "react";
import { X } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const ProductForm = ({ newProduct, setNewProduct, setShowProductForm, userId }) => {
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) return;
    
    try {
      await addDoc(collection(db, `users/${userId}/products`), {
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNewProduct({ name: "", price: "" });
      setShowProductForm(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-neutral-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-neutral-800">Add New Product</h3>
          <button
            onClick={() => {
              setShowProductForm(false);
              setNewProduct({ name: "", price: "" });
            }}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Default Price (UGX) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
          </form>
        </div>
        
        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowProductForm(false);
              setNewProduct({ name: "", price: "" });
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProduct}
            disabled={!newProduct.name.trim() || !newProduct.price}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
