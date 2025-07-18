import React, { useState, useEffect } from "react";
import { auth, db, onSnapshot, collection, query } from "./firebase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceSummary from "./components/BalanceSummary";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import Auth from "./components/Auth";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const q = query(collection(db, `users/${user.uid}/transactions`));
        onSnapshot(q, (snapshot) => {
          const transData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTransactions(transData);
          setClients([...new Set(transData.map((t) => t.client).filter(Boolean))]);
          setCategories([...new Set(transData.map((t) => t.category).filter(Boolean))]);
          setLoading(false);
        });
      } else {
        setTransactions([]);
        setClients([]);
        setCategories([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">MyMoney</h1>
          <button 
            className="px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 hover:shadow-md transition-all duration-200"
            onClick={() => auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
          <div>
            <BalanceSummary transactions={transactions} />
          </div>
          
          <div>
            <IncomeExpenseChart transactions={transactions} />
          </div>
          
          <div>
            <TransactionForm clients={clients} categories={categories} userId={user.uid} />
          </div>
          
          <div>
            <TransactionTable transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;