import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const Expenses = ({ doc, data, dateFilter, addTable, yPosition }) => {
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

  const sortedData = (dataset) =>
    dataset.sort((a, b) => {
      try {
        const getDate = (item) => {
          if (item.createdAt) {
            return item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          } else if (item.date) {
            return new Date(item.date);
          }
          return new Date(0);
        };
        return getDate(b) - getDate(a);
      } catch (error) {
        console.warn("Sorting error:", error);
        return 0;
      }
    });

  const filteredExpenses = filterData(data.expenses);
  const totalExpenses = filteredExpenses.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const expensesData = sortedData(filteredExpenses).map((item) => ({
    category: item.category || "Uncategorized",
    amount: (parseFloat(item.amount) || 0).toLocaleString(),
    percentage: totalExpenses
      ? (((parseFloat(item.amount) || 0) / totalExpenses) * 100).toFixed(2) + "%"
      : "0%",
  }));

  return addTable(
    "Expenses",
    [
      { header: "CATEGORY", dataKey: "category" },
      { header: "AMOUNT (UGX)", dataKey: "amount" },
      { header: "PERCENTAGE", dataKey: "percentage" },
    ],
    expensesData,
    yPosition
  );
};

export default Expenses;