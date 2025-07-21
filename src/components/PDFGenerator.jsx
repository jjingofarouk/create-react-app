import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import logo from "./logo.jpg";
import signature from "./signature.jpg";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, bankDeposits, depositors, userId }) => {
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
      if (!item.createdAt) return true;
      try {
        let itemDate;
        if (item.createdAt.toDate) itemDate = item.createdAt.toDate();
        else if (typeof item.createdAt === "string") itemDate = new Date(item.createdAt);
        else if (item.createdAt instanceof Date) itemDate = item.createdAt;
        else return true;
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
          if (!item.createdAt) return new Date(0);
          if (item.createdAt.toDate) return item.createdAt.toDate();
          if (typeof item.createdAt === "string") return new Date(item.createdAt);
          if (item.createdAt instanceof Date) return item.createdAt;
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
      const success = [34, 197, 94];
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
      };

      const salesData = sortedData(filterData(safeData.sales)).map((item) => ({
        client: item.client || "-",
        product: item.product && typeof item.product === "object" && item.product.productId
          ? products?.find((product) => product.id === item.product.productId)?.name || "-"
          : item.product || "-",
        quantity: item.product?.quantity || item.quantity || 0,
        amount: item.totalAmount || (item.product?.unitPrice * item.product?.quantity) || item.amount || 0,
        date: safeFormatDate(item.createdAt),
      }));

      const debtsData = sortedData(filterData(safeData.debts)).map((item) => ({
        debtor: item.client || "-",
        amount: item.amount || 0,
        status: item.amount === 0 ? "PAID" : "PENDING",
        date: safeFormatDate(item.createdAt),
      }));

      const expensesData = sortedData(filterData(safeData.expenses)).map((item) => ({
        category: item.category || "-",
        amount: typeof item.amount === "number" ? item.amount : parseFloat(item.amount) || 0,
        description: item.description || "-",
        payee: item.payee || "-",
        date: safeFormatDate(item.createdAt),
      }));

      const depositsData = sortedData(filterData(safeData.bankDeposits)).map((item) => ({
        depositor: item.depositor || "-",
        amount: item.amount || 0,
        description: item.description || "-",
        date: safeFormatDate(item.createdAt),
      }));

      const totals = {
        sales: {
          count: salesData.length,
          totalAmount: salesData.reduce((sum, item) => sum + item.amount, 0),
          totalQuantity: salesData.reduce((sum, item) => sum + item.quantity, 0),
        },
        debts: {
          count: debtsData.length,
          totalAmount: debtsData.reduce((sum, item) => sum + item.amount, 0),
          paidAmount: debtsData.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.amount, 0),
        },
        expenses: {
          count: expensesData.length,
          totalAmount: expensesData.reduce((sum, item) => sum + item.amount, 0),
        },
        deposits: {
          count: depositsData.length,
          totalAmount: depositsData.reduce((sum, item) => sum + item.amount, 0),
        },
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
            client: { cellWidth: 45 },
            product: { cellWidth: 50 },
            debtor: { cellWidth: 55 },
            category: { cellWidth: 38 },
            depositor: { cellWidth: 55 },
            description: { cellWidth: 60, fontSize: 9 },
            payee: { cellWidth: 38 },
            amount: { halign: "right", cellWidth: 35, fontStyle: "bold" },
            quantity: { halign: "center", cellWidth: 18 },
            status: { halign: "center", cellWidth: 25, fontStyle: "bold", fontSize: 9 },
            date: { cellWidth: 32, fontSize: 9, textColor: secondary },
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

      yPosition = addTable(
        "Sales",
        [
          { header: "CLIENT", dataKey: "client" },
          { header: "PRODUCT", dataKey: "product" },
          { header: "QTY", dataKey: "quantity" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
          { header: "DATE", dataKey: "date" },
        ],
        salesData.map((item) => ({
          client: item.client,
          product: item.product,
          quantity: item.quantity.toString(),
          amount: item.amount.toLocaleString(),
          date: item.date,
        })),
        yPosition
      );

      yPosition = addTable(
        "Debts",
        [
          { header: "DEBTOR", dataKey: "debtor" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
          { header: "STATUS", dataKey: "status" },
          { header: "DATE", dataKey: "date" },
        ],
        debtsData.map((item) => ({
          debtor: item.debtor,
          amount: item.amount.toLocaleString(),
          status: item.status,
          date: item.date,
        })),
        yPosition
      );

      yPosition = addTable(
        "Expenses",
        [
          { header: "CATEGORY", dataKey: "category" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
          { header: "DESCRIPTION", dataKey: "description" },
          { header: "PAYEE", dataKey: "payee" },
          { header: "DATE", dataKey: "date" },
        ],
        expensesData.map((item) => ({
          category: item.category,
          amount: item.amount.toLocaleString(),
          description: item.description,
          payee: item.payee,
          date: item.date,
        })),
        yPosition
      );

      yPosition = addTable(
        "Bank Deposits",
        [
          { header: "DEPOSITOR", dataKey: "depositor" },
          { header: "AMOUNT (UGX)", dataKey: "amount" },
          { header: "DESCRIPTION", dataKey: "description" },
          { header: "DATE", dataKey: "date" },
        ],
        depositsData.map((item) => ({
          depositor: item.depositor,
          amount: item.amount.toLocaleString(),
          description: item.description,
          date: item.date,
        })),
        yPosition
      );

      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text("SUMMARY", 15, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondary);
      doc.text(`Total Sales: UGX ${totals.sales.totalAmount.toLocaleString()} (${totals.sales.count} transactions)`, 15, yPosition);
      yPosition += 10;
      doc.text(`Total Debts: UGX ${totals.debts.totalAmount.toLocaleString()} (${totals.debts.count} records)`, 15, yPosition);
      yPosition += 10;
      doc.text(`Total Expenses: UGX ${totals.expenses.totalAmount.toLocaleString()} (${totals.expenses.count} records)`, 15, yPosition);
      yPosition += 10;
      doc.text(`Total Bank Deposits: UGX ${totals.deposits.totalAmount.toLocaleString()} (${totals.deposits.count} deposits)`, 15, yPosition);
      yPosition += 20;

      if (yPosition > pageHeight - 80) {
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
      className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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