import React, { useState, useEffect } from "react";
import { auth, db, onSnapshot, collection, query } from "./firebase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceSummary from "./components/BalanceSummary";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import DebtForm from "./components/DebtForm";
import DebtTable from "./components/DebtTable";
import Auth from "./components/Auth";
import { Home, DollarSign, TrendingUp, TrendingDown, User, AlertCircle } from "lucide-react";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const transQuery = query(collection(db, `users/${user.uid}/transactions`));
        const debtsQuery = query(collection(db, `users/${user.uid}/debts`));

        const unsubscribeTrans = onSnapshot(
          transQuery,
          (snapshot) => {
            const transData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTransactions(transData);
            setClients([...new Set(transData.map((t) => t.client).filter(Boolean))]);
            setCategories([...new Set(transData.map((t) => t.category).filter(Boolean))]);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching transactions:", err);
            setError("Failed to load transactions. Please try again.");
            setLoading(false);
          }
        );

        const unsubscribeDebts = onSnapshot(
          debtsQuery,
          (snapshot) => {
            const debtData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setDebts(debtData);
            setDebtors([...new Set(debtData.map((d) => d.debtor).filter(Boolean))]);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching debts:", err);
            setError("Failed to load debts. Please try again.");
            setLoading(false);
          }
        );

        return () => {
          unsubscribeTrans();
          unsubscribeDebts();
        };
      } else {
        setTransactions([]);
        setDebts([]);
        setClients([]);
        setCategories([]);
        setDebtors([]);
        setLoading(false);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: "home", name: "Home", icon: Home },
    { id: "income", name: "Income", icon: TrendingUp },
    { id: "expenses", name: "Expenses", icon: TrendingDown },
    { id: "debts", name: "Debts", icon: DollarSign },
    { id: "profile", name: "Profile", icon: User },
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
          <AlertCircle className="w-12 h-12 text-error-600" />
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
            <BalanceSummary transactions={transactions} />
            <IncomeExpenseChart transactions={transactions} />
            <TransactionForm clients={clients} categories={categories} userId={user.uid} />
            <TransactionTable transactions={transactions} />
          </div>
        );
      case "income":
        return (
          <TransactionTable
            transactions={transactions.filter((t) => t.type === "income")}
          />
        );
      case "expenses":
        return (
          <TransactionTable
            transactions={transactions.filter((t) => t.type === "expense")}
          />
        );
      case "debts":
        return (
          <div className="grid grid-cols-1 gap-6">
            <DebtForm debtors={debtors} userId={user.uid} />
            <DebtTable debts={debts} />
          </div>
        );
      case "profile":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                <p className="text-neutral-800">{user.email}</p>
              </div>
              <button
                className="w-full sm:w-auto px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 hover:shadow-md transition-all duration-200"
                onClick={() => auth.signOut()}
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">MyMoney</h1>
          {user && (
            <button
              className="px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 hover:shadow-md transition-all duration-200"
              onClick={() => auth.signOut()}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-5 gap-2 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 sm:px-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "text-primary border-t-2 border-primary"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <tab.icon className="w-6 h-6 mb-1" />
                  <span className="hidden sm:block">{tab.name}</span>
                  <span className="sm:hidden text-xs">{tab.name}</span>
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
