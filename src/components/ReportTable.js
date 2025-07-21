import React from "react";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const ReportTable = ({ dateFilter, data, clients, products, categories, depositors }) => {
  const safeFormatDate = (date) => {
    try {
      if (!date) return "-";
      if (date.toDate) return format(date.toDate(), "MMM dd, yyyy");
      if (typeof date === "string") return format(new Date(date), "MMM dd, yyyy");
      if (date instanceof Date) return format(date, "MMM dd, yyyy");
      return "-";
    } catch (error) {
      console.warn("Invalid date:", date);
      return "-";
    }
  };

  const filterData = (dataset) => {
    if (!Array.isArray(dataset)) return [];
    if (dateFilter.type === "all") return dataset;
    return dataset.filter((item) => {
      if (!item.createdAt) return true;
      try {
        let itemDate;
        if (item.createdAt.toDate) itemDate = item.createdAt.toDate();
        else if (typeof item.createdAt === "string") itemDate = new Date(item.createdAt);
        else if (item.createdAt instanceof Date) itemDate = item.createdAt;
        else return true;
        const start = dateFilter.startDate ? parseISO(dateFilter.startDate) : null;
        const end = dateFilter.endDate ? parseISO(dateFilter.endDate) : null;
        return start && end
          ? isWithinInterval(itemDate, { start: startOfDay(start), end: endOfDay(end) })
          : true;
      } catch (error) {
        console.warn("Date filtering error:", error);
        return true;
      }
    });
  };

  const sortedData = (dataset) =>
    dataset.sort((a, b) => {
      try {
        const getDate = (item) => {
          if (!item.createdAt) return new Date(0);
          if (item.createdAt.toDate) return item.createdAt.toDate();
          if (typeof item.createdAt === "string") return new Date(item.createdAt);
          if (item.createdAt instanceof Date) return item.createdAt;
          return new Date(0);
        };
        return getDate(b) - getDate(a);
      } catch (error) {
        console.warn("Sorting error:", error);
        return 0;
      }
    });

  // Prepare data for each section
  const salesData = sortedData(filterData(data.sales)).map((item) => ({
    client: item.client || "-",
    // Ensure 'p' is defined as the parameter in the find callback
    product:
      item.product && typeof item.product === "object" && item.product.productId
        ? products.find((product) => product.id === item.product.productId)?.name || "-"
        : item.product || "-",
    quantity: item.product?.quantity || item.quantity || 0,
    amount: item.totalAmount || (item.product?.unitPrice * item.product?.quantity) || item.amount || 0,
    date: safeFormatDate(item.createdAt),
  }));

  const debtsData = sortedData(filterData(data.debts)).map((item) => ({
    debtor: item.client || "-",
    amount: item.amount || 0,
    status: item.amount === 0 ? "PAID" : "PENDING",
    date: safeFormatDate(item.createdAt),
  }));

  const expensesData = sortedData(filterData(data.expenses)).map((item) => ({
    category: item.category || "-",
    amount: typeof item.amount === "number" ? item.amount : parseFloat(item.amount) || 0,
    description: item.description || "-",
    payee: item.payee || "-",
    date: safeFormatDate(item.createdAt),
  }));

  const depositsData = sortedData(filterData(data.bankDeposits)).map((item) => ({
    depositor: item.depositor || "-",
    amount: item.amount || 0,
    description: item.description || "-",
    date: safeFormatDate(item.createdAt),
  }));

  // Calculate totals
  const totals = {
    sales: {
      count: salesData.length,
      totalAmount: salesData.reduce((sum, item) => sum + item.amount, 0),
      totalQuantity: salesData.reduce((sum, item) => sum + item.quantity, 0),
    },
    debts: {
      count: debtsData.length,
      totalAmount: debtsData.reduce((sum, item) => sum + item.amount, 0),
      paidAmount: debtsData.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.amount, 0),
    },
    expenses: {
      count: expensesData.length,
      totalAmount: expensesData.reduce((sum, item) => sum + item.amount, 0),
    },
    deposits: {
      count: depositsData.length,
      totalAmount: depositsData.reduce((sum, item) => sum + item.amount, 0),
    },
  };

  return (
    <div className="space-y-8">
      {/* Sales Table */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Product</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-neutral-600">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600">Amount (UGX)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.client}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.product}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-center">{row.quantity}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-right">{row.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-sm text-neutral-500 text-center">
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100">
                <td colSpan={2} className="px-4 py-2 text-sm font-semibold text-neutral-800">Total</td>
                <td className="px-4 py-2 text-sm font-semibold text-neutral-800 text-center">{totals.sales.totalQuantity}</td>
                <td className="px-4 py-2 text-sm font-semibold text-neutral-800 text-right">{totals.sales.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Debts Table */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Outstanding Debts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Debtor</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600">Amount (UGX)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-neutral-600">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {debtsData.length > 0 ? (
                debtsData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.debtor}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-right">{row.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-center">{row.status}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm text-neutral-500 text-center">
                    No debts data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100">
                <td colSpan={1} className="px-4 py-2 text-sm font-semibold text-neutral-800">Total</td>
                <td className="px-4 py-2 text-sm font-semibold text-neutral-800 text-right">{totals.debts.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Expenses Table */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Expenses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Category</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600">Amount (UGX)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Payee</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {expensesData.length > 0 ? (
                expensesData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.category}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-right">{row.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.description}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.payee}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-sm text-neutral-500 text-center">
                    No expenses data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100">
                <td colSpan={1} className="px-4 py-2 text-sm font-semibold text-neutral-800">Total</td>
                <td className="px-4 py-2 text-sm font-semibold text-neutral-800 text-right">{totals.expenses.totalAmount.toLocaleString()}</td>
                <td colSpan={3} className="px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bank Deposits Table */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Bank Deposits</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Depositor</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600">Amount (UGX)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {depositsData.length > 0 ? (
                depositsData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.depositor}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700 text-right">{row.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.description}</td>
                    <td className="px-4 py-2 text-sm text-neutral-700">{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm text-neutral-500 text-center">
                    No bank deposits data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100">
                <td colSpan={1} className="px-4 py-2 text-sm font-semibold text-neutral-800">Total</td>
                <td className="px-4 py-2 text-sm font-semibold text-neutral-800 text-right">{totals.deposits.totalAmount.toLocaleString()}</td>
                <td colSpan={2} className="px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;