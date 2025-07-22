import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const ClientPaymentStatus = ({ doc, data, clients, dateFilter, addTable, yPosition }) => {
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
  const clientSalesTotals = clients.reduce((acc, client) => {
    const clientSales = filteredSales.filter((sale) => sale.client === client.name);
    const totalSales = clientSales.reduce(
      (sum, sale) => sum + (parseFloat(sale.totalAmount) || 0),
      0
    );
    return { ...acc, [client.name]: totalSales };
  }, {});

  const clientPaymentStatus = clients.map((client) => {
    const clientDebts = filterData(data.debts).filter((debt) => debt.client === client.name);
    const totalDebt = clientDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    const paidDebt = clientDebts.filter((debt) => debt.amount === 0).reduce(
      (sum, debt) => sum + (parseFloat(debt.originalAmount || debt.amount) || 0),
      0
    );
    const status = totalDebt === 0 ? "Fully Paid" : paidDebt > 0 ? "Partially Paid" : "Not Paid";
    return {
      client: client.name || "-",
      status,
      totalSales: clientSalesTotals[client.name] || 0,
    };
  });

  const sortedClientStatus = clientPaymentStatus.sort((a, b) => b.totalSales - a.totalSales);

  const fullyPaidClients = sortedClientStatus.filter((c) => c.status === "Fully Paid").map((c) => c.client);
  const partiallyPaidClients = sortedClientStatus.filter((c) => c.status === "Partially Paid").map((c) => c.client);
  const notPaidClients = sortedClientStatus.filter((c) => c.status === "Not Paid").map((c) => c.client);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Client Payment Status (Sorted by Sales Volume, Highest to Lowest)", 15, yPosition);
  yPosition += 10;

  if (fullyPaidClients.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Fully Paid Clients:", 15, yPosition);
    doc.text(fullyPaidClients.join(", "), 15, yPosition + 8, { maxWidth: doc.internal.pageSize.width - 30 });
    yPosition += Math.ceil(doc.getTextDimensions(fullyPaidClients.join(", "), { maxWidth: doc.internal.pageSize.width - 30 }).h) + 15;
  }

  if (partiallyPaidClients.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Partially Paid Clients:", 15, yPosition);
    doc.text(partiallyPaidClients.join(", "), 15, yPosition + 8, { maxWidth: doc.internal.pageSize.width - 30 });
    yPosition += Math.ceil(doc.getTextDimensions(partiallyPaidClients.join(", "), { maxWidth: doc.internal.pageSize.width - 30 }).h) + 15;
  }

  if (notPaidClients.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Not Paid Clients:", 15, yPosition);
    doc.text(notPaidClients.join(", "), 15, yPosition + 8, { maxWidth: doc.internal.pageSize.width - 30 });
    yPosition += Math.ceil(doc.getTextDimensions(notPaidClients.join(", "), { maxWidth: doc.internal.pageSize.width - 30 }).h) + 15;
  }

  return yPosition;
};

export default ClientPaymentStatus;
