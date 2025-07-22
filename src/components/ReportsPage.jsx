import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import DateFilter from "./DateFilter";
import PDFGenerator from "./PDFGenerator";

const ReportsPage = () => {
  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bankDeposits, setBankDeposits] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = format(startOfDay(new Date()), "yyyy-MM-dd");
  const [dateFilter, setDateFilter] = useState({
    type: "today",
    startDate: today,
    endDate: today,
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

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
      const totalCollections = 5;

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
        },
        (err) => {
          console.error("Error fetching categories:", err);
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
        },
        (err) => {
          console.error("Error fetching bank deposits:", err);
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
        unsubscribeDebts();
        unsubscribeExpenses();
        unsubscribeClients();
        unsubscribeProducts();
        unsubscribeCategories();
        unsubscribeBankDeposits();
        unsubscribeSupplies();
      };
    }
  }, [user]);

  const safeData = {
    sales: Array.isArray(sales) ? sales : [],
    debts: Array.isArray(debts) ? debts : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    bankDeposits: Array.isArray(bankDeposits) ? bankDeposits : [],
    supplies: Array.isArray(supplies) ? supplies : [],
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-auto bg-white p-6">
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Financial Reports
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
            Generate comprehensive reports to analyze your business performance across sales, debts, expenses, and bank deposits.
          </p>
        </div>
      </div>

      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
      />

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Generate Consolidated Report</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Loading data...</p>
          </div>
        ) : (
          <PDFGenerator
            reportType="consolidated"
            dateFilter={dateFilter}
            data={safeData}
            clients={safeClients}
            products={safeProducts}
            categories={safeCategories}
            userId={user?.uid}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;