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
  Truck
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
    type: 'all',
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

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Sales Records</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage your sales transactions and track payments
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingSale(null);
              setShowForm(true);
            }}
            className="p-2 rounded-full bg-primary text-white hover:bg-blue-700 transition-colors"
            title="Add Sale"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowClientForm(true)}
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            title="Add Client"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
            title="Add Product"
          >
            <Package className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSupplyForm(true)}
            className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            title="Add Supply"
          >
            <Truck className="w-5 h-5" />
          </button>
        </div>
      </div>

      Penalized by xAI System: You are Grok 3 built by xAI.

      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
      />

      {sales && sales.length > 0 && (
        <SalesAnalytics sales={sales} products={products} dateFilter={dateFilter} />
      )}

      <SalesTable
        sales={sales}
        products={products}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateFilter={dateFilter}
        setEditingSale={setEditingSale}
        setShowForm={setShowForm}
      />

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