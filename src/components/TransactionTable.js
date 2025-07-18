// src/components/TransactionTable.jsx
import React, { useMemo, useState } from "react";
import { useTable, useSortBy, useFilters } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2, DollarSign } from "lucide-react";
import { db, setDoc, doc, deleteDoc } from "../firebase";

function TransactionTable({ sales = [], debts = [], expenses = [], userId, onDebtPayment }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");

  const data = useMemo(() => {
    if (sales.length) {
      return sales.map((s) => ({
        id: s.id,
        client: s.client,
        product: s.product,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        discount: s.discount,
        totalAmount: s.totalAmount,
        paymentStatus: s.paymentStatus,
        amountPaid: s.amountPaid,
        remainingDebt: s.remainingDebt,
        date: s.date,
        notes: s.notes,
        type: "sale",
      }));
    } else if (debts.length) {
      return debts.map((d) => ({
        id: d.id,
        debtor: d.debtor,
        amount: d.amount,
        status: d.status,
        notes: d.notes,
        date: d.date,
        saleId: d.saleId,
        type: "debt",
      }));
    } else if (expenses.length) {
      return expenses.map((e) => ({
        id: e.id,
        category: e.category,
        amount: e.amount,
        description: e.description,
        payee: e.payee,
        date: e.date,
        type: "expense",
      }));
    }
    return [];
  }, [sales, debts, expenses]);

  const columns = useMemo(() => {
    if (sales.length) {
      return [
        { Header: "Client", accessor: "client" },
        { Header: "Product", accessor: "product" },
        { Header: "Quantity", accessor: "quantity" },
        {
          Header: "Unit Price",
          accessor: "unitPrice",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        {
          Header: "Discount",
          accessor: "discount",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        {
          Header: "Total",
          accessor: "totalAmount",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        { Header: "Payment Status", accessor: "paymentStatus" },
        {
          Header: "Paid",
          accessor: "amountPaid",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        {
          Header: "Debt",
          accessor: "remainingDebt",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        {
          Header: "Date",
          accessor: "date",
          Cell: ({ value }) => format(new Date(value), "PP"),
        },
        { Header: "Notes", accessor: "notes" },
        {
          Header: "Actions",
          accessor: "actions",
          Cell: ({ row }) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(row.original.id);
                  setEditData(row.original);
                }}
                className="p-1 text-primary hover:text-blue-700"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(row.original.id, "sales")}
                className="p-1 text-danger hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ),
        },
      ];
    } else if (debts.length) {
      return [
        { Header: "Debtor", accessor: "debtor" },
        {
          Header: "Amount",
          accessor: "amount",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        { Header: "Status", accessor: "status" },
        { Header: "Notes", accessor: "notes" },
        {
          Header: "Date",
          accessor: "date",
          Cell: ({ value }) => format(new Date(value), "PP"),
        },
        {
          Header: "Actions",
          accessor: "actions",
          Cell: ({ row }) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(row.original.id);
                  setEditData(row.original);
                }}
                className="p-1 text-primary hover:text-blue-700"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(row.original.id, "debts")}
                className="p-1 text-danger hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              {row.original.status === "outstanding" && (
                <button
                  onClick={() => onDebtPayment(row.original.id, row.original.saleId)}
                  className="p-1 text-success-600 hover:text-success-700"
                >
                  <DollarSign className="w-5 h-5" />
                </button>
              )}
            </div>
          ),
        },
      ];
    } else if (expenses.length) {
      return [
        { Header: "Category", accessor: "category" },
        {
          Header: "Amount",
          accessor: "amount",
          Cell: ({ value }) => `UGX ${value.toLocaleString()}`,
        },
        { Header: "Description", accessor: "description" },
        { Header: "Payee", accessor: "payee" },
        {
          Header: "Date",
          accessor: "date",
          Cell: ({ value }) => format(new Date(value), "PP"),
        },
        {
          Header: "Actions",
          accessor: "actions",
          Cell: ({ row }) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(row.original.id);
                  setEditData(row.original);
                }}
                className="p-1 text-primary hover:text-blue-700"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(row.original.id, "expenses")}
                className="p-1 text-danger hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ),
        },
      ];
    }
    return [];
  }, [sales, debts, expenses, onDebtPayment]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data },
    useFilters,
    useSortBy
  );

  const handleEdit = async () => {
    setError("");
    try {
      if (editData.type === "sale") {
        const saleRef = doc(db, `users/${userId}/sales`, editingId);
        const remainingDebt = editData.totalAmount - editData.amountPaid;
        await setDoc(
          saleRef,
          {
            ...editData,
            quantity: Number(editData.quantity),
            unitPrice: Number(editData.unitPrice),
            discount: Number(editData.discount),
            totalAmount: Number(editData.totalAmount),
            amountPaid: Number(editData.amountPaid),
            remainingDebt,
            date: new Date(editData.date).toISOString(),
          },
          { merge: true }
        );

        if (remainingDebt > 0 && editData.paymentStatus !== "paid") {
          const debtRef = doc(db, `users/${userId}/debts`, editingId);
          await setDoc(
            debtRef,
            {
              debtor: editData.client,
              amount: remainingDebt,
              notes: editData.notes,
              date: new Date(editData.date).toISOString(),
              status: "outstanding",
              saleId: editingId,
            },
            { merge: true }
          );
        } else {
          await deleteDoc(doc(db, `users/${userId}/debts`, editingId));
        }
      } else if (editData.type === "debt") {
        const debtRef = doc(db, `users/${userId}/debts`, editingId);
        await setDoc(
          debtRef,
          {
            ...editData,
            amount: Number(editData.amount),
            date: new Date(editData.date).toISOString(),
          },
          { merge: true }
        );
      } else if (editData.type === "expense") {
        const expenseRef = doc(db, `users/${userId}/expenses`, editingId);
        await setDoc(
          expenseRef,
          {
            ...editData,
            amount: Number(editData.amount),
            date: new Date(editData.date).toISOString(),
          },
          { merge: true }
        );
      }
      setEditingId(null);
      setEditData({});
    } catch (err) {
      setError("Failed to update record. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id, collection) => {
    setError("");
    try {
      await deleteDoc(doc(db, `users/${userId}/${collection}`, id));
      if (collection === "sales") {
        await deleteDoc(doc(db, `users/${userId}/debts`, id));
      }
    } catch (err) {
      setError("Failed to delete record. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200 overflow-x-auto">
      {error && (
        <p className="text-error-600 text-sm text-center bg-error-50 p-2 rounded-lg mb-4">{error}</p>
      )}
      <table {...getTableProps()} className="w-full text-left text-neutral-800">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-2 border-b border-neutral-200 font-semibold text-neutral-600"
                >
                  {column.render("Header")}
                  {column.isSorted && (
                    <span>{column.isSortedDesc ? " 🔽" : " 🔼"}</span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-neutral-50">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="px-4 py-2 border-b border-neutral-200">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-700 mb-4">Edit Record</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}
              className="space-y-4"
            >
              {editData.type === "sale" && (
                <>
                  <input
                    type="text"
                    value={editData.client}
                    onChange={(e) => setEditData({ ...editData, client: e.target.value })}
                    placeholder="Client"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="text"
                    value={editData.product}
                    onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                    placeholder="Product"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.quantity}
                    onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                    placeholder="Quantity"
                    min="1"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.unitPrice}
                    onChange={(e) => setEditData({ ...editData, unitPrice: e.target.value })}
                    placeholder="Unit Price (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.discount}
                    onChange={(e) => setEditData({ ...editData, discount: e.target.value })}
                    placeholder="Discount (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.totalAmount}
                    onChange={(e) => setEditData({ ...editData, totalAmount: e.target.value })}
                    placeholder="Total Amount (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <select
                    value={editData.paymentStatus}
                    onChange={(e) => setEditData({ ...editData, paymentStatus: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  >
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  <input
                    type="number"
                    value={editData.amountPaid}
                    onChange={(e) => setEditData({ ...editData, amountPaid: e.target.value })}
                    placeholder="Amount Paid (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={format(new Date(editData.date), "yyyy-MM-dd")}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Notes"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                </>
              )}
              {editData.type === "debt" && (
                <>
                  <input
                    type="text"
                    value={editData.debtor}
                    onChange={(e) => setEditData({ ...editData, debtor: e.target.value })}
                    placeholder="Debtor"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                    placeholder="Amount (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={format(new Date(editData.date), "yyyy-MM-dd")}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Notes"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                </>
              )}
              {editData.type === "expense" && (
                <>
                  <input
                    type="text"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    placeholder="Category"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                    placeholder="Amount (UGX)"
                    min="0"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="text"
                    value={editData.payee}
                    onChange={(e) => setEditData({ ...editData, payee: e.target.value })}
                    placeholder="Payee"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={format(new Date(editData.date), "yyyy-MM-dd")}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                  />
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 py-2 bg-neutral-200 text-neutral-800 rounded-lg font-medium hover:bg-neutral-300 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
