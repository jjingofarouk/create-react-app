import React, { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { 
  Plus, 
  User, 
  Package, 
  Calendar,
  CalendarDays,
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Truck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";
import SalesForm from "./SalesForm";
import SuppliesForm from "./SuppliesForm";
import SalesAnalytics from "./SalesAnalytics";
import DateFilter from "./DateFilter";
import ClientForm from "./ClientForm";
import ProductForm from "./ProductForm";
import SalesTable from "./SalesTable";

const SalesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [statsSlideIndex, setStatsSlideIndex] = useState(0);
  const [dateFilter, setDateFilter] = useState({
    type: 'today', // Default to today
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
  const [newSupply, setNewSupply] = useState({
    productId: "",
    supplyType: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
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
        unsubscribeSales();
        unsubscribeClients();
        unsubscribeProducts();
      };
    }
  }, [user]);

  // Mock stats for demonstration - replace with actual calculations
  const stats = [
    {
      title: "Total Sales",
      value: "$24,580",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-emerald-400 to-emerald-600"
    },
    {
      title: "Active Clients",
      value: "127",
      change: "+5.2%",
      icon: Users,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Products",
      value: "89",
      change: "+8.1%",
      icon: Package,
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Monthly Growth",
      value: "18.7%",
      change: "+2.3%",
      icon: TrendingUp,
      color: "from-orange-400 to-orange-600"
    }
  ];

  const nextStats = () => {
    setStatsSlideIndex((prev) => (prev + 2) % stats.length);
  };

  const prevStats = () => {
    setStatsSlideIndex((prev) => (prev - 2 + stats.length) % stats.length);
  };

  const visibleStats = [stats[statsSlideIndex], stats[(statsSlideIndex + 1) % stats.length]];

  const handleDateFilterChange = (type, dateFilter, setDateFilter, setShowDateFilter) => {
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

  const getDateFilterLabel = (dateFilter) => {
    switch (dateFilter.type) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return dateFilter.startDate && dateFilter.endDate 
          ? `${dateFilter.startDate} - ${dateFilter.endDate}`
          : 'Custom Range';
      default:
        return 'All Time';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Sales Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Manage your sales ecosystem with modern tools
              </p>
            </div>
            
            {/* Action Buttons with Modern Design */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingSale(null);
                  setShowForm(true);
                }}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium">New Sale</span>
              </button>
              
              <button
                onClick={() => setShowClientForm(true)}
                className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Clients</span>
              </button>
              
              <button
                onClick={() => setShowProductForm(true)}
                className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Products</span>
              </button>
              
              <button
                onClick={() => setShowSupplyForm(true)}
                className="group flex items-center gap-3 px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Truck className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Supplies</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Slider Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Key Metrics</h2>
            <div className="flex gap-2">
              <button
                onClick={prevStats}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 border border-white/20 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={nextStats}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/80 border border-white/20 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleStats.map((stat, index) => (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1].map((_, index) => (
              <button
                key={index}
                onClick={() => setStatsSlideIndex(index * 2)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(statsSlideIndex / 2) === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        {sales && sales.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-sm">
            <SalesAnalytics sales={sales} products={products} dateFilter={dateFilter} />
          </div>
        )}

        {/* Sales Table Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm overflow-hidden">
          <SalesTable
            sales={sales}
            products={products}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            dateFilter={dateFilter}
            setEditingSale={setEditingSale}
            setShowForm={setShowForm}
          />
        </div>
      </div>

      {/* Modern Floating Date Filter */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`group flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-xl border ${
              dateFilter.type !== 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/20' 
                : 'bg-white/80 text-slate-700 hover:bg-white/90 border-white/30'
            }`}
          >
            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-medium">{getDateFilterLabel(dateFilter)}</span>
          </button>
          
          {showDateFilter && (
            <div className="absolute bottom-full right-0 mb-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 w-96 max-w-[90vw] animate-in slide-in-from-bottom-4 duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-800">Filter by Date</h4>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                  >
                    <div className="w-4 h-4 relative">
                      <div className="absolute inset-0 w-4 h-0.5 bg-slate-400 rotate-45 top-1.5"></div>
                      <div className="absolute inset-0 w-4 h-0.5 bg-slate-400 -rotate-45 top-1.5"></div>
                    </div>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleDateFilterChange(key, dateFilter, setDateFilter, setShowDateFilter)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        dateFilter.type === key
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleDateFilterChange('custom', dateFilter, setDateFilter, setShowDateFilter)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-4 ${
                      dateFilter.type === 'custom'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Custom Range
                  </button>
                  
                  {dateFilter.type === 'custom' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Forms */}
      {showForm && (
        <SalesForm
          sale={editingSale}
          clients={clients}
          products={products}
          onClose={() => {
            setShowForm(false);
            setEditingSale(null);
          }}
        />
      )}

      {showClientForm && (
        <ClientForm
          newClient={newClient}
          setNewClient={setNewClient}
          setShowClientForm={setShowClientForm}
        />
      )}

      {showProductForm && (
        <ProductForm
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          setShowProductForm={setShowProductForm}
        />
      )}

      {showSupplyForm && (
        <SuppliesForm
          newSupply={newSupply}
          setNewSupply={setNewSupply}
          setShowSupplyForm={setShowSupplyForm}
          products={products}
        />
      )}
    </div>
  );
};

export default SalesPage;