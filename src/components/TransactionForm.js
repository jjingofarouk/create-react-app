import React, { useState } from "react";
import { db, addDoc, collection } from "../firebase";
import AutocompleteInput from "./AutocompleteInput";

function TransactionForm({ clients, categories, userId }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type,
        amount: parseFloat(amount),
        client: client || null,
        category: category || null,
        timestamp: new Date().toISOString(),
      });
      
      // Reset form
      setAmount("");
      setClient("");
      setCategory("");
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="form-title">Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          disabled={loading}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (UGX)"
          required
          disabled={loading}
          step="0.01"
          min="0"
        />
        
        <AutocompleteInput
          value={client}
          onChange={setClient}
          suggestions={clients}
          placeholder="Client Name"
          disabled={loading}
        />
        
        <AutocompleteInput
          value={category}
          onChange={setCategory}
          suggestions={categories}
          placeholder="Category (e.g., Fuel)"
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;