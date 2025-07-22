import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../logo.jpg";
import SuppliesSummary from "./SuppliesSummary";
import BankDeposits from "./BankDeposits";
import Expenses from "./Expenses";
import SalesSummary from "./SalesSummary";
import DebtsSummary from "./DebtsSummary";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, userId }) => {
  const [loading, setLoading] = useState(false);

  // Define colors for different sections
  const sectionColors = {
    supplies: [34, 197, 94], // Green
    bankDeposits: [59, 130, 246], // Blue
    expenses: [239, 68, 68], // Red
    sales: [168, 85, 247], // Purple
    debts: [245, 158, 11], // Orange
  };

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

      // Header
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

      // Title and date
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

      // Date filter badge
      if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
        doc.setFillColor(...accent);
        doc.roundedRect(15, yPosition - 4, pageWidth - 30, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const dateRange = `Period: ${format(new Date(dateFilter.startDate), "MMM dd, yyyy")} — ${format(new Date(dateFilter.endDate), "MMM dd, yyyy")}`;
        doc.text(dateRange, 18, yPosition + 4);
        yPosition += 22;
      }

      const addTable = (title, columns, rows, startY, sectionType = 'supplies') => {
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

        // Get section color
        const sectionColor = sectionColors[sectionType] || sectionColors.supplies;

        doc.autoTable({
          columns,
          body: rows,
          startY: startY + 8,
          theme: "plain",
          headStyles: {
            fillColor: sectionColor,
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: "bold",
            halign: "left",
            cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
            lineWidth: 0,
            minCellHeight: 16,
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: { top: 5, right: 8, bottom: 5, left: 8 },
            textColor: secondary,
            lineWidth: 0.2,
            lineColor: border,
            minCellHeight: 14,
          },
          alternateRowStyles: {
            fillColor: background,
          },
          // Standardized column styles for better space utilization
          columnStyles: {
            0: { cellWidth: 'auto' }, // First column auto-width
            1: { cellWidth: 'auto' }, // Second column auto-width
            2: { cellWidth: 'auto', halign: "center" }, // Third column centered
            3: { cellWidth: 'auto', halign: "right" }, // Fourth column right-aligned
            4: { cellWidth: 'auto', halign: "right" }, // Fifth column right-aligned
            5: { cellWidth: 'auto', halign: "right" }, // Sixth column right-aligned
          },
          margin: { left: 15, right: 15 },
          tableWidth: pageWidth - 30, // Use full page width minus margins
          styles: {
            overflow: "ellipsize", // Prevent text wrapping
            cellWidth: "wrap",
            fontSize: 10,
          },
        });
        return doc.lastAutoTable.finalY + 20;
      };

      // Generate report sections with different colors
      yPosition = SuppliesSummary({ 
        doc, 
        data, 
        products, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => addTable(title, columns, rows, startY, 'supplies'), 
        yPosition 
      });
      
      yPosition = BankDeposits({ 
        doc, 
        data, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => addTable(title, columns, rows, startY, 'bankDeposits'), 
        yPosition 
      });
      
      yPosition = Expenses({ 
        doc, 
        data, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => addTable(title, columns, rows, startY, 'expenses'), 
        yPosition 
      });
      
      yPosition = SalesSummary({ 
        doc, 
        data, 
        products, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => addTable(title, columns, rows, startY, 'sales'), 
        yPosition 
      });
      
      yPosition = DebtsSummary({ 
        doc, 
        data, 
        clients, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => addTable(title, columns, rows, startY, 'debts'), 
        yPosition 
      });

      // Save PDF
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