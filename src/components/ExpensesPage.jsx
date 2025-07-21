import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Trash2, Edit, Search, X, Tag, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel } from "@tanstack/react-table";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AutocompleteInput from "./AutocompleteInput";
import ExpenseForm from "./ExpenseForm";
import DateFilter from "./DateFilter";

const ExpensesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sorting, setSorting] = useState([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'today',
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0]
  });

  const keyMetrics = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      return {
        totalExpenses: 0,
        thisMonthTotal: 0,
        highestExpense: { amount: 0, description: "N/A" },
        topCategory: { name: "N/A", total: 0 },
        avgExpense: 0,
        expenseCount: 0
      };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    const thisMonthExpenses = filteredExpenses.filter(expense => {
      if (!expense.createdAt) return false;
      const expenseDate = expense.createdAt.toDate ? expense.createdAt.toDate() : new Date(expense.createdAt);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    
    const highestExpense = filteredExpenses.reduce((max, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return amount > max.amount ? { amount, description: expense.description || "N/A" } : max;
    }, { amount: 0, description: "N/A" });

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || "Uncategorized";
      const amount = parseFloat(expense.amount) || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals).reduce(
      (max, [name, total]) => total > max.total ? { name, total } : max,
      { name: "N/A", total: 0 }
    );

    const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    return {
      totalExpenses,
      thisMonthTotal,
      highestExpense,
      topCategory,
      avgExpense,
      expenseCount: filteredExpenses.length
    };
  }, [filteredExpenses]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const expensesQuery = query(collection(db, `users/${user.uid}/expenses`));
      const unsubscribeExpenses = onSnapshot(
        expensesQuery,
        (snapshot) => {
          const expensesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setExpenses(expensesData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching expenses:", err);
          setError("Failed to load expenses");
          setLoading(false);
        }
      );

      const categoriesQuery = query(collection(db, `users/${user.uid}/categories`));
      const unsubscribeCategories = onSnapshot(
        categoriesQuery,
        (snapshot) => {
          const categoriesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setCategories(categoriesList);
          setError("");
        },
        (err) => {
          console.error("Error fetching categories:", err);
          setError("Failed to load categories");
        }
      );

      return () => {
        unsubscribeExpenses();
        unsubscribeCategories();
      };
    }
  }, [user]);

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

      let dateMatch = true;
      if (dateFilter.startDate && dateFilter.endDate && expense.createdAt) {
        const expenseDate = expense.createdAt.toDate ? expense.createdAt.toDate() : new Date(expense.createdAt);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        dateMatch = expenseDate >= startDate && expenseDate <= endDate;
      }

      return (categoryMatch || payeeMatch || descriptionMatch || filter === "") && dateMatch;
    });
    
    setFilteredExpenses(filtered);
  }, [filter, expenses, dateFilter]);

  const columns = [
    {
      header: "Category",
      accessorKey: "category",
      cell: info => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {info.getValue() || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: info => {
        const amount = info.getValue();
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return (
          <span className="font-semibold text-green-700">
            {numAmount.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: info => (
        <span className="text-gray-900 font-medium">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      header: "Payee",
      accessorKey: "payee",
      cell: info => (
        <span className="text-gray-600">
          {info.getValue() || "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: info => {
        const date = info.getValue();
        if (!date) return '-';
        
        try {
          const dateObj = date.toDate ? date.toDate() : new Date(date);
          return (
            <span className="text-gray-500 text-sm">
              {format(dateObj, 'MMM dd, yyyy')}
            </span>
          );
        } catch (err) {
          console.error('Date formatting error:', err);
          return '-';
        }
      },
    },
    {
      header: "Actions",
      cell: info => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setEditingExpense(info.row.original);
              setShowForm(true);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteExpense(info.row.original.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    columns,
    data: filteredExpenses,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/expenses`, id));
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
        await updateDoc(doc(db, `users/${user?.uid}/categories`, editingCategory.id), {
          name: categoryName.trim(),
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, `users/${user?.uid}/categories`), {
          name: categoryName.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      setCategoryName("");
      setCategoryError("");
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Error saving category:", err);
      setCategoryError("Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/categories`, id));
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton height={32} width={200} />
          <div className="flex gap-3">
            <Skeleton height={40} width={120} />
            <Skeleton height={40} width={150} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Skeleton circle height={48} width={48} />
                <Skeleton height={20} width={60} />
              </div>
              <Skeleton height={32} width={100} className="mb-2" />
              <Skeleton height={16} width={80} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="mb-6">
            <Skeleton thyself={40} width={300} />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton height={20} width={100} />
                <Skeleton height={20} width={80} />
                <Skeleton height={20} width={150} />
                <Skeleton height={20} width={100} />
                <Skeleton height={20} width={80} />
                <Skeleton height={20} width={60} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-hidden bg-white">
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
              Expense Tracker
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
              Manage and analyze your spending with our comprehensive expense tracking platform.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setEditingExpense(null);
                setShowForm(true);
              }}
              className="group bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow fathom-blue-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Add Expense</div>
                  <div className="text-xs text-slate-500 mt-1">New Transaction</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="group bg-white hover:bg-gray-50 border-2 border-slate-200 hover:border-gray-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                  <Tag className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Categories</div>
                  <div className="text-xs text-slate-500 mt-1">Manage Categories</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              TOTAL
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            UGX {keyMetrics.totalExpenses.toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm">{dateFilter.type === 'all' ? 'All time expenses' : `Expenses for ${dateFilter.type}`}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              THIS MONTH
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            UGX {keyMetrics.thisMonthTotal.toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm">{format(new Date(), 'MMMM yyyy')}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              HIGHEST
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            UGX {keyMetrics.highestExpense.amount.toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm truncate">
            {keyMetrics.highestExpense.description}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              TOP CATEGORY
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            UGX {keyMetrics.topCategory.total.toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm">
            {keyMetrics.topCategory.name}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              <p className="text-gray-500 text-sm mt-1">
                {keyMetrics.expenseCount} total expenses • Average: UGX {keyMetrics.avgExpense.toLocaleString()}
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
              />
              {filter && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => setFilter("")}
                />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter || dateFilter.type !== 'all' ? "No matching expenses found" : "No expenses recorded yet"}
            </h3>
            <p className="text-gray-500">
              {filter || dateFilter.type !== 'all' ? "Try adjusting your search terms or date filter" : "Add your first expense to get started"}
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Manage Categories</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryName("");
                  setCategoryError("");
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
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
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No categories yet</p>
                </div>
              ) : (
                categories.map(category => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryName(category.name);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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