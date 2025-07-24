import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const DebtsSummary = ({ doc, data, clients, products, dateFilter, addTable, yPosition }) => {
  const filterData = (dataset) => {
    if (!Array.isArray(dataset)) return [];
    if (dateFilter.type === "all") return dataset;
    return dataset.filter((item) => {
      if (!item.updatedAt) return true; // Changed from createdAt to updatedAt
      try {
        let itemDate;
        if (item.updatedAt) {
          itemDate = item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt);
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
          if (item.updatedAt) {
            return item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt);
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
  const groupDebtsByProduct = (debts) => {
    const grouped = {};
    
    debts.forEach(debt => {
      const product = products.find(p => p.id === debt.productId);
      const productName = product ? product.name : 'Unknown Product';
      
      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(debt);
    });
    
    return grouped;
  };

  const debtsByProduct = groupDebtsByProduct(filteredDebts);

  // Create table data for each product
  const createProductDebtTable = (productDebts, productName) => {
    const tableData = sortedData(productDebts).map((item) => {
      const client = clients.find((c) => c.name === item.client);
      return {
        client: client?.name || "-",
        debtBalance: (parseFloat(item.amount) || 0).toLocaleString(),
        updatedAt: item.updatedAt ? format(item.updatedAt.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt), "MMM dd, yyyy HH:mm") : "-",
      };
    });

    // Calculate total for this product
    const total = productDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
    
    // Add total row
    if (tableData.length > 0) {
      tableData.push({
        client: "TOTAL",
        debtBalance: total.toLocaleString(),
        updatedAt: "-",
      });
    }

    return { tableData, total };
  };

  // Generate tables for each product
  Object.keys(debtsByProduct).forEach(productName => {
    const { tableData, total } = createProductDebtTable(debtsByProduct[productName], productName);
    
    yPosition = addTable(
      `${productName} Debts`,
      [
        { header: "CLIENT", dataKey: "client" },
        { header: "OUTSTANDING DEBT (UGX)", dataKey: "debtBalance" },
        { header: "UPDATED AT", dataKey: "updatedAt" },
      ],
      tableData,
      yPosition
    );
  });

  // Calculate overall metrics for analytics cards
  const activeDebts = filteredDebts.filter((debt) => debt.amount > 0);
  const totalDebts = activeDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
  
  const highestDebt = activeDebts.length > 0
    ? activeDebts.reduce((max, debt) => (debt.amount > max.amount ? debt : max), activeDebts[0])
    : null;
  const lowestDebt = activeDebts.length > 0
    ? activeDebts.reduce((min, debt) => (debt.amount < min.amount ? debt : min), activeDebts[0])
    : null;
  const oldestDebt = activeDebts.length > 0
    ? activeDebts.reduce((oldest, debt) => {
        const debtDate = debt.updatedAt?.toDate ? debt.updatedAt.toDate() : new Date(debt.updatedAt);
        const oldestDate = oldest.updatedAt?.toDate ? oldest.updatedAt.toDate() : new Date(oldest.updatedAt);
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
    doc.text(`${totalDebts.toLocaleString()} UGX`, card1X + 25, card1Y + 22);
    
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

    // Card 4: Most Recently Updated
    const card4X = card3X + cardWidth + gap;
    const card4Y = yPos;
    
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(card4X, card4Y, cardWidth, cardHeight, 3, 3, "FD");
    
    // Icon background (circle)
    doc.setFillColor(59, 130, 246); // Blue for most recent
    doc.circle(card4X + 12, card4Y + 12, 6, "F");
    
    // Card content
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Most Recent", card4X + 25, card4Y + 10);
    
    if (activeDebts.length > 0) {
      // Find most recently updated debt
      const mostRecentDebt = activeDebts.reduce((newest, debt) => {
        const debtDate = debt.updatedAt?.toDate ? debt.updatedAt.toDate() : new Date(debt.updatedAt);
        const newestDate = newest.updatedAt?.toDate ? newest.updatedAt.toDate() : new Date(newest.updatedAt);
        return debtDate > newestDate ? debt : newest;
      }, activeDebts[0]);
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(format(mostRecentDebt.updatedAt?.toDate ? mostRecentDebt.updatedAt.toDate() : new Date(mostRecentDebt.updatedAt), "MMM dd, yyyy"), card4X + 25, card4Y + 22);
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const clientName = clients.find((c) => c.name === mostRecentDebt.client)?.name || '-';
      doc.text(clientName, card4X + 25, card4Y + 30);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text("No active debts", card4X + 25, card4Y + 22);
    }

    return yPos + cardHeight + 20;
  };

  // Add product breakdown summary
  const addProductBreakdown = (yPos) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = 20;
    }

    // Section title
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Product Breakdown", 15, yPos);
    yPos += 15;

    const cardWidth = (doc.internal.pageSize.width - 50) / Object.keys(debtsByProduct).length;
    const cardHeight = 40;
    const gap = 10;

    Object.keys(debtsByProduct).forEach((productName, index) => {
      const productDebts = debtsByProduct[productName];
      const productTotal = productDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
      const cardX = 15 + (index * (cardWidth + gap));
      
      // Card background
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 3, 3, "FD");
      
      // Product icon background
      const productColor = productName === 'Toilet Paper' ? [202, 103, 255] : [13, 148, 136];
      doc.setFillColor(...productColor);
      doc.circle(cardX + 12, yPos + 15, 6, "F");
      
      // Card content
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(productName, cardX + 25, yPos + 12);
      
      doc.setTextColor(...productColor);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text(`${productTotal.toLocaleString()} UGX`, cardX + 25, yPos + 24);
      
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(`${productDebts.length} debt${productDebts.length !== 1 ? 's' : ''}`, cardX + 25, yPos + 32);
    });

    return yPos + cardHeight + 20;
  };

  // Add the product breakdown cards
  yPosition = addProductBreakdown(yPosition);

  // Add the modern debt metrics cards
  yPosition = addDebtMetricsCards(yPosition);

  return yPosition;
};

export default DebtsSummary;