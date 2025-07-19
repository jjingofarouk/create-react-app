import React, { useState, useMemo } from "react";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  X, 
  User, 
  Package, 
  Calendar,
  CalendarDays,
  TrendingUp,
  Award,
  DollarSign,
  Users
} from "lucide-react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel,
  flexRender 
} from "@tanstack/react-table";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import AutocompleteInput from "./AutocompleteInput";
import SalesForm from "./SalesForm";

const SalesPage = ({ sales, clients, products, userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'all', // 'all', 'today', 'week', 'month', 'custom'
    startDate: '',
    endDate: ''
  });
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [newClient, setNewClient] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    address: "" 
  });

  // Filter sales by date
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    if (dateFilter.type === 'all') return sales;
    
    const now = new Date();
    let startDate, endDate;
    
    switch (dateFilter.type) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'custom':
        if (!dateFilter.startDate || !dateFilter.endDate) return sales;
        startDate = startOfDay(parseISO(dateFilter.startDate));
        endDate = endOfDay(parseISO(dateFilter.endDate));
        break;
      default:
        return sales;
    }
    
    return sales.filter(sale => {
      if (!sale.date) return false;
      const saleDate = sale.date.toDate();
      return isWithinInterval(saleDate, { start: startDate, end: endDate });
    });
  }, [sales, dateFilter]);

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

  const handleDateFilterChange = (type) => {
    setDateFilter(prev => ({
      ...prev,
      type,
      startDate: type === 'custom' ? prev.startDate : '',
      endDate: type === 'custom' ? prev.endDate : ''
    }));
    if (type !== 'custom') {
      setShowDateFilter(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Client",
        accessorKey: "client",
        cell: info => (
          <div className="font-medium text-neutral-900">
            {info.getValue() || "-"}
          </div>
        ),
      },
      {
        header: "Product",
        accessorKey: "product",
        cell: info => (
          <div className="text-neutral-800">
            {products.find(prod => prod.id === info.getValue()?.productId)?.name || "-"}
          </div>
        ),
      },
      {
        header: "Quantity",
        accessorKey: "product",
        cell: info => (
          <div className="text-center font-medium">
            {info.getValue()?.quantity || 0}
          </div>
        ),
      },
      {
        header: "Unit Price",
        accessorKey: "product",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {(info.getValue()?.unitPrice || 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Discount",
        accessorKey: "product",
        cell: info => (
          <div className="font-mono text-sm text-orange-600">
            {info.getValue()?.discount > 0 ? `-UGX ${info.getValue().discount.toLocaleString()}` : "-"}
          </div>
        ),
      },
      {
        header: "Total",
        accessorKey: "totalAmount",
        cell: info => (
          <div className="font-mono font-semibold text-primary">
            UGX {(info.getValue() || 0).toLocaleString()}
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
            {(info.getValue() || 'unpaid').charAt(0).toUpperCase() + (info.getValue() || 'unpaid').slice(1)}
          </span>
        ),
      },
      {
        header: "Amount Paid",
        accessorKey: "amountPaid",
        cell: info => (
          <div className="font-mono text-sm">
            UGX {(info.getValue() || 0).toLocaleString()}
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: info => (
          <div className="text-sm text-neutral-600">
            {info.getValue() ? format(info.getValue().toDate(), 'MMM dd, yyyy') : '-'}
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
    [products]
  );

  const table = useReactTable({
    data: filteredSales || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const client = row.getValue('client')?.toLowerCase() || '';
      const product = products.find(prod => prod.id === row.getValue('product')?.productId)?.name.toLowerCase() || '';
      const paymentStatus = row.getValue('paymentStatus')?.toLowerCase() || '';
      const searchTerm = filterValue.toLowerCase();
      return client.includes(searchTerm) || product.includes(searchTerm) || paymentStatus.includes(searchTerm);
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

  // Enhanced statistics
  const salesAnalytics = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalPaid = filteredSales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
    const totalOutstanding = totalRevenue - totalPaid;
    
    // Client analytics
    const clientSales = {};
    filteredSales.forEach(sale => {
      const clientName = sale.client || 'Unknown';
      if (!clientSales[clientName]) {
        clientSales[clientName] = { total: 0, count: 0 };
      }
      clientSales[clientName].total += sale.totalAmount || 0;
      clientSales[clientName].count += 1;
    });
    
    const topClient = Object.entries(clientSales)
      .sort(([,a], [,b]) => b.total - a.total)[0];
    
    // Product analytics
    const productSales = {};
    filteredSales.forEach(sale => {
      const productName = products.find(prod => prod.id === sale.product?.productId)?.name || 'Unknown';
      if (!productSales[productName]) {
        productSales[productName] = { total: 0, quantity: 0, revenue: 0 };
      }
      productSales[productName].total += sale.product?.quantity || 0;
      productSales[productName].quantity += sale.product?.quantity || 0;
      productSales[productName].revenue += sale.totalAmount || 0;
    });
    
    const topProduct = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)[0];
    
    // Daily sales analytics
    const dailySales = {};
    filteredSales.forEach(sale => {
      if (sale.date) {
        const dateKey = format(sale.date.toDate(), 'yyyy-MM-dd');
        if (!dailySales[dateKey]) {
          dailySales[dateKey] = 0;
        }
        dailySales[dateKey] += sale.totalAmount || 0;
      }
    });
    
    const bestSalesDay = Object.entries(dailySales)
      .sort(([,a], [,b]) => b - a)[0];
    
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const paymentRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
    
    return {
      totalSales,
      totalRevenue,
      totalPaid,
      totalOutstanding,
      topClient: topClient ? { name: topClient[0], revenue: topClient[1].total, count: topClient[1].count } : null,
      topProduct: topProduct ? { name: topProduct[0], revenue: topProduct[1].revenue, quantity: topProduct[1].quantity } : null,
      bestSalesDay: bestSalesDay ? { date: bestSalesDay[0], revenue: bestSalesDay[1] } : null,
      averageSaleValue,
      paymentRate,
      uniqueClients: Object.keys(clientSales).length
    };
  }, [filteredSales, products]);

  const getDateFilterLabel = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return dateFilter.startDate && dateFilter.endDate 
          ? `${format(parseISO(dateFilter.startDate), 'MMM dd')} - ${format(parseISO(dateFilter.endDate), 'MMM dd')}`
          : 'Custom Range';
      default:
        return 'All Time';
    }
  };

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
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

      {/* Floating Date Filter Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
              dateFilter.type !== 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">{getDateFilterLabel()}</span>
          </button>
          
          {showDateFilter && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 w-80 max-w-[90vw]">
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-800 mb-3">Filter by Date</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDateFilterChange('all')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateFilter.type === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('today')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateFilter.type === 'today'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('week')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateFilter.type === 'week'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('month')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateFilter.type === 'month'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    This Month
                  </button>
                </div>
                
                <div className="pt-2 border-t border-neutral-200">
                  <button
                    onClick={() => handleDateFilterChange('custom')}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-colors mb-3 ${
                      dateFilter.type === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    Custom Range
                  </button>
                  
                  {dateFilter.type === 'custom' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="w-full px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredSales.length > 0 && (
        <>
          {/* Basic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-neutral-600">Total Sales</div>
              <div className="text-2xl font-bold text-neutral-900">{salesAnalytics.totalSales}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-neutral-600">Total Revenue</div>
              <div className="text-2xl font-bold text-primary">
                UGX {salesAnalytics.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-neutral-600">Amount Paid</div>
              <div className="text-2xl font-bold text-green-600">
                UGX {salesAnalytics.totalPaid.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
              <div className="text-sm text-neutral-600">Outstanding</div>
              <div className="text-2xl font-bold text-orange-600">
                UGX {salesAnalytics.totalOutstanding.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-blue-700">Average Sale Value</div>
                  <div className="text-lg font-bold text-blue-900">
                    UGX {salesAnalytics.averageSaleValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-green-700">Payment Rate</div>
                  <div className="text-lg font-bold text-green-900">
                    {salesAnalytics.paymentRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-purple-700">Unique Clients</div>
                  <div className="text-lg font-bold text-purple-900">
                    {salesAnalytics.uniqueClients}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {salesAnalytics.topClient && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-amber-700">Top Client</div>
                    <div className="font-bold text-amber-900">{salesAnalytics.topClient.name}</div>
                    <div className="text-sm text-amber-700">
                      UGX {salesAnalytics.topClient.revenue.toLocaleString()} ({salesAnalytics.topClient.count} sales)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {salesAnalytics.topProduct && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Package className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-teal-700">Top Product</div>
                    <div className="font-bold text-teal-900">{salesAnalytics.topProduct.name}</div>
                    <div className="text-sm text-teal-700">
                      UGX {salesAnalytics.topProduct.revenue.toLocaleString()} ({salesAnalytics.topProduct.quantity} units)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {salesAnalytics.bestSalesDay && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-rose-700">Best Sales Day</div>
                    <div className="font-bold text-rose-900">
                      {format(parseISO(salesAnalytics.bestSalesDay.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-rose-700">
                      UGX {salesAnalytics.bestSalesDay.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Fixed Container for Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 w-full max-w-full">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-neutral-800">
              Sales Records ({filteredSales.length})
              {dateFilter.type !== 'all' && (
                <span className="text-sm font-normal text-neutral-500 ml-2">
                  • {getDateFilterLabel()}
                </span>
              )}
            </h3>
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

        {/* Table Container with Fixed Height and Internal Scrolling */}
        <div className="relative max-h-[600px] overflow-auto">
          <table className="w-full divide-y divide-neutral-200 min-w-[900px]">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors whitespace-nowrap"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-neutral-400">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted()] ?? '↕'}
                        </span>
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
                    <td key={cell.id} className="px-6 py-4 text-sm whitespace-nowrap">
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