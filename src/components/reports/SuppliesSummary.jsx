import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const SuppliesSummary = ({ doc, data, products, dateFilter, addTable, yPosition }) => {
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

  const filteredSupplies = filterData(data.supplies);
  const supplySummary = filteredSupplies.reduce((acc, supply) => {
    const product = products.find((p) => p.id === supply.productId);
    const productName = product?.name || "Unknown";
    const supplyType = supply.supplyType || "Unknown";
    const key = `${supplyType}_${productName}`;
    if (!acc[key]) {
      acc[key] = {
        supplyType,
        product: productName,
        quantity: 0,
        quantitySold: 0,
      };
    }
    acc[key].quantity += parseInt(supply.quantity || 0);
    const salesForProduct = filterData(data.sales).filter(
      (sale) => sale.product?.productId === supply.productId && sale.product?.supplyType === supply.supplyType
    );
    acc[key].quantitySold += salesForProduct.reduce(
      (sum, sale) => sum + parseInt(sale.product?.quantity || 0),
      0
    );
    return acc;
  }, {});

  const suppliesData = Object.values(supplySummary).map((data) => ({
    supplyType: data.supplyType,
    product: data.product,
    quantity: data.quantity.toString(),
    quantitySold: data.quantitySold.toString(),
    balance: (data.quantity - data.quantitySold).toString(),
  }));

  return addTable(
    "Supplies Summary",
    [
      { header: "SUPPLY TYPE", dataKey: "supplyType" },
      { header: "PRODUCT", dataKey: "product" },
      { header: "QUANTITY", dataKey: "quantity" },
      { header: "SOLD", dataKey: "quantitySold" },
      { header: "BALANCE", dataKey: "balance" },
    ],
    suppliesData,
    yPosition
  );
};

export default SuppliesSummary;