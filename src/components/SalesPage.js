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
  const [supplies, setSupplies] = useState([]);
  const [user, setUser] = useState(null);
  const [clientPage, setClientPage] = useState(1);
  const [clientSort, setClientSort] = useState('name');
  const clientsPerPage = 10;

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

      const suppliesQuery = query(collection(db, `users/${user.uid}/supplies`));
      const unsubscribeSupplies = onSnapshot(
        suppliesQuery,
        (snapshot) => {
          const suppliesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSupplies(suppliesData);
        },
        (err) => {
          console.error("Error fetching supplies:", err);
        }
      );

      return () => {
        unsubscribeSales();
        unsubscribeClients();
        unsubscribeProducts();
        unsubscribeSupplies();
      };
    }
  }, [user]);

  const getFilteredSupplies = () => {
    let filtered = supplies;
    if (dateFilter.type !== 'all') {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = supplies.filter(supply => {
        const supplyDate = new Date(supply.date);
        return supplyDate >= start && supplyDate <= end;
      });
    }
    return filtered;
  };

  const getSortedProducts = () => {
    const productSales = products.map(product => {
      const totalSales = sales
        .filter(sale => sale.productId === product.id)
        .reduce((sum, sale) => sum + sale.quantity, 0);
      return { ...product, totalSales };
    });
    return productSales.sort((a, b) => b.totalSales - a.totalSales);
  };

  const getSortedClients = () => {
    const clientsWithPurchases = clients.map(client => {
      const totalPurchases = sales
        .filter(sale => sale.clientId === client.id)
        .reduce((sum, sale) => sum + (sale.quantity * products.find(p => p.id === sale.productId)?.price || 0), 0);
      return { ...client, totalPurchases };
    });

    switch (clientSort) {
      case 'name':
        return clientsWithPurchases.sort((a, b) => a.name.localeCompare(b.name));
      case 'purchases':
        return clientsWithPurchases.sort((a, b) => b.totalPurchases - a.totalPurchases);
      default:
        return clientsWithPurchases;
    }
  };

  const paginatedClients = getSortedClients().slice(
    (clientPage - 1) * clientsPerPage,
    clientPage * clientsPerPage
  );
  const totalClientPages = Math.ceil(getSortedClients().length / clientsPerPage);

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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Supplies</h2>
          <p className="text-slate-600">Record of all supply transactions</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Product</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSupplies().map((supply) => (
                  <tr key={supply.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {products.find(p => p.id === supply.productId)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{supply.supplyType}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{supply.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(supply.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Products</h2>
          <p className="text-slate-600">All products sorted by total sales</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSortedProducts().map((product) => (
              <div key={product.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                    <p className="text-sm text-slate-600">Price: UGX {product.price.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">Total Sold: {product.totalSales} units</p>
                  </div>
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Clients</h2>
          <p className="text-slate-600">All clients with sorting and pagination</p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mr-2">Sort by:</label>
            <select
              value={clientSort}
              onChange={(e) => setClientSort(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Name</option>
              <option value="purchases">Total Purchases</option>
            </select>
          </div>
          <div className="space-y-4">
            {paginatedClients.map((client) => (
              <div key={client.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{client.name}</h3>
                    {client.email && <p className="text-sm text-slate-600">Email: {client.email}</p>}
                    {client.phone && <p className="text-sm text-slate-600">Phone: {client.phone}</p>}
                    {client.address && <p className="text-sm text-slate-600">Address: {client.address}</p>}
                    <p className="text-sm text-slate-600">Total Purchases: UGX {client.totalPurchases.toFixed(2)}</p>
                  </div>
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setClientPage(prev => Math.max(prev - 1, 1))}
              disabled={clientPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {clientPage} of {totalClientPages}
            </span>
            <button
              onClick={() => setClientPage(prev => Math.min(prev + 1, totalClientPages))}
              disabled={clientPage === totalClientPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

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