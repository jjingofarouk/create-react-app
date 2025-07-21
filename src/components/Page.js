import React from 'react';
import SalesPage from '../pages/SalesPage';
import ExpensesPage from '../pages/ExpensesPage';
import DebtsPage from '../pages/DebtsPage';
import ProfilePage from '../pages/ProfilePage';
import ReportsPage from '../pages/ReportsPage';
import BankPage from '../pages/BankPage';

const PageRouter = ({ 
  activeTab, 
  user, 
  sales, 
  debts, 
  expenses, 
  clients, 
  products, 
  categories, 
  bankDeposits, 
  depositors 
}) => {
  switch (activeTab) {
    case "sales":
      return (
        <SalesPage
          sales={sales}
          clients={clients}
          products={products}
          userId={user.uid}
        />
      );
      
    case "bank":
      return (
        <BankPage
          bankDeposits={bankDeposits}
          depositors={depositors}
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
          bankDeposits={bankDeposits}
          userId={user.uid}
        />
      );
      
    case "profile":
      return <ProfilePage user={user} />;
      
    default:
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">
              Page Not Found
            </h2>
            <p className="text-neutral-500">
              The page you're looking for doesn't exist.
            </p>
          </div>
        </div>
      );
  }
};

export default PageRouter;