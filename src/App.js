import React, { useState } from "react";
import { SkeletonTheme } from 'react-loading-skeleton';
import Auth from "./components/Auth";
import Layout from "./components/Layout";
import PageRouter from "./components/PageRouter";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import { useFirebaseData } from "./hooks/useFirebaseData";
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState("sales");
  
  const {
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
  } = useFirebaseData();

  // Loading state
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
        <LoadingScreen />
      </SkeletonTheme>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
        <ErrorScreen error={error} onRetry={retry} />
      </Layout>
    );
  }

  // Authentication check
  if (!user) {
    return <Auth />;
  }

  // Main application
  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
      <PageRouter
        activeTab={activeTab}
        user={user}
        sales={sales}
        debts={debts}
        expenses={expenses}
        clients={clients}
        products={products}
        categories={categories}
        bankDeposits={bankDeposits}
        depositors={depositors}
      />
    </Layout>
  );
}

export default App;