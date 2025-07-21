import React, { useState, useEffect } from "react";
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
  const [dateFilter, setDateFilter] = useState({
    type: 'today',
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [newSupply, setNewSupply] = useState({
    productId: "",
    supplyType: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
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

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-auto bg-white">
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
              Sales Dashboard
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
              Monitor your sales performance, manage transactions, and track your business growth with our comprehensive analytics platform.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
            <button
              onClick={() => {
                setEditingSale(null);
                setShowForm(true);
              }}
              className="group bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Add Sale</div>
                  <div className="text-xs text-slate-500 mt-1">New Transaction</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowClientForm(true)}
              className="group bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Clients</div>
                  <div className="text-xs text-slate-500 mt-1">Manage Customers</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowProductForm(true)}
              className="group bg-white hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Products</div>
                  <div className="text-xs text-slate-500 mt-1">Inventory Items</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowSupplyForm(true)}
              className="group bg-white hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/50 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-slate-800 text-sm">Supplies</div>
                  <div className="text-xs text-slate-500 mt-1">Stock Management</div>
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

      {sales && sales.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Performance Analytics</h2>
            <p className="text-slate-600">Real-time insights into your sales performance and trends</p>
          </div>
          <div className="p-6">
            <SalesAnalytics sales={sales} products={products} dateFilter={dateFilter} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Sales Transactions</h2>
              <p className="text-slate-600">Complete record of all your sales activities</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
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

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-x-auto">
          <div className="w-full max-w-lg">
            <SalesForm
              sale={editingSale}
              clients={clients}
              products={products}
              onClose={() => {
                setShowForm(false);
                setEditingSale(null);
              }}
            />
          </div>
        </div>
      )}

      {showClientForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-x-auto">
          <div className="w-full max-w-lg">
            <ClientForm
              newClient={newClient}
              setNewClient={setNewClient}
              setShowClientForm={setShowClientForm}
            />
          </div>
        </div>
      )}

      {showProductForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-x-auto">
          <div className="w-full max-w-lg">
            <ProductForm
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              setShowProductForm={setShowProductForm}
            />
          </div>
        </div>
      )}

      {showSupplyForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-x-auto">
          <div className="w-full max-w-lg">
            <SuppliesForm
              newSupply={newSupply}
              setNewSupply={setNewSupply}
              setShowSupplyForm={setShowSupplyForm}
              products={products}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;