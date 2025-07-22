// src/components/reports/useFirestoreData.jsx
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const useFirestoreData = (user, setLoading) => {
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bankDeposits, setBankDeposits] = useState([]);
  const [supplies, setSupplies] = useState([]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      let loadedCount = 0;
      const totalCollections = 8;

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalCollections) {
          setLoading(false);
        }
      };

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

      const expensesQuery = query(collection(db, `users/${user.uid}/expenses`));
      const unsubscribeExpenses = onSnapshot(
        expensesQuery,
        (snapshot) => {
          const expensesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setExpenses(expensesData);
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching expenses:", err);
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

      const categoriesQuery = query(collection(db, `users/${user.uid}/categories`));
      const unsubscribeCategories = onSnapshot(
        categoriesQuery,
        (snapshot) => {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching categories:", err);
          checkAllLoaded();
        }
      );

      const bankDepositsQuery = query(collection(db, `users/${user.uid}/bankDeposits`));
      const unsubscribeBankDeposits = onSnapshot(
        bankDepositsQuery,
        (snapshot) => {
          const bankDepositsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBankDeposits(bankDepositsData);
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching bank deposits:", err);
          checkAllLoaded();
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
          checkAllLoaded();
        },
        (err) => {
          console.error("Error fetching supplies:", err);
          checkAllLoaded();
        }
      );

      return () => {
        unsubscribeSales();
        unsubscribeDebts();
        unsubscribeExpenses();
        unsubscribeClients();
        unsubscribeProducts();
        unsubscribeCategories();
        unsubscribeBankDeposits();
        unsubscribeSupplies();
      };
    }
  }, [user, setLoading]);

  return { sales, debts, expenses, clients, products, categories, bankDeposits, supplies };
};

export default useFirestoreData;