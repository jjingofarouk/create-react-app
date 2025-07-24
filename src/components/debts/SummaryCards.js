import React from "react";
import { Users, TrendingUp, TrendingDown, DollarSign, Clock, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";
import Skeleton from 'react-loading-skeleton';

const SummaryCards = ({ filteredDebts, dateFilter, loading }) => {
  const summaryMetrics = React.useMemo(() => {
    const activeDebts = filteredDebts.filter((debt) => debt.amount > 0);
    const paidDebts = filteredDebts.filter((debt) => debt.amount === 0);

    const totalDebts = filteredDebts.length;
    const totalAmountOwed = activeDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

    const highestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeDebts[0])
        : null;

    const lowestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeDebts[0])
        : null;

    const oldestDebt =
      activeDebts.length > 0
        ? activeDebts.reduce((oldest, debt) => {
            const debtDate = debt.createdAt?.toDate();
            const oldestDate = oldest.createdAt?.toDate();
            return debtDate && oldestDate && debtDate < oldestDate ? debt : oldest;
          }, activeDebts[0])
        : null;

    const daysSinceOldest = oldestDebt?.createdAt
      ? differenceInDays(new Date(), oldestDebt.createdAt.toDate())
      : 0;

    return {
      totalDebts,
      activeDebts: activeDebts.length,
      paidDebts: paidDebts.length,
      totalAmountOwed,
      highestDebt,
      lowestDebt,
      oldestDebt,
      daysSinceOldest,
      averageDebtAmount: activeDebts.length > 0 ? totalAmountOwed / activeDebts.length : 0,
    };
  }, [filteredDebts]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <Skeleton height={40} width={40} borderRadius={8} />
              <Skeleton height={16} width={60} />
            </div>
            <Skeleton height={28} width="80%" className="mb-2" />
            <Skeleton height={16} width="100%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
            {dateFilter.type === 'all' ? 'Total' : dateFilter.type.charAt(0).toUpperCase() + dateFilter.type.slice(1)}
          </span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.totalDebts}</div>
        <p className="text-sm text-neutral-600">
          {dateFilter.type === 'all' ? 'Total Debts' : `Debts for ${dateFilter.type}`}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">Active</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.activeDebts}</div>
        <p className="text-sm text-neutral-600">Pending Debts</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">Amount</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">
          {summaryMetrics.totalAmountOwed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX
        </div>
        <p className="text-sm text-neutral-600">
          {dateFilter.type === 'all' ? 'Total Amount Owed' : `Amount Owed for ${dateFilter.type}`}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <TrendingDown className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Paid</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.paidDebts}</div>
        <p className="text-sm text-neutral-600">Paid Debts</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">Highest</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">
          {summaryMetrics.highestDebt ? `${summaryMetrics.highestDebt.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX` : '0 UGX'}
        </div>
        <p className="text-sm text-neutral-600 truncate">
          {summaryMetrics.highestDebt ? summaryMetrics.highestDebt.client || 'Unknown Client' : 'No debts'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <TrendingDown className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Lowest</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">
          {summaryMetrics.lowestDebt ? `${summaryMetrics.lowestDebt.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX` : '0 UGX'}
        </div>
        <p className="text-sm text-neutral-600 truncate">
          {summaryMetrics.lowestDebt ? summaryMetrics.lowestDebt.client || 'Unknown Client' : 'No debts'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">Oldest</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">{summaryMetrics.daysSinceOldest} days</div>
        <p className="text-sm text-neutral-600 truncate">
          {summaryMetrics.oldestDebt ? summaryMetrics.oldestDebt.client || 'Unknown Client' : 'No debts'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-teal-100 rounded-lg">
            <Calendar className="w-6 h-6 text-teal-600" />
          </div>
          <span className="text-sm font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded">Average</span>
        </div>
        <div className="text-2xl font-bold text-neutral-800 mb-1">
          {Math.round(summaryMetrics.averageDebtAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} UGX
        </div>
        <p className="text-sm text-neutral-600">Average Debt Amount</p>
      </div>
    </div>
  );
};

export default SummaryCards;