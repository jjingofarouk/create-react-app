// src/components/SalesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit, Search, X } from "lucide-react";
import { useReactTable, useFilters, useSortBy } from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import SalesForm from "./SalesForm";

const SalesPage = ({ sales, clients, products, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredSales, setFilteredSales] = useState(sales);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  useEffect(() => {
    const filtered = sales.filter(sale => {
      const matchesClient = sale.client?.toLowerCase().includes(filter.toLowerCase());
      const matchesProduct = sale.product?.toLowerCase().includes(filter.toLowerCase());
      return matchesClient || matchesProduct;
    });
    setFilteredSales(filtered);
  }, [filter, sales]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, `users/${userId}/products`), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        createdAt: new Date()
      });
      setNewProduct({ name: "", price: "" });
      setShowProductForm(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Client",
        accessorKey: "client",
        cell: info => info.getValue(),
      },
      {
        header: "Product",
        accessorKey: "product",
        cell: info => info.getValue(),
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        cell: info => info.getValue(),
      },
      {
        header: "Unit Price",
        accessorKey: "unitPrice",
        cell: info => `UGX ${info.getValue().toLocaleString()}`,
      },
      {
        header: "Discount",
        accessorKey: "discount",
        cell: info => `UGX ${info.getValue().toLocaleString()}`,
      },
      {
        header: "Total",
        accessorKey: "totalAmount",
        cell: info => `UGX ${info.getValue().toLocaleString()}`,
      },
      {
        header: "Payment",
        accessorKey: "paymentStatus",
        cell: info => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'paid' ? 'bg-success-100 text-success-800' :
            info.getValue() === 'partial' ? 'bg-warning-100 text-warning-800' :
            'bg-error-100 text-error-800'
          }`}>
            {info.getValue()}
          </span>
        ),
      },
      {
        header: "Paid",
        accessorKey: "amountPaid",
        cell: info => `UGX ${info.getValue().toLocaleString()}`,
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: info => format(info.getValue().toDate(), 'MMM dd, yyyy'),
      },
      {
        header: "Actions",
        cell: info => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingSale(info.row.original);
                setShowForm(true);
              }}
              className="p-1 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteSale(info.row.original.id)}
              className="p-1 text-neutral-500 hover:text-danger hover:bg-neutral-100 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable(
    {
      columns,
      data: filteredSales,
    },
    useFilters,
    useSortBy
  );

  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/sales`, id));
        // Check if this sale has an associated debt and delete it
        const debtsQuery = query(
          collection(db, `users/${userId}/debts`),
          where("saleId", "==", id)
        );
        const querySnapshot = await getDocs(debtsQuery);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (err) {
        console.error("Error deleting sale:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Sales Records</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingSale(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Sale</span>
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-green-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
            {filter && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 cursor-pointer"
                onClick={() => setFilter("")}
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                    >
                      {header.column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-neutral-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                      {cell.renderCell()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {filter ? "No matching sales found" : "No sales recorded yet"}
          </div>
        )}
      </div>

      {showForm && (
        <SalesForm
          sale={editingSale}
          clients={clients}
          products={products}
          userId={userId}
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
        />
      )}

      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Add New Product</h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Default Price (UGX)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;