import React, { useState, useEffect } from "react";
import { auth, db, onSnapshot, collection, query } from "./firebase";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceSummary from "./components/BalanceSummary";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import Auth from "./components/Auth";
import "./App.css";

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">MyMoney</h1>
          <button className="sign-out-btn" onClick={() => auth.signOut()}>
            Sign Out
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <div className="dashboard-grid">
          <div className="summary-section">
            <BalanceSummary transactions={transactions} />
          </div>
          
          <div className="chart-section">
            <IncomeExpenseChart transactions={transactions} />
          </div>
          
          <div className="form-section">
            <TransactionForm clients={clients} categories={categories} userId={user.uid} />
          </div>
          
          <div className="table-section">
            <TransactionTable transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
