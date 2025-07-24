import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";

const DebtsSummary = ({ doc, data, clients, products, dateFilter, addTable, yPosition }) => {
  const filterData = (dataset, ignoreDateFilter = false) => {
    if (!Array.isArray(dataset)) return [];
    if (ignoreDateFilter || dateFilter.type === "all") return dataset;
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

  // For daily reports, show all current debts regardless of date filter
  const isDailyReport =
    dateFilter.type === "today" ||
    dateFilter.type === "yesterday" ||
    dateFilter.type === "dayBeforeYesterday" ||
    (dateFilter.type === "custom" &&
      dateFilter.startDate &&
      dateFilter.endDate &&
      parseISO(dateFilter.endDate).getTime() - parseISO(dateFilter.startDate).getTime() <= 24 * 60 * 60 * 1000);

  const filteredDebts = filterData(data.debts, isDailyReport);
  const strawDebts = filteredDebts.filter(debt => {
    const product = products.find(p => p.id === debt.productId);
    return product?.name.toLowerCase().includes('straw');
  });
  const toiletPaperDebts = filteredDebts.filter(debt => {
    const product = products.find(p => p.id === debt.productId);
    return product?.name.toLowerCase().includes('toilet paper');
  });

  const strawDebtsData = sortedData(strawDebts).map((item) => {
    const client = clients.find((c) => c.name === item.client);
    return {
      client: client?.name || "-",
      debtBalance: (parseFloat(item.amount) || 0).toLocaleString(),
      updatedAt: item.updatedAt ? format(item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt), "MMM dd, yyyy HH:mm") : "-",
    };
  });

  const toiletPaperDebtsData = sortedData(toiletPaperDebts).map((item) => {
    const client = clients.find((c) => c.name === item.client);
    return {
      client: client?.name || "-",
      debtBalance: (parseFloat(item.amount) || 0).toLocaleString(),
      updatedAt: item.updatedAt ? format(item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt), "MMM dd, yyyy HH:mm") : "-",
    };
  });

  const strawTotal = strawDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
  const toiletPaperTotal = toiletPaperDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);

  yPosition = addTable(
    "Straw Debts Summary",
    [
      { header: "CLIENT", dataKey: "client" },
      { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
      { header: "UPDATED AT", dataKey: "updatedAt" },
    ],
    [...strawDebtsData, {
      client: "Total",
      debtBalance: strawTotal.toLocaleString(),
      updatedAt: ""
    }],
    yPosition,
    'debts'
  );

  yPosition = addTable(
    "Toilet Paper Debts Summary",
    [
      { header: "CLIENT", dataKey: "client" },
      { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
      { header: "UPDATED AT", dataKey: "updatedAt" },
    ],
    [...toiletPaperDebtsData, {
      client: "Total",
      debtBalance: toiletPaperTotal.toLocaleString(),
      updatedAt: ""
    }],
    yPosition,
    'debts'
  );

  const activeStrawDebts = strawDebts.filter((debt) => debt.amount > 0);
  const activeToiletPaperDebts = toiletPaperDebts.filter((debt) => debt.amount > 0);

  const strawHighestDebt = activeStrawDebts.length > 0
    ? activeStrawDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeStrawDebts[0])
    : null;
  const strawLowestDebt = activeStrawDebts.length > 0
    ? activeStrawDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeStrawDebts[0])
    : null;
  const strawOldestDebt = activeStrawDebts.length > 0
    ? activeStrawDebts.reduce((oldest, debt) => {
        const debtDate = debt.createdAt?.toDate ? debt.createdAt.toDate() : new Date(debt.createdAt);
        const oldestDate = oldest.createdAt?.toDate ? oldest.createdAt.toDate() : new Date(oldest.createdAt);
        return debtDate < oldestDate ? debt : oldest;
      }, activeStrawDebts[0])
    : null;

  const toiletPaperHighestDebt = activeToiletPaperDebts.length > 0
    ? activeToiletPaperDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeToiletPaperDebts[0])
    : null;
  const toiletPaperLowestDebt = activeToiletPaperDebts.length > 0
    ? activeToiletPaperDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeToiletPaperDebts[0])
    : null;
  const toiletPaperOldestDebt = activeToiletPaperDebts.length > 0
    ? activeToiletPaperDebts.reduce((oldest, debt) => {
        const debtDate = debt.createdAt?.toDate ? debt.createdAt.toDate() : new Date(debt.createdAt);
        const oldestDate = oldest.createdAt?.toDate ? oldest.createdAt.toDate() : new Date(oldest.createdAt);
        return debtDate < oldestDate ? debt : oldest;
      }, activeToiletPaperDebts[0])
    : null;

  const addDebtMetricsCards = (yPos) => {
    if (yPos > doc.internal.pageSize.height - 120) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Debt Analytics", 15, yPos);
    yPos += 15;

    const cardWidth = (doc.internal.pageSize.width - 50) / 2;
    const cardHeight = 35;
    const gap = 10;

    // Straw Debt Cards
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Straw Debts", 15, yPos);
    yPos += 10;

    // Card 1: Total Straw Debts
    const card1X = 15;
    const card1Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card1X, card1Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(239, 68, 68);
    doc.circle(card1X + 12, card1Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Total Outstanding", card1X + 25, card1Y + 10);
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text(`${strawTotal.toLocaleString()} UGX`, card1X + 25, card1Y + 22);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(`${activeStrawDebts.length} active debt${activeStrawDebts.length !== 1 ? 's' : ''}`, card1X + 25, card1Y + 30);

    // Card 2: Highest Straw Debt
    const card2X = card1X + cardWidth + gap;
    const card2Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card2X, card2Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(255, 159, 64);
    doc.circle(card2X + 12, card2Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Highest Debt", card2X + 25, card2Y + 10);
    if (strawHighestDebt) {
      doc.setTextColor(255, 159, 64);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(strawHighestDebt.amount || 0).toLocaleString()} UGX`, card2X + 25, card2Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === strawHighestDebt.client)?.name || '-';
      doc.text(clientName, card2X + 25, card2Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card2X + 25, card2Y + 22);
    }

    yPos += cardHeight + 15;

    // Card 3: Lowest Straw Debt
    const card3X = 15;
    const card3Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card3X, card3Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(16, 185, 129);
    doc.circle(card3X + 12, card3Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Lowest Debt", card3X + 25, card3Y + 10);
    if (strawLowestDebt) {
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(strawLowestDebt.amount || 0).toLocaleString()} UGX`, card3X + 25, card3Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === strawLowestDebt.client)?.name || '-';
      doc.text(clientName, card3X + 25, card3Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card3X + 25, card3Y + 22);
    }

    // Card 4: Oldest Straw Debt
    const card4X = card3X + cardWidth + gap;
    const card4Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card4X, card4Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(139, 69, 19);
    doc.circle(card4X + 12, card4Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Oldest Debt", card4X + 25, card4Y + 10);
    if (strawOldestDebt) {
      doc.setTextColor(139, 69, 19);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(format(strawOldestDebt.createdAt?.toDate ? strawOldestDebt.createdAt.toDate() : new Date(strawOldestDebt.createdAt), "MMM dd, yyyy"), card4X + 25, card4Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === strawOldestDebt.client)?.name || '-';
      doc.text(clientName, card4X + 25, card4Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card4X + 25, card4Y + 22);
    }

    yPos += cardHeight + 20;

    // Toilet Paper Debt Cards
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Toilet Paper Debts", 15, yPos);
    yPos += 10;

    // Card 5: Total Toilet Paper Debts
    const card5X = 15;
    const card5Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card5X, card5Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(239, 68, 68);
    doc.circle(card5X + 12, card5Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Total Outstanding", card5X + 25, card5Y + 10);
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text(`${toiletPaperTotal.toLocaleString()} UGX`, card5X + 25, card5Y + 22);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(`${activeToiletPaperDebts.length} active debt${activeToiletPaperDebts.length !== 1 ? 's' : ''}`, card5X + 25, card5Y + 30);

    // Card 6: Highest Toilet Paper Debt
    const card6X = card5X + cardWidth + gap;
    const card6Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card6X, card6Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(255, 159, 64);
    doc.circle(card6X + 12, card6Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Highest Debt", card6X + 25, card6Y + 10);
    if (toiletPaperHighestDebt) {
      doc.setTextColor(255, 159, 64);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(toiletPaperHighestDebt.amount || 0).toLocaleString()} UGX`, card6X + 25, card6Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === toiletPaperHighestDebt.client)?.name || '-';
      doc.text(clientName, card6X + 25, card6Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card6X + 25, card6Y + 22);
    }

    yPos += cardHeight + 15;

    // Card 7: Lowest Toilet Paper Debt
    const card7X = 15;
    const card7Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card7X, card7Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(16, 185, 129);
    doc.circle(card7X + 12, card7Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Lowest Debt", card7X + 25, card7Y + 10);
    if (toiletPaperLowestDebt) {
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(toiletPaperLowestDebt.amount || 0).toLocaleString()} UGX`, card7X + 25, card7Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === toiletPaperLowestDebt.client)?.name || '-';
      doc.text(clientName, card7X + 25, card7Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card7X + 25, card7Y + 22);
    }

    // Card 8: Oldest Toilet Paper Debt
    const card8X = card7X + cardWidth + gap;
    const card8Y = yPos;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card8X, card8Y, cardWidth, cardHeight, 3, 3, "FD");
    doc.setFillColor(139, 69, 19);
    doc.circle(card8X + 12, card8Y + 12, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Oldest Debt", card8X + 25, card8Y + 10);
    if (toiletPaperOldestDebt) {
      doc.setTextColor(139, 69, 19);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(format(toiletPaperOldestDebt.createdAt?.toDate ? toiletPaperOldestDebt.createdAt.toDate() : new Date(toiletPaperOldestDebt.createdAt), "MMM dd, yyyy"), card8X + 25, card8Y + 22);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === toiletPaperOldestDebt.client)?.name || '-';
      doc.text(clientName, card8X + 25, card8Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card8X + 25, card8Y + 22);
    }

    return yPos + cardHeight + 20;
  };

  yPosition = addDebtMetricsCards(yPosition);

  return yPosition;
};

export default DebtsSummary;