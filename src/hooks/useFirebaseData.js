import { useState, useEffect } from 'react';
import { auth, db, onSnapshot, collection, query } from '../firebase';

export const useFirebaseData = () => {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bankDeposits, setBankDeposits] = useState([]);
  const [depositors, setDepositors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      
      if (user) {
        // Track loading states for all listeners
        let listenersLoaded = 0;
        const totalListeners = 6; // sales, debts, expenses, products, clients, bankDeposits
        
        const checkAllLoaded = () => {
          listenersLoaded++;
          if (listenersLoaded >= totalListeners) {
            setLoading(false);
          }
        };

        // Initialize all listeners
        const unsubscribers = [];
        
        try {
          // Sales listener
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
              setError("Failed to load sales. Please try again.");
              checkAllLoaded(); // Still mark as loaded even on error
            }
          );
          unsubscribers.push(unsubscribeSales);

          // Debts listener
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
              // Don't set error for individual collection failures after initial load
              checkAllLoaded();
            }
          );
          unsubscribers.push(unsubscribeDebts);

          // Expenses listener
          const expensesQuery = query(collection(db, `users/${user.uid}/expenses`));
          const unsubscribeExpenses = onSnapshot(
            expensesQuery,
            (snapshot) => {
              const expensesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setExpenses(expensesData);
              setCategories([...new Set(expensesData.map((e) => e.category).filter(Boolean))]);
              checkAllLoaded();
            },
            (err) => {
              console.error("Error fetching expenses:", err);
              checkAllLoaded();
            }
          );
          unsubscribers.push(unsubscribeExpenses);

          // Products listener
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
          unsubscribers.push(unsubscribeProducts);

          // Clients listener
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
          unsubscribers.push(unsubscribeClients);

          // Bank deposits listener
          const bankQuery = query(collection(db, `users/${user.uid}/bankDeposits`));
          const unsubscribeBank = onSnapshot(
            bankQuery,
            (snapshot) => {
              const bankData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setBankDeposits(bankData);
              setDepositors([...new Set(bankData.map((d) => d.depositor).filter(Boolean))]);
              checkAllLoaded();
            },
            (err) => {
              console.error("Error fetching bank deposits:", err);
              checkAllLoaded();
            }
          );
          unsubscribers.push(unsubscribeBank);

        } catch (err) {
          console.error("Error setting up listeners:", err);
          setError("Failed to initialize data listeners. Please try again.");
          setLoading(false);
        }

        // Return cleanup function
        return () => {
          unsubscribers.forEach(unsub => {
            if (typeof unsub === 'function') {
              unsub();
            }
          });
        };
      } else {
        // Clear all data when user is not authenticated
        setSales([]);
        setDebts([]);
        setExpenses([]);
        setClients([]);
        setProducts([]);
        setCategories([]);
        setBankDeposits([]);
        setDepositors([]);
        setLoading(false);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const retry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  return {
    user,
    sales,
    debts,
    expenses,
    clients,
    products,
    categories,
    bankDeposits,
    depositors,
    loading,
    error,
    retry
  };
};