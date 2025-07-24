import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const DebtsSummary = ({ doc, data, clients, products, dateFilter, addTable, yPosition }) => {
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
  
  // Group debts by product
  const debtsByProduct = {};
  let totalAllDebts = 0;
  
  filteredDebts.forEach((debt) => {
    const product = products.find(p => p.id === debt.productId);
    const productName = product ? product.name : 'Unknown Product';
    
    if (!debtsByProduct[productName]) {
      debtsByProduct[productName] = [];
    }
    
    debtsByProduct[productName].push(debt);
    totalAllDebts += parseFloat(debt.amount) || 0;
  });

  // Create tables for each product
  Object.entries(debtsByProduct).forEach(([productName, debts]) => {
    const debtsData = sortedData(debts).map((item) => {
      const client = clients.find((c) => c.name === item.client);
      return {
        client: client?.name || "-",
        debtBalance: (parseFloat(item.amount) || 0).toLocaleString(),
        updatedAt: item.updatedAt ? format(item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt), "MMM dd, yyyy HH:mm") : "-",
      };
    });

    // Calculate total for this product
    const productTotal = debts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    
    // Add total row
    debtsData.push({
      client: "TOTAL",
      debtBalance: `${productTotal.toLocaleString()} UGX`,
      updatedAt: "",
    });

    yPosition = addTable(
      `${productName} Debts`,
      [
        { header: "CLIENT", dataKey: "client" },
        { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
        { header: "UPDATED AT", dataKey: "updatedAt" },
      ],
      debtsData,
      yPosition
    );
  });

  // If no debts found, show a message
  if (Object.keys(debtsByProduct).length === 0) {
    yPosition = addTable(
      "Debts Summary",
      [
        { header: "CLIENT", dataKey: "client" },
        { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
        { header: "UPDATED AT", dataKey: "updatedAt" },
      ],
      [],
      yPosition
    );
  }

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

  // Create modern debt metrics cards
  const addDebtMetricsCards = (yPos) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 120) {
      doc.addPage();
      yPos = 20;
    }

    // Main section title
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Debt Analytics", 15, yPos);
    yPos += 15;

    const cardWidth = (doc.internal.pageSize.width - 50) / 2;
    const cardHeight = 35;
    const gap = 10;

    // Card 1: Total Debts
    const card1X = 15;
    const card1Y = yPos;
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card1X, card1Y, cardWidth, cardHeight, 3, 3, "FD");
    
    // Icon background (circle)
    doc.setFillColor(239, 68, 68); // Red for total debts
    doc.circle(card1X + 12, card1Y + 12, 6, "F");
    
    // Card content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Total Outstanding", card1X + 25, card1Y + 10);
    
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text(`${totalAllDebts.toLocaleString()} UGX`, card1X + 25, card1Y + 22);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(`${activeDebts.length} active debt${activeDebts.length !== 1 ? 's' : ''}`, card1X + 25, card1Y + 30);

    // Card 2: Highest Debt
    const card2X = card1X + cardWidth + gap;
    const card2Y = yPos;
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card2X, card2Y, cardWidth, cardHeight, 3, 3, "FD");
    
    // Icon background (circle)
    doc.setFillColor(255, 159, 64); // Orange for highest
    doc.circle(card2X + 12, card2Y + 12, 6, "F");
    
    // Card content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Highest Debt", card2X + 25, card2Y + 10);
    
    if (highestDebt) {
      doc.setTextColor(255, 159, 64);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(highestDebt.amount || 0).toLocaleString()} UGX`, card2X + 25, card2Y + 22);
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === highestDebt.client)?.name || '-';
      doc.text(clientName, card2X + 25, card2Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card2X + 25, card2Y + 22);
    }

    yPos += cardHeight + 15;

    // Card 3: Lowest Debt
    const card3X = 15;
    const card3Y = yPos;
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card3X, card3Y, cardWidth, cardHeight, 3, 3, "FD");
    
    // Icon background (circle)
    doc.setFillColor(16, 185, 129); // Green for lowest
    doc.circle(card3X + 12, card3Y + 12, 6, "F");
    
    // Card content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Lowest Debt", card3X + 25, card3Y + 10);
    
    if (lowestDebt) {
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${(lowestDebt.amount || 0).toLocaleString()} UGX`, card3X + 25, card3Y + 22);
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === lowestDebt.client)?.name || '-';
      doc.text(clientName, card3X + 25, card3Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card3X + 25, card3Y + 22);
    }

    // Card 4: Oldest Debt
    const card4X = card3X + cardWidth + gap;
    const card4Y = yPos;
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card4X, card4Y, cardWidth, cardHeight, 3, 3, "FD");
    
    // Icon background (circle)
    doc.setFillColor(139, 69, 19); // Brown for oldest
    doc.circle(card4X + 12, card4Y + 12, 6, "F");
    
    // Card content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Oldest Debt", card4X + 25, card4Y + 10);
    
    if (oldestDebt) {
      doc.setTextColor(139, 69, 19);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(format(oldestDebt.createdAt?.toDate ? oldestDebt.createdAt.toDate() : new Date(oldestDebt.createdAt), "MMM dd, yyyy"), card4X + 25, card4Y + 22);
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === oldestDebt.client)?.name || '-';
      doc.text(clientName, card4X + 25, card4Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card4X + 25, card4Y + 22);
    }

    return yPos + cardHeight + 20;
  };

  // Add the modern debt metrics cards
  yPosition = addDebtMetricsCards(yPosition);

  return yPosition;
};

export default DebtsSummary;