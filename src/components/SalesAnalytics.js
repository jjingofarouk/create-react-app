import React, { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { 
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Package,
  CalendarDays
} from "lucide-react";

const SalesAnalytics = ({ sales, products, dateFilter }) => {
  const filteredSales = useMemo(() => {
    if (!sales) return [];
    if (dateFilter.type === 'all') return sales;
    
    const now = new Date();
    let startDate, endDate;
    
    switch (dateFilter.type) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'custom':
        if (!dateFilter.startDate || !dateFilter.endDate) return sales;
        startDate = startOfDay(parseISO(dateFilter.startDate));
        endDate = endOfDay(parseISO(dateFilter.endDate));
        break;
      default:
        return sales;
    }
    
    return sales.filter(sale => {
      if (!sale.date) return false;
      const saleDate = sale.date.toDate();
      return isWithinInterval(saleDate, { start: startDate, end: endDate });
    });
  }, [sales, dateFilter]);

  const salesAnalytics = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalPaid = filteredSales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
    const totalOutstanding = totalRevenue - totalPaid;
    
    const clientSales = {};
    filteredSales.forEach(sale => {
      const clientName = sale.client || 'Unknown';
      if (!clientSales[clientName]) {
        clientSales[clientName] = { total: 0, count: 0 };
      }
      clientSales[clientName].total += sale.totalAmount || 0;
      clientSales[clientName].count += 1;
    });
    
    const topClient = Object.entries(clientSales)
      .sort(([,a], [,b]) => b.total - a.total)[0];
    
    const productSales = {};
    filteredSales.forEach(sale => {
      const productName = products.find(prod => prod.id === sale.product?.productId)?.name || 'Unknown';
      if (!productSales[productName]) {
        productSales[productName] = { total: 0, quantity: 0, revenue: 0 };
      }
      productSales[productName].total += sale.product?.quantity || 0;
      productSales[productName].quantity += sale.product?.quantity || 0;
      productSales[productName].revenue += sale.totalAmount || 0;
    });
    
    const topProduct = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)[0];
    
    const dailySales = {};
    filteredSales.forEach(sale => {
      if (sale.date) {
        const dateKey = format(sale.date.toDate(), 'yyyy-MM-dd');
        if (!dailySales[dateKey]) {
          dailySales[dateKey] = 0;
        }
        dailySales[dateKey] += sale.totalAmount || 0;
      }
    });
    
    const bestSalesDay = Object.entries(dailySales)
      .sort(([,a], [,b]) => b - a)[0];
    
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const paymentRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
    
    return {
      totalSales,
      totalRevenue,
      totalPaid,
      totalOutstanding,
      topClient: topClient ? { name: topClient[0], revenue: topClient[1].total, count: topClient[1].count } : null,
      topProduct: topProduct ? { name: topProduct[0], revenue: topProduct[1].revenue, quantity: topProduct[1].quantity } : null,
      bestSalesDay: bestSalesDay ? { date: bestSalesDay[0], revenue: bestSalesDay[1] } : null,
      averageSaleValue,
      paymentRate,
      uniqueClients: Object.keys(clientSales).length
    };
  }, [filteredSales, products]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="text-sm text-neutral-600">Total Sales</div>
          <div className="text-2xl font-bold text-neutral-900">{salesAnalytics.totalSales}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="text-sm text-neutral-600">Total Revenue</div>
          <div className="text-2xl font-bold text-primary">
            UGX {salesAnalytics.totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="text-sm text-neutral-600">Amount Paid</div>
          <div className="text-2xl font-bold text-green-600">
            UGX {salesAnalytics.totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="text-sm text-neutral-600">Outstanding</div>
          <div className="text-2xl font-bold text-orange-600">
            UGX {salesAnalytics.totalOutstanding.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-blue-700">Average Sale Value</div>
              <div className="text-lg font-bold text-blue-900">
                UGX {salesAnalytics.averageSaleValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-green-700">Payment Rate</div>
              <div className="text-lg font-bold text-green-900">
                {salesAnalytics.paymentRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-purple-700">Unique Clients</div>
              <div className="text-lg font-bold text-purple-900">
                {salesAnalytics.uniqueClients}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {salesAnalytics.topClient && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-amber-700">Top Client</div>
                <div className="font-bold text-amber-900">{salesAnalytics.topClient.name}</div>
                <div className="text-sm text-amber-700">
                  UGX {salesAnalytics.topClient.revenue.toLocaleString()} ({salesAnalytics.topClient.count} sales)
                </div>
              </div>
            </div>
          </div>
        )}

        {salesAnalytics.topProduct && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Package className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-teal-700">Top Product</div>
                <div className="font-bold text-teal-900">{salesAnalytics.topProduct.name}</div>
                <div className="text-sm text-teal-700">
                  UGX {salesAnalytics.topProduct.revenue.toLocaleString()} ({salesAnalytics.topProduct.quantity} units)
                </div>
              </div>
            </div>
          </div>
        )}

        {salesAnalytics.bestSalesDay && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <CalendarDays className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-rose-700">Best Sales Day</div>
                <div className="font-bold text-rose-900">
                  {format(parseISO(salesAnalytics.bestSalesDay.date), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm text-rose-700">
                  UGX {salesAnalytics.bestSalesDay.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SalesAnalytics;
