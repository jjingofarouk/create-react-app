import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import logo from "./logo.jpg";
import signature from "./signature.jpg";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, userId }) => {
  const [loading, setLoading] = useState(false);

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

  const generatePDF = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      const primary = [15, 23, 42];
      const secondary = [71, 85, 105];
      const accent = [99, 102, 241];
      const background = [248, 250, 252];
      const border = [226, 232, 240];

      let logoBase64 = null;
      try {
        logoBase64 = await new Promise((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => resolve(null), 5000);
          img.onload = () => {
            clearTimeout(timeout);
            const canvas = document.createElement("canvas");
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          img.src = logo;
        });
      } catch (error) {
        console.warn("Failed to load logo:", error);
      }

      let signatureBase64 = null;
      try {
        signatureBase64 = await new Promise((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => resolve(null), 5000);
          img.onload = () => {
            clearTimeout(timeout);
            const canvas = document.createElement("canvas");
            const aspectRatio = img.width / img.height;
            const maxWidth = 60;
            const maxHeight = 30;
            let canvasWidth, canvasHeight;
            if (aspectRatio > maxWidth / maxHeight) {
              canvasWidth = maxWidth;
              canvasHeight = maxWidth / aspectRatio;
            } else {
              canvasHeight = maxHeight;
              canvasWidth = maxHeight * aspectRatio;
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            resolve(canvas.toDataURL("image/png", 0.9));
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          img.src = signature;
        });
      } catch (error) {
        console.warn("Failed to load signature:", error);
      }

      const headerHeight = 45;
      doc.setFillColor(...primary);
      doc.rect(0, 0, pageWidth, headerHeight, "F");

      if (logoBase64) {
        doc.addImage(logoBase64, "JPEG", 15, 8, 28, 28);
      }

      const logoOffset = logoBase64 ? 50 : 15;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RICHMOND MANUFACTURER'S LTD", logoOffset, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text("Plot 19191, Kimwanyi Road, Nakwero, Wakiso District", logoOffset, 26);
      doc.text("Kira Municipality, Kira Division | Tel: 0705555498 / 0776 210570", logoOffset, 32);

      let yPosition = headerHeight + 18;
      doc.setTextColor(...primary);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Consolidated Financial Report", 15, yPosition);
      doc.setTextColor(...secondary);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, pageWidth - 15, yPosition, { align: "right" });
      yPosition += 18;

      if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
        doc.setFillColor(...accent);
        doc.roundedRect(15, yPosition - 4, pageWidth - 30, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const dateRange = `Period: ${format(parseISO(dateFilter.startDate), "MMM dd, yyyy")} — ${format(parseISO(dateFilter.endDate), "MMM dd, yyyy")}`;
        doc.text(dateRange, 18, yPosition + 4);
        yPosition += 22;
      }

      const safeData = {
        sales: Array.isArray(data?.sales) ? data.sales : [],
        debts: Array.isArray(data?.debts) ? data.debts : [],
        expenses: Array.isArray(data?.expenses) ? data.expenses : [],
        bankDeposits: Array.isArray(data?.bankDeposits) ? data.bankDeposits : [],
        supplies: Array.isArray(data?.supplies) ? data.supplies : [],
      };

      const addTable = (title, columns, rows, startY) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primary);
        doc.text(title, 15, startY);

        if (rows.length === 0) {
          doc.setFontSize(10);
          doc.setTextColor(...secondary);
          doc.text("No data available for this period", 15, startY + 15);
          return startY + 30;
        }

        doc.autoTable({
          columns,
          body: rows,
          startY: startY + 8,
          theme: "plain",
          headStyles: {
            fillColor: primary,
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: "bold",
            halign: "left",
            cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
            lineWidth: 0,
            minCellHeight: 16,
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
            textColor: secondary,
            lineWidth: 0.2,
            lineColor: border,
            minCellHeight: 14,
          },
          alternateRowStyles: {
            fillColor: background,
          },
          columnStyles: {
            product: { cellWidth: 50 },
            supplyType: { cellWidth: 30 },
            quantity: { halign: "center", cellWidth: 20 },
            quantitySold: { halign: "center", cellWidth: 20 },
            balance: { halign: "center", cellWidth: 20 },
            depositor: { cellWidth: 50 },
            bank: { cellWidth: 40 },
            amount: { halign: "right", cellWidth: 35, fontStyle: "bold" },
            category: { cellWidth: 40 },
            percentage: { halign: "right", cellWidth: 25 },
            client: { cellWidth: 50 },
            debtCleared: { halign: "right", cellWidth: 35 },
            debtBalance: { halign: "right", cellWidth: 35 },
            totalEarnings: { halign: "right", cell1489: 35 },
            discountedEarnings: { halign: "right", cellWidth: 35 },
            status: { halign: "center", cellWidth: 30 },
          },
          margin: { left: 10, right: 10 },
          tableWidth: "auto",
          styles: {
            overflow: "linebreak",
            cellWidth: "wrap",
          },
        });
        return doc.lastAutoTable.finalY + 20;
      };

      // 1. Supplies Table
      const filteredSupplies = filterData(safeData.supplies);
      const supplySummary = filteredSupplies.reduce((acc, supply) => {
        const product = products.find((p) => p.id === supply.productId);
        const productName = product?.name || "Unknown";
        if (!acc[productName]) {
          acc[productName] = {
            quantity: 0,
            quantitySold: 0,
          };
        }
        acc[productName].quantity += parseInt(supply.quantity || 0);
        const salesForProduct = safeData.sales.filter(
          (sale) => sale.productId === supply.productId
        );
        acc[productName].quantitySold += salesForProduct.reduce(
          (sum, sale) => sum + parseInt(sale.quantity || 0),
          0
        );
        return acc;
      }, {});

      const suppliesData = Object.entries(supplySummary).map(([product, data]) => ({
        product,
        quantity: data.quantity.toString(),
        quantitySold: data.quantitySold.toString(),
        balance: (data.quantity - data.quantitySold).toString(),
      }));

      yPosition = addTable(
        "Supplies Summary",
        [
          { header: "PRODUCT", dataKey: "product" },
          { header: "QUANTITY", dataKey: "quantity" },
          { header: "SOLD", dataKey: "quantitySold" },
          { header: "BALANCE", dataKey: "balance" },
        ],
        suppliesData,
        yPosition
      );

      // 2. Bank Deposits Table
      const filteredDeposits = filterData(safeData.bankDeposits.filter((d) => !d.isDepositorOnly));
      const depositsData = sortedData(filteredDeposits).map((item) => ({
        depositor: item.depositor || "-",
        bank: item.bank || "-",
        amount: (item.amount || 0).toLocaleString(),
      }));

      const totalDeposits = depositsData.reduce(
        (sum, item) => sum + parseFloat(item.amount.replace(/,/g, "") || 0),
        0
      );

      yPosition = addTable(
        "Bank Deposits",
        [
          { header: "DEPOSITOR", dataKey: "depositor" },
          { header: "BANK", dataKey: "bank" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
        ],
        depositsData,
        yPosition
      );

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text(`Total Deposits: UGX ${totalDeposits.toLocaleString()}`, 15, yPosition);
      yPosition += 20;

      // 3. Expenses Table
      const filteredExpenses = filterData(safeData.expenses);
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

      yPosition = addTable(
        "Expenses",
        [
          { header: "CATEGORY", dataKey: "category" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
          { header: "PERCENTAGE", dataKey: "percentage" },
        ],
        expensesData,
        yPosition
      );

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text(`Total Expenses: UGX ${totalExpenses.toLocaleString()}`, 15, yPosition);
      yPosition += 20;

      // 4. Sales Summary
      const filteredSales = filterData(safeData.sales);
      const salesSummary = filteredSales.reduce((acc, sale) => {
        const product = products.find((p) => p.id === sale.productId);
        const productName = product?.name || "Unknown";
        const unitPrice = parseFloat(product?.price || 0);
        const quantity = parseInt(sale.quantity || 0);
        const discount = parseFloat(sale.discount || 0);
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

      yPosition = addTable(
        "Sales Summary by Product",
        [
          { header: "PRODUCT", dataKey: "product" },
          { header: "QUANTITY", dataKey: "totalQuantity" },
          { header: "TOTAL EARNINGS (UGX)", dataKey: "totalEarnings" },
          { header: "DISCOUNTED EARNINGS (UGX)", dataKey: "discountedEarnings" },
        ],
        salesSummaryData,
        yPosition
      );

      // Client Payment Status
      const clientPaymentStatus = clients.map((client) => {
        const clientDebts = safeData.debts.filter((debt) => debt.clientId === client.id);
        const totalDebt = clientDebts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
        const paidDebt = clientDebts.filter((debt) => debt.amount === 0).reduce((sum, debt) => sum + (parseFloat(debt.originalAmount || debt.amount) || 0), 0);
        const status = totalDebt === 0 ? "Fully Paid" : paidDebt > 0 ? "Partially Paid" : "Not Paid";

        return {
          client: client.name || "-",
          status,
        };
      });

      const fullyPaidClients = clientPaymentStatus.filter((c) => c.status === "Fully Paid").map((c) => c.client);
      const partiallyPaidClients = clientPaymentStatus.filter((c) => c.status === "Partially Paid").map((c) => c.client);
      const notPaidClients = clientPaymentStatus.filter((c) => c.status === "Not Paid").map((c) => c.client);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text("Client Payment Status", 15, yPosition);
      yPosition += 10;

      if (fullyPaidClients.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondary);
        doc.text("Fully Paid Clients:", 15, yPosition);
        doc.text(fullyPaidClients.join(", "), 15, yPosition + 8, { maxWidth: pageWidth - 30 });
        yPosition += Math.ceil(doc.getTextDimensions(fullyPaidClients.join(", "), { maxWidth: pageWidth - 30 }).h) + 15;
      }

      if (partiallyPaidClients.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondary);
        doc.text("Partially Paid Clients:", 15, yPosition);
        doc.text(partiallyPaidClients.join(", "), 15, yPosition + 8, { maxWidth: pageWidth - 30 });
        yPosition += Math.ceil(doc.getTextDimensions(partiallyPaidClients.join(", "), { maxWidth: pageWidth - 30 }).h) + 15;
      }

      if (notPaidClients.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondary);
        doc.text("Not Paid Clients:", 15, yPosition);
        doc.text(notPaidClients.join(", "), 15, yPosition + 8, { maxWidth: pageWidth - 30 });
        yPosition += Math.ceil(doc.getTextDimensions(notPaidClients.join(", "), { maxWidth: pageWidth - 30 }).h) + 15;
      }

      // 5. Debts Summary
      const filteredDebts = filterData(safeData.debts);
      const debtsData = sortedData(filteredDebts).map((item) => {
        const client = clients.find((c) => c.id === item.clientId);
        const originalAmount = parseFloat(item.originalAmount || item.amount || 0);
        const currentAmount = parseFloat(item.amount || 0);
        return {
          client: client?.name || "-",
          debtCleared: (originalAmount - currentAmount).toLocaleString(),
          debtBalance: currentAmount.toLocaleString(),
        };
      });

      yPosition = addTable(
        "Debts Summary",
        [
          { header: "CLIENT", dataKey: "client" },
          { header: "DEBT CLEARED (UGX)", dataKey: "debtCleared" },
          { header: "DEBT BALANCE (UGX)", dataKey: "debtBalance" },
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
      doc.setTextColor(...primary);
      doc.text("Debt Metrics", 15, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondary);
      doc.text(`Highest Debt: ${highestDebt ? `${(highestDebt.amount || 0).toLocaleString()} UGX (${clients.find((c) => c.id === highestDebt.clientId)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
      yPosition += 10;
      doc.text(`Lowest Debt: ${lowestDebt ? `${(lowestDebt.amount || 0).toLocaleString()} UGX (${clients.find((c) => c.id === lowestDebt.clientId)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
      yPosition += 10;
      doc.text(`Oldest Debt: ${oldestDebt ? `${safeFormatDate(oldestDebt.createdAt)} (${clients.find((c) => c.id === oldestDebt.clientId)?.name || '-'})` : 'No active debts'}`, 15, yPosition);
      yPosition += 20;

      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFillColor(...background);
      doc.roundedRect(15, yPosition - 4, pageWidth - 30, 60, 3, 3, "F");
      doc.setDrawColor(...border);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPosition - 4, pageWidth - 30, 60, 3, 3, "S");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text("Compiled By:", 20, yPosition + 8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondary);
      doc.text("Shadia Nakitto", 20, yPosition + 16);
      doc.text("Sales and Accounts Analyst", 20, yPosition + 24);

      if (signatureBase64) {
        doc.addImage(signatureBase64, "PNG", 20, yPosition + 30, 60, 30);
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text("Approved By:", pageWidth - 100, yPosition + 8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondary);
      doc.text("Marketing Manager", pageWidth - 100, yPosition + 16);
      doc.text("___________________________", pageWidth - 100, yPosition + 24);

      const fileName = `Consolidated_Financial_Report_${format(new Date(), "yyyy-MM-dd")}_RML.pdf`;
      doc.save(fileName);
      toast.success("Consolidated report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span>Generate Report</span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;