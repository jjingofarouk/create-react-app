import React from "react";
import BalanceSummary from "./BalanceSummary";
import IncomeExpenseChart from "./IncomeExpenseChart";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";

function HomePage({ transactions, clients, categories, userId }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
      <BalanceSummary transactions={transactions} />
      <IncomeExpenseChart transactions={transactions} />
      <TransactionForm clients={clients} categories={categories} userId={userId} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}

export default HomePage;
