import React, { useState } from "react";
import { db, addDoc, collection } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";

function TransactionForm({ clients, categories, userId }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type,
        amount: parseFloat(amount),
        client: client || null,
        category: category || null,
        timestamp: new Date().toISOString(),
      });
      setAmount("");
      setClient("");
      setCategory("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (UGX)"
        required
      />
      <AutocompleteInput
        value={client}
        onChange={setClient}
        suggestions={clients}
        placeholder="Client Name"
      />
      <AutocompleteInput
        value={category}
        onChange={setCategory}
        suggestions={categories}
        placeholder="Category (e.g., Fuel)"
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}

export default TransactionForm;
