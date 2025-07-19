// src/App.js
import React, { useState, useEffect } from "react";
import { auth, db, onSnapshot, collection, query } from "./firebase";
import HomePage from "./components/HomePage";
import SalesPage from "./components/SalesPage";
import ExpensesPage from "./components/ExpensesPage";
import DebtsPage from "./components/DebtsPage";
import ProfilePage from "./components/ProfilePage";
import ReportsPage from "./components/ReportsPage";
import Auth from "./components/Auth";
import { Home, ShoppingCart, TrendingDown, FileText, User, AlertCircle, CreditCard } from "lucide-react";
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const salesQuery = query(collection(db, `users/${user.uid}/sales`));
        const debtsQuery = query(collection(db, `users/${user.uid}/debts`));
        const expensesQuery = query(collection(db, `users/${user.uid}/expenses`));
        const productsQuery = query(collection(db, `users/${user.uid}/products`));
        const clientsQuery = query(collection(db, `users/${user.uid}/clients`));

        const unsubscribeSales = onSnapshot(
          salesQuery,
          (snapshot) => {
            const salesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setSales(salesData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching sales:", err);
            setError("Failed to load sales. Please try again.");
            setLoading(false);
          }
        );

        const unsubscribeDebts = onSnapshot(
          debtsQuery,
          (snapshot) => {
            const debtsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setDebts(debtsData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching debts:", err);
            setError("Failed to load debts. Please try again.");
            setLoading(false);
          }
        );

        const unsubscribeExpenses = onSnapshot(
          expensesQuery,
          (snapshot) => {
            const expensesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExpenses(expensesData);
            setCategories([...new Set(expensesData.map((e) => e.category).filter(Boolean))]);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching expenses:", err);
            setError("Failed to load expenses. Please try again.");
            setLoading(false);
          }
        );

        const unsubscribeProducts = onSnapshot(
          productsQuery,
          (snapshot) => {
            const productsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(productsData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
            setLoading(false);
          }
        );

        const unsubscribeClients = onSnapshot(
          clientsQuery,
          (snapshot) => {
            const clientsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setClients(clientsData);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching clients:", err);
            setError("Failed to load clients. Please try again.");
            setLoading(false);
          }
        );

        return () => {
          unsubscribeSales();
          unsubscribeDebts();
          unsubscribeExpenses();
          unsubscribeProducts();
          unsubscribeClients();
        };
      } else {
        setSales([]);
        setDebts([]);
        setExpenses([]);
        setClients([]);
        setProducts([]);
        setCategories([]);
        setLoading(false);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: "home", name: "Home", icon: Home },
    { id: "sales", name: "Sales", icon: ShoppingCart },
    { id: "expenses", name: "Expenses", icon: TrendingDown },
    { id: "debts", name: "Debts", icon: CreditCard },
    { id: "reports", name: "Reports", icon: FileText },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-5">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
          <p className="text-neutral-600 text-center">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!user) {
      return <Auth />;
    }

    switch (activeTab) {
      case "home":
        return (
          <HomePage
            sales={sales}
            debts={debts}
            expenses={expenses}
            clients={clients}
            products={products}
            categories={categories}
            userId={user.uid}
          />
        );
      case "sales":
        return (
          <SalesPage
            sales={sales}
            clients={clients}
            products={products}
            userId={user.uid}
          />
        );
      case "expenses":
        return (
          <ExpensesPage
            expenses={expenses}
            categories={categories}
            userId={user.uid}
          />
        );
      case "debts":
        return (
          <DebtsPage
            debts={debts}
            sales={sales}
            clients={clients}
            userId={user.uid}
          />
        );
      case "reports":
        return (
          <ReportsPage
            sales={sales}
            debts={debts}
            expenses={expenses}
            userId={user.uid}
          />
        );
      case "profile":
        return <ProfilePage user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">Sales Tracker</h1>
          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab("profile")}
                className="p-2 rounded-full hover:bg-neutral-100 transition-all duration-200"
              >
                <User className="w-6 h-6 text-neutral-600" />
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 hover:shadow-md transition-all duration-200"
                onClick={() => auth.signOut()}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {renderContent()}
      </main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
                  )}
                  <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform duration-200`} />
                  <span className={`${activeTab === tab.id ? 'font-semibold' : ''}`}>
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;