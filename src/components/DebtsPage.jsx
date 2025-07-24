import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus } from "lucide-react";
import DebtForm from "./debts/DebtForm";
import SalesForm from "./sales/SalesForm";
import DebtTable from "./debts/DebtTable";
import SummaryCards from "./debts/SummaryCards";
import SearchFilter from "./debts/SearchFilter";
import DateFilter from "./debts/DateFilter";

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
  const [loading, setLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: null,
    endDate: null,
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

  const handleDeleteDebt = async (id) => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/debts`, id));
      } catch (err) {
        console.error("Error deleting debt:", err);
      }
    }
  };

  const strawDebts = debts.filter(debt => {
    const product = products.find(p => p.id === debt.productId);
    return product?.name.toLowerCase().includes('straw');
  });

  const toiletPaperDebts = debts.filter(debt => {
    const product = products.find(p => p.id === debt.productId);
    return product?.name.toLowerCase().includes('toilet paper');
  });

  const strawTotal = strawDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
  const toiletPaperTotal = toiletPaperDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

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

      <SearchFilter
        filter={filter}
        setFilter={setFilter}
        filteredDebts={debts}
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Straw Debts</h2>
          <DebtTable
            debts={strawDebts}
            sales={sales}
            setEditingDebt={setEditingDebt}
            setShowForm={setShowForm}
            setEditingSale={setEditingSale}
            setShowSalesForm={setShowSalesForm}
            handleDeleteDebt={handleDeleteDebt}
            loading={loading}
            total={strawTotal}
            showTotalAtTop
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Toilet Paper Debts</h2>
          <DebtTable
            debts={toiletPaperDebts}
            sales={sales}
            setEditingDebt={setEditingDebt}
            setShowForm={setShowForm}
            setEditingSale={setEditingSale}
            setShowSalesForm={setShowSalesForm}
            handleDeleteDebt={handleDeleteDebt}
            loading={loading}
            total={toiletPaperTotal}
            showTotalAtTop
          />
        </div>
      </div>

      <button
        onClick={() => {
          setEditingDebt(null);
          setShowForm(true);
        }}
        className="fixed bottom-20 sm:bottom-24 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110 z-[100]"
      >
        <Plus className="w-6 h-6" />
      </button>

      <SummaryCards
        filteredDebts={debts}
        dateFilter={dateFilter}
        loading={loading}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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