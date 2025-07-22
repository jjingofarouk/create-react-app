import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const SalesSummary = ({ doc, data, products, addTable, yPosition }) => {
  const filterData = (dataset) => {
    if (!Array.isArray(dataset)) return [];
    if (dateFilter.type === "all") return dataset;
    return dataset.filter((item) => {
      if (!item.createdAt && !item.date) return true;
      try {
        let itemDate;
        if (item.createdAt) {
          itemDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        } else if (item.date) {
          itemDate = new Date(item.date);
        }
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

  const filteredSales = filterData(data.sales);
  const salesSummary = filteredSales.reduce((acc, sale) => {
    const product = products.find((p) => p.id === sale.product?.productId);
    const productName = product?.name || "Unknown";
    const unitPrice = parseFloat(product?.price || 0);
    const quantity = parseInt(sale.product?.quantity || 0);
    const discount = parseFloat(sale.product?.discount || 0);
    const discountedPrice = unitPrice - discount;

    if (!acc[productName]) {
      acc[productName] = {
        totalQuantity: 0,
        totalEarnings: 0,
        discountedEarnings: 0,
      };
    }

    acc[productName].totalQuantity += quantity;
    acc[productName].totalEarnings += quantity * unitPrice;
    acc[productName].discountedEarnings += quantity * discountedPrice;
    return acc;
  }, {});

  const salesSummaryData = Object.entries(salesSummary).map(([product, data]) => ({
    product,
    totalQuantity: data.totalQuantity.toString(),
    totalEarnings: data.totalEarnings.toLocaleString(),
    discountedEarnings: data.discountedEarnings.toLocaleString(),
  }));

  return addTable(
    "Sales Summary by Product",
    [
      { header: "PRODUCT", dataKey: "product" },
      { header: "QUANTITY", dataKey: "totalQuantity" },
      { header: "EARNINGS (NO DISCOUNT) (UGX)", dataKey: "totalEarnings" },
      { header: "TOTAL DISCOUNTED EARNINGS (UGX)", dataKey: "discountedEarnings" },
    ],
    salesSummaryData,
    yPosition
  );
};

export default SalesSummary;
