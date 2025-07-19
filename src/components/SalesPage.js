import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit, Search, X, User, Package } from "lucide-react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel,
  flexRender 
} from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import SalesForm from "./SalesForm";

const SalesPage = ({ sales, clients, products, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [newClient, setNewClient] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "" 
  });

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

  const columns = useMemo(
    () => [
      {
        header: "Client",
        accessorKey: "client",
        cell: info => (
          <div className="font-medium text-neutral-900">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Product",
        accessorKey: "product",
        cell: info => (
          <div className="text-neutral-800">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        cell: info => (
          <div className="text-center font-medium">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Unit Price",
        accessorKey: "unitPrice",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {info.getValue().toLocaleString()}
          </div>
        ),
      },
      {
        header: "Discount",
        accessorKey: "discount",
        cell: info => (
          <div className="font-mono text-sm text-orange-600">
            {info.getValue() > 0 ? `-UGX ${info.getValue().toLocaleString()}` : '-'}
          </div>
        ),
      },
      {
        header: "Total",
        accessorKey: "totalAmount",
        cell: info => (
          <div className="font-mono font-semibold text-primary">
            UGX {info.getValue().toLocaleString()}
          </div>
        ),
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        cell: info => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() === 'paid' ? 'bg-green-100 text-green-800' :
            info.getValue() === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
          </span>
        ),
      },
      {
        header: "Amount Paid",
        accessorKey: "amountPaid",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {info.getValue().toLocaleString()}
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: info => (
          <div className="text-sm text-neutral-600">
            {format(info.getValue().toDate(), 'MMM dd, yyyy')}
          </div>
        ),
      },
      {
        header: "Actions",
        cell: info => (
          <div className="flex gap-1">
            <button
              onClick={() => {
                setEditingSale(info.row.original);
                setShowForm(true);
              }}
              className="p-2 text-neutral-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit sale"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteSale(info.row.original.id)}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete sale"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: sales,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.getValue('client')?.toLowerCase() || '';
      const product = row.getValue('product')?.toLowerCase() || '';
      const paymentStatus = row.getValue('paymentStatus')?.toLowerCase() || '';
      const searchTerm = filterValue.toLowerCase();
      return client.includes(searchTerm) || 
             product.includes(searchTerm) || 
             paymentStatus.includes(searchTerm);
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale? This action cannot be undone.")) {
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
        alert("Failed to delete sale. Please try again.");
      }
    }
  };

  // Calculate summary statistics
  const salesSummary = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPaid = sales.reduce((sum, sale) => sum + sale.amountPaid, 0);
    const totalOutstanding = totalRevenue - totalPaid;
    
    return {
      totalSales,
      totalRevenue,
      totalPaid,
      totalOutstanding
    };
  }, [sales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Sales Records</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your sales transactions and track payments
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingSale(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sale</span>
          </button>
          <button
            onClick={() => setShowClientForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <User className="w-4 h-4" />
            <span>Add Client</span>
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Package className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="text-sm text-neutral-600">Total Sales</div>
            <div className="text-2xl font-bold text-neutral-900">{salesSummary.totalSales}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="text-sm text-neutral-600">Total Revenue</div>
            <div className="text-2xl font-bold text-primary">
              UGX {salesSummary.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="text-sm text-neutral-600">Amount Paid</div>
            <div className="text-2xl font-bold text-green-600">
              UGX {salesSummary.totalPaid.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <div className="text-sm text-neutral-600">Outstanding</div>
            <div className="text-2xl font-bold text-orange-600">
              UGX {salesSummary.totalOutstanding.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 w-full">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-neutral-800">All Sales</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by client, product, or status..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-[1200px] divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <div className="mb-2">
              {globalFilter ? "No matching sales found" : "No sales recorded yet"}
            </div>
            {!globalFilter && (
              <button
                onClick={() => {
                  setEditingSale(null);
                  setShowForm(true);
                }}
                className="text-primary hover:text-blue-700 font-medium"
              >
                Create your first sale
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sales Form Modal */}
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

      {/* Add Client Modal */}
      {showClientForm && (
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
      )}

      {/* Add Product Modal */}
      {showProductForm && (
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
      )}
    </div>
  );
};

export default SalesPage;