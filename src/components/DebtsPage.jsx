// DebtsPage.jsx
import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Trash2, Edit, Search, X, Link, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import DebtForm from "./DebtForm";
import SalesForm from "./SalesForm";

const DebtsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [filter, setFilter] = useState("");
  const [debts, setDebts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const debtsQuery = query(collection(db, `users/${user.uid}/debts`));
      const unsubscribeDebts = onSnapshot(
        debtsQuery,
        (snapshot) => {
          const debtsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDebts(debtsData);
        },
        (err) => {
          console.error("Error fetching debts:", err);
        }
      );

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

      const salesQuery = query(collection(db, `users/${user.uid}/sales`));
      const unsubscribeSales = onSnapshot(
        salesQuery,
        (snapshot) => {
          const salesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSales(salesData);
        },
        (err) => {
          console.error("Error fetching sales:", err);
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
        unsubscribeDebts();
        unsubscribeClients();
        unsubscribeSales();
        unsubscribeProducts();
      };
    }
  }, [user]);

  const [filteredDebts, setFilteredDebts] = useState([]);

  useEffect(() => {
    const filtered = debts.filter(debt => {
      const matchesDebtor = debt.client?.toLowerCase().includes(filter.toLowerCase());
      return matchesDebtor;
    });
    setFilteredDebts(filtered);
  }, [filter, debts]);

  // Custom sort function for different data types
  const getSortValue = (row, columnId) => {
    const value = row.getValue(columnId);
    
    switch (columnId) {
      case 'client':
        return (value || '').toLowerCase();
      case 'amount':
        return Number(value) || 0;
      case 'createdAt':
        return value ? value.toDate().getTime() : 0;
      case 'status':
        return Number(row.original.amount) === 0 ? 0 : 1; // Paid first, then pending
      default:
        return value;
    }
  };

  const columns = [
    {
      header: "Debtor",
      accessorKey: "client",
      cell: info => info.getValue() || "-",
      sortingFn: (rowA, rowB, columnId) => {
        const a = getSortValue(rowA, columnId);
        const b = getSortValue(rowB, columnId);
        return a.localeCompare(b);
      },
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: info => (info.getValue() || 0).toLocaleString(),
      sortingFn: (rowA, rowB, columnId) => {
        const a = getSortValue(rowA, columnId);
        const b = getSortValue(rowB, columnId);
        return a - b;
      },
    },
    {
      header: "Status",
      accessorKey: "amount",
      id: "status",
      cell: info => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          info.getValue() === 0 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {info.getValue() === 0 ? 'Paid' : 'Pending'}
        </span>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = getSortValue(rowA, columnId);
        const b = getSortValue(rowB, columnId);
        return a - b;
      },
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info => info.getValue() ? format(info.getValue().toDate(), 'MMM dd, yyyy') : '-',
      sortingFn: (rowA, rowB, columnId) => {
        const a = getSortValue(rowA, columnId);
        const b = getSortValue(rowB, columnId);
        return a - b;
      },
    },
    {
      header: "Linked Sale",
      accessorKey: "saleId",
      enableSorting: false,
      cell: info => info.getValue() ? (
        <button
          onClick={() => {
            const sale = sales.find(s => s.id === info.getValue());
            setEditingSale(sale);
            setShowSalesForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
        >
          <Link className="w-3.5 h-3.5" />
          View Sale
        </button>
      ) : (
        <span className="text-neutral-400 text-sm">-</span>
      ),
    },
    {
      header: "Actions",
      enableSorting: false,
      cell: info => (
        <div className="flex items-center gap-2">
          {info.row.original.amount !== 0 && (
            <>
              <button
                onClick={() => {
                  setEditingDebt(info.row.original);
                  setShowForm(true);
                }}
                className="inline-flex items-center justify-center w-8 h-8 text-neutral-600 bg-neutral-100 hover:bg-blue-100 hover:text-blue-700 border border-neutral-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                title="Edit debt"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteDebt(info.row.original.id)}
                className="inline-flex items-center justify-center w-8 h-8 text-neutral-600 bg-neutral-100 hover:bg-red-100 hover:text-red-700 border border-neutral-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                title="Delete debt"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    columns,
    data: filteredDebts || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const handleDeleteDebt = async (id) => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/debts`, id));
      } catch (err) {
        console.error("Error deleting debt:", err);
      }
    }
  };

  // Helper function to render sort icon
  const renderSortIcon = (header) => {
    if (!header.column.getCanSort()) return null;
    
    const sortDirection = header.column.getIsSorted();
    
    return (
      <span className="ml-2 flex-shrink-0">
        {sortDirection === 'asc' && <ChevronUp className="w-4 h-4" />}
        {sortDirection === 'desc' && <ChevronDown className="w-4 h-4" />}
        {!sortDirection && <ChevronsUpDown className="w-4 h-4 text-neutral-400" />}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Debts Management</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingDebt(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 transform"
          >
            <Plus className="w-5 h-5" />
            <span>Add Debt</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search debts by client name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all duration-200"
              />
              {filter && (
                <button
                  onClick={() => setFilter("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {filteredDebts.length > 0 && (
              <div className="text-sm text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg">
                {filteredDebts.length} debt{filteredDebts.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider ${
                        header.column.getCanSort() 
                          ? 'cursor-pointer select-none hover:bg-neutral-100 transition-colors' 
                          : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {renderSortIcon(header)}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-neutral-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDebts.length === 0 && (
          <div className="text-center py-12 text-neutral-500 bg-neutral-25">
            <div className="text-lg font-medium mb-2">
              {filter ? "No matching debts found" : "No debts recorded yet"}
            </div>
            {filter && (
              <div className="text-sm">
                Try adjusting your search criteria
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <DebtForm
          debt={editingDebt}
          onClose={() => {
            setShowForm(false);
            setEditingDebt(null);
          }}
        />
      )}

      {showSalesForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <SalesForm
              sale={editingSale}
              clients={clients}
              products={products}
              onClose={() => {
                setShowSalesForm(false);
                setEditingSale(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsPage;