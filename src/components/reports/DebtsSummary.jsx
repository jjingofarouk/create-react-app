import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const DebtsSummary = ({ doc, data, clients, addTable, yPosition }) => {
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

  const filteredDebts = filterData(data.debts);
  const debtsData = sortedData(filteredDebts).map((item) => {
    const client = clients.find((c) => c.name === item.client);
    return {
      client: client?.name || "-",
      debtBalance: (parseFloat(item.amount) || 0).toLocaleString(),
      updatedAt: item.updatedAt ? format(item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt), "MMM dd, yyyy HH:mm") : "-",
    };
  });

  yPosition = addTable(
    "Debts Summary",
    [
      { header: "CLIENT", dataKey: "client" },
      { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
      { header: "UPDATED AT", dataKey: "updatedAt" },
    ],
    debtsData,
    yPosition
  );

  const activeDebts = filteredDebts.filter((debt) => debt.amount > 0);
  const highestDebt = activeDebts.length > 0
    ? activeDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeDebts[0])
    : null;
  const lowestDebt = activeDebts.length > 0
    ? activeDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeDebts[0])
    : null;
  const oldestDebt = activeDebts.length > 0
    ? activeDebts.reduce((oldest, debt) => {
        const debtDate = debt.createdAt?.toDate ? debt.createdAt.toDate() : new Date(debt.createdAt);
        const oldestDate = oldest.createdAt?.toDate ? oldest.createdAt.toDate() : new Date(oldest.createdAt);
        return debtDate < oldestDate ? debt : oldest;
      }, activeDebts[0])
    : null;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Debt Metrics", 15, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Highest Debt: ${highestDebt ? `${(highestDebt.amount || 0).toLocaleString()} UGX (${clients.find((c) => c.name === highestDebt.client)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
  yPosition += 10;
  doc.text(`Lowest Debt: ${lowestDebt ? `${(lowestDebt.amount || 0).toLocaleString()} UGX (${clients.find((c) => c.name === lowestDebt.client)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
  yPosition += 10;
  doc.text(`Oldest Debt: ${oldestDebt ? `${format(oldestDebt.createdAt?.toDate ? oldestDebt.createdAt.toDate() : new Date(oldestDebt.createdAt), "MMM dd, yyyy")} (${clients.find((c) => c.name === oldestDebt.client)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
  yPosition += 20;

  return yPosition;
};

export default DebtsSummary;
