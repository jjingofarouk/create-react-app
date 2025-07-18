import React, { useState, useEffect } from "react";
import { auth, db, onSnapshot, collection, query, where } from "./firebase";
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
        });
      } else {
        setTransactions([]);
        setClients([]);
        setCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>MyMoney</h1>
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
      <BalanceSummary transactions={transactions} />
      <IncomeExpenseChart transactions={transactions} />
      <TransactionForm clients={clients} categories={categories} userId={user.uid} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}

export default App;
