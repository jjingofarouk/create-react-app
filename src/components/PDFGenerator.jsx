import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import logo from "./logo.jpg";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, userId }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Colors
      const primaryColor = [30, 58, 138]; // Blue-800
      const secondaryColor = [55, 65, 81]; // Gray-700
      const lightGray = [249, 250, 251]; // Gray-50

      // Load logo
      const logoBase64 = await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = logo;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = () => reject(new Error("Failed to load logo"));
      });

      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.addImage(logoBase64, "JPEG", 15, 5, 20, 20);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RICHMOND MANUFACTURER'S LTD", 40, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Plot 19191, Kimwanyi Road, Nakwero, Wakiso District", 40, 22);
      doc.text("Kira Municipality, Kira Division, Tel: 0705555498 / 0776 210570", 40, 29);
      doc.setTextColor(...primaryColor);
      doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, pageWidth - 15, 15, { align: "right" });

      // Report Title
      doc.setTextColor(...primaryColor);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      doc.text(title, 15, 50);

      // Date Range
      let yPosition = 60;
      if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...secondaryColor);
        const dateRange = `Period: ${format(parseISO(dateFilter.startDate), "MMM dd, yyyy")} - ${format(parseISO(dateFilter.endDate), "MMM dd, yyyy")}`;
        doc.text(dateRange, 15, yPosition);
        yPosition += 15;
      }

      // Filter and sort data
      const dataset = reportType === "sales" ? data.sales : reportType === "debts" ? data.debts : data.expenses;
      const filteredData = dataset.filter(item => {
        if (dateFilter.type === "all" || !item.createdAt) return true;
        const itemDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const start = dateFilter.startDate ? parseISO(dateFilter.startDate) : null;
        const end = dateFilter.endDate ? parseISO(dateFilter.endDate) : null;
        return start && end ? isWithinInterval(itemDate, { start: startOfDay(start), end: endOfDay(end) }) : true;
      });

      // Sort by createdAt in descending order (newest first)
      const sortedData = filteredData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Stable sort, descending
      });

      // Prepare table data
      let columns = [];
      let rows = [];
      let totals = {};

      if (reportType === "sales") {
        columns = [
          { header: "Client", dataKey: "client" },
          { header: "Product", dataKey: "product" },
          { header: "Quantity", dataKey: "quantity" },
          { header: "Amount (UGX)", dataKey: "amount" },
          { header: "Date", dataKey: "date" },
        ];
        let totalAmount = 0;
        let totalQuantity = 0;
        rows = sortedData.map(item => {
          const amount = item.amount || 0;
          const quantity = item.quantity || 0;
          totalAmount += amount;
          totalQuantity += quantity;
          return {
            client: item.client || "-",
            product: item.product || "-",
            quantity: quantity.toString(),
            amount: amount.toLocaleString(),
            date: item.createdAt ? format(item.createdAt.toDate(), "MMM dd, yyyy") : "-",
          };
        });
        totals = { totalAmount, totalQuantity, count: sortedData.length };
      } else if (reportType === "debts") {
        columns = [
          { header: "Debtor", dataKey: "debtor" },
          { header: "Amount (UGX)", dataKey: "amount" },
          { header: "Status", dataKey: "status" },
          { header: "Date", dataKey: "date" },
        ];
        let totalAmount = 0;
        let paidAmount = 0;
        rows = sortedData.map(item => {
          const amount = item.amount || 0;
          const isPaid = amount === 0;
          if (!isPaid) totalAmount += amount;
          else paidAmount += amount;
          return {
            debtor: item.client || "-",
            amount: amount.toLocaleString(),
            status: isPaid ? "Paid" : "Pending",
            date: item.createdAt ? format(item.createdAt.toDate(), "MMM dd, yyyy") : "-",
          };
        });
        totals = { totalAmount, paidAmount, count: sortedData.length };
      } else {
        columns = [
          { header: "Category", dataKey: "category" },
          { header: "Amount (UGX)", dataKey: "amount" },
          { header: "Description", dataKey: "description" },
          { header: "Payee", dataKey: "payee" },
          { header: "Date", dataKey: "date" },
        ];
        let totalAmount = 0;
        rows = sortedData.map(item => {
          const amount = typeof item.amount === "number" ? item.amount : parseFloat(item.amount) || 0;
          totalAmount += amount;
          return {
            category: item.category || "-",
            amount: amount.toLocaleString(),
            description: item.description || "-",
            payee: item.payee || "-",
            date: item.createdAt ? format(item.createdAt.toDate(), "MMM dd, yyyy") : "-",
          };
        });
        totals = { totalAmount, count: sortedData.length };
      }

      // Generate table
      doc.autoTable({
        columns,
        body: rows,
        startY: yPosition + 5,
        theme: "grid",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak", // Handle long text
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        columnStyles: {
          client: { cellWidth: 40 },
          product: { cellWidth: 40 },
          debtor: { cellWidth: 50 },
          category: { cellWidth: 30 },
          description: { cellWidth: 50 }, // Wider for long text
          payee: { cellWidth: 30 },
          amount: { halign: "right", cellWidth: 30 },
          quantity: { halign: "center", cellWidth: 20 },
          status: { halign: "center", cellWidth: 20 },
          date: { cellWidth: 30 },
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(...secondaryColor);
          doc.text(
            `Generated by RichBooks - Page ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" },
          );
        },
      });

      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("Summary", 15, finalY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);
      let summaryY = finalY + 10;
      doc.text(`Total Records: ${totals.count}`, 15, summaryY);
      if (reportType === "sales") {
        doc.text(`Total Quantity: ${totals.totalQuantity.toLocaleString()}`, 15, summaryY + 8);
        doc.text(`Total Amount: UGX ${totals.totalAmount.toLocaleString()}`, 15, summaryY + 16);
      } else if (reportType === "debts") {
        doc.text(`Total Outstanding: UGX ${totals.totalAmount.toLocaleString()}`, 15, summaryY + 8);
        doc.text(`Total Paid: UGX ${totals.paidAmount.toLocaleString()}`, 15, summaryY + 16);
      } else {
        doc.text(`Total Expenses: UGX ${totals.totalAmount.toLocaleString()}`, 15, summaryY + 8);
      }

      // Save the PDF
      const fileName = `${reportType}_report_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={generatePDF}
        disabled={loading}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </>
        )}
      </button>
      <div className="flex items-center text-sm text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg">
        <FileText className="w-4 h-4 mr-2" />
        <span>
          {reportType === "sales" && "Sales transactions report"}
          {reportType === "debts" && "Outstanding debts report"}
          {reportType === "expenses" && "Business expenses report"}
        </span>
      </div>
    </div>
  );
};

export default PDFGenerator;