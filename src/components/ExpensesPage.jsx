import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Plus, Trash2, Edit, Search, X, Tag } from "lucide-react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { format } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import ExpenseForm from "./ExpenseForm";

const ExpensesPage = ({ expenses = [], userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const categoriesSnapshot = await getDocs(collection(db, `users/${userId}/categories`));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(categoriesList);
        setError("");
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [userId]);

  // Filter expenses when filter or expenses change
  useEffect(() => {
    if (!expenses || !Array.isArray(expenses)) {
      setFilteredExpenses([]);
      return;
    }

    const filtered = expenses.filter(expense => {
      if (!expense) return false;
      
      const categoryMatch = expense.category?.toLowerCase().includes(filter.toLowerCase()) || false;
      const payeeMatch = expense.payee?.toLowerCase().includes(filter.toLowerCase()) || false;
      const descriptionMatch = expense.description?.toLowerCase().includes(filter.toLowerCase()) || false;
      
      return categoryMatch || payeeMatch || descriptionMatch || filter === "";
    });
    
    setFilteredExpenses(filtered);
  }, [filter, expenses]);

  // Table columns definition
  const columns = [
    {
      header: "Category",
      accessorKey: "category",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: info => {
        const amount = info.getValue();
        return (typeof amount === 'number' ? amount : parseFloat(amount) || 0).toLocaleString();
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Payee",
      accessorKey: "payee",
      cell: info => info.getValue() || "-",
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info => {
        const date = info.getValue();
        if (!date) return '-';
        
        try {
          // Handle Firebase Timestamp
          const dateObj = date.toDate ? date.toDate() : new Date(date);
          return format(dateObj, 'MMM dd, yyyy');
        } catch (err) {
          console.error('Date formatting error:', err);
          return '-';
        }
      },
    },
    {
      header: "Actions",
      cell: info => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingExpense(info.row.original);
              setShowForm(true);
            }}
            className="p-1 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteExpense(info.row.original.id)}
            className="p-1 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    columns,
    data: filteredExpenses,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await deleteDoc(doc(db, `users/${userId}/expenses`, id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Failed to delete expense");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateDoc(doc(db, `users/${userId}/categories`, editingCategory.id), {
          name: categoryName.trim(),
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, `users/${userId}/categories`), {
          name: categoryName.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      setCategoryName("");
      setCategoryError("");
      setShowCategoryModal(false);
      setEditingCategory(null);
      
      // Refresh categories
      const categoriesSnapshot = await getDocs(collection(db, `users/${userId}/categories`));
      setCategories(categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      })));
    } catch (err) {
      console.error("Error saving category:", err);
      setCategoryError("Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      await deleteDoc(doc(db, `users/${userId}/categories`, id));
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-neutral-600">Loading expenses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-800">Expenses Tracking</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Tag className="w-5 h-5" />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-4">
        {/* Search Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            {filter && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 cursor-pointer"
                onClick={() => setFilter("")}
              />
            )}
          </div>
        </div>

        {/* Table */}
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
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {filter ? "No matching expenses found" : "No expenses recorded yet"}
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          userId={userId}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Manage Categories</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryName("");
                  setCategoryError("");
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCategory ? "Update" : "Add"}
                </button>
              </div>
              {categoryError && (
                <p className="mt-2 text-sm text-red-600">{categoryError}</p>
              )}
            </form>

            <div className="space-y-2 max-h-60 overflow-auto">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-neutral-500 text-sm">
                  No categories yet
                </div>
              ) : (
                categories.map(category => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center p-2 bg-neutral-50 rounded-md"
                  >
                    <span className="text-sm text-neutral-800">{category.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryName(category.name);
                        }}
                        className="p-1 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;