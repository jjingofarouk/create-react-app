import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, Trash2, Edit, Search, X, Link, ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, TrendingDown, Calendar, Users, DollarSign, Clock } from "lucide-react";
import Skeleton from 'react-loading-skeleton';
import { flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table";
import 'react-loading-skeleton/dist/skeleton.css';
import AutocompleteInput from "./AutocompleteInput";
import DebtForm from "./debts/DebtForm";
import SalesForm from "./sales/SalesForm";
import DateFilter from "./debts/DateFilter";
import { format, differenceInDays } from "date-fns";

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
  const [loading, setLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      let loadedCount = 0;
      const totalCollections = 4;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalCollections) {
          setLoading(false);
        }
      };

      const debtsQuery = query(collection(db, `users/${user.uid}/debts`));
      const unsubscribeDebts = onSnapshot(
        debtsQuery,
        (snapshot) => {
          const debtsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDebts(debtsData);
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching debts:", err);
          checkAllLoaded();
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
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching clients:", err);
          checkAllLoaded();
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
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching sales:", err);
          checkAllLoaded();
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
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching products:", err);
          checkAllLoaded();
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
    const filtered = debts.filter((debt) => {
      if (!debt) return false;

      const matchesDebtor = debt.client?.toLowerCase().includes(filter.toLowerCase()) || false;

      let dateMatch = true;
      if (dateFilter.startDate && dateFilter.endDate && debt.createdAt) {
        const debtDate = debt.createdAt.toDate ? debt.createdAt.toDate() : new Date(debt.createdAt);
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        dateMatch = debtDate >= startDate && debtDate <= endDate;
      }

      return matchesDebtor && dateMatch;
    });
    setFilteredDebts(filtered);
  }, [filter, debts, dateFilter]);

  const summaryMetrics = React.useMemo(() => {
    const activeDebts = filteredDebts.filter((debt) => debt.amount > 0);
    const paidDebts = filteredDebts.filter((debt) => debt.amount === 0);

    const totalDebts = filteredDebts.length;
    const totalAmountOwed = activeDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

    const highestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeDebts[0])
        : null;

    const lowestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeDebts[0])
        : null;

    const oldestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((oldest, debt) => {
            const debtDate = debt.createdAt?.toDate();
            const oldestDate = oldest.createdAt?.toDate();
            return debtDate && oldestDate && debtDate < oldestDate ? debt : oldest;
          }, activeDebts[0])
        : null;

    const newestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((newest, debt) => {
            const debtDate = debt.createdAt?.toDate();
            const newestDate = newest.createdAt?.toDate();
            return debtDate && newestDate && debtDate > newestDate ? debt : newest;
          }, activeDebts[0])
        : null;

    const daysSinceOldest = oldestDebt?.createdAt
      ? differenceInDays(new Date(), oldestDebt.createdAt.toDate())
      : 0;

    return {
      totalDebts,
      activeDebts: activeDebts.length,
      paidDebts: paidDebts.length,
      totalAmountOwed,
      highestDebt,
      lowestDebt,
      oldestDebt,
      newestDebt,
      daysSinceOldest,
      averageDebtAmount: activeDebts.length > 0 ? totalAmountOwed / activeDebts.length : 0,
    };
  }, [filteredDebts]);

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
        return Number(row.original.amount) === 0 ? 0 : 1;
      default:
        return value;
    }
  };

  const columns = [
    {
      header: "Debtor",
      accessorKey: "client",
      cell: (info) => info.getValue() || "-",
      sortingFn: (rowA, rowB, columnId) => {
        const a = getSortValue(rowA, columnId);
        const b = getSortValue(rowB, columnId);
        return a.localeCompare(b);
      },
    },
    {
      header: "Amount (UGX)",
      accessorKey: "amount",
      cell: (info) => {
        const value = parseFloat(info.getValue()) || 0;
        return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      },
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
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            info.getValue() === 0
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-amber-100 text-amber-700 border border-amber-200'
          }`}
        >
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
      cell: (info) => (info.getValue() ? format(info.getValue().toDate(), 'MMM dd, yyyy') : '-'),
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
      cell: (info) =>
        info.getValue() ? (
          <button
            onClick={() => {
              const sale = sales.find((s) => s.id === info.getValue());
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
      cell: (info) => (
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
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualPagination: false,
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

  const SummaryCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={40} width={40} borderRadius={8} />
                <Skeleton height={16} width={60} />
              </div>
              <Skeleton height={28} width="80%" className="mb-2" />
              <Skeleton height={16} width="100%" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
              {dateFilter.type === 'all' ? 'Total' : dateFilter.type.charAt(0).toUpperCase() + dateFilter.type.slice(1)}
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.totalDebts}</div>
          <p className="text-sm text-neutral-600">
            {dateFilter.type === 'all' ? 'Total Debts' : `Debts for ${dateFilter.type}`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">Active</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.activeDebts}</div>
          <p className="text-sm text-neutral-600">Pending Debts</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">Amount</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">
            {summaryMetrics.totalAmountOwed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX
          </div>
          <p className="text-sm text-neutral-600">
            {dateFilter.type === 'all' ? 'Total Amount Owed' : `Amount Owed for ${dateFilter.type}`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Paid</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.paidDebts}</div>
          <p className="text-sm text-neutral-600">Paid Debts</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">Highest</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">
            {summaryMetrics.highestDebt ? `${summaryMetrics.highestDebt.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX` : '0 UGX'}
          </div>
          <p className="text-sm text-neutral-600 truncate">
            {summaryMetrics.highestDebt ? summaryMetrics.highestDebt.client || 'Unknown Client' : 'No debts'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Lowest</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">
            {summaryMetrics.lowestDebt ? `${summaryMetrics.lowestDebt.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX` : '0 UGX'}
          </div>
          <p className="text-sm text-neutral-600 truncate">
            {summaryMetrics.lowestDebt ? summaryMetrics.lowestDebt.client || 'Unknown Client' : 'No debts'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">Oldest</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.daysSinceOldest} days</div>
          <p className="text-sm text-neutral-600 truncate">
            {summaryMetrics.oldestDebt ? summaryMetrics.oldestDebt.client || 'Unknown Client' : 'No debts'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded">Average</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 mb-1">
            {Math.round(summaryMetrics.averageDebtAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX
          </div>
          <p className="text-sm text-neutral-600">Average Debt Amount</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
          Debts Management
        </h1>
        <div className="mt-4">
          <DateFilter
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            showDateFilter={showDateFilter}
            setShowDateFilter={setShowDateFilter}
          />
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
          {loading ? (
            <div className="p-6">
              <Skeleton height={40} className="mb-4" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} className="mb-2" />
              ))}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
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
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 border-t border-neutral-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">Rows per page:</span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                      }}
                      className="border border-neutral-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[10, 20, 30, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-neutral-600">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-3 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-3 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && filteredDebts.length === 0 && (
          <div className="text-center py-12 text-neutral-500 bg-neutral-25">
            <div className="text-lg font-medium mb-2">
              {filter || dateFilter.type !== 'all' ? "No matching debts found" : "No debts recorded yet"}
            </div>
            <div className="text-sm">
              {filter
                ? "Try adjusting your search criteria"
                : dateFilter.type !== 'all'
                ? "Try adjusting your date filter"
                : "Add a debt to get started"}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setEditingDebt(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      <SummaryCards />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <DebtForm
              debt={editingDebt}
              onClose={() => {
                setShowForm(false);
                setEditingDebt(null);
              }}
            />
          </div>
        </div>
      )}

      {showSalesForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
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