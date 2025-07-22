import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import logo from "./logo.jpg";
import signature from "./signature.jpg";
import SuppliesSummary from "./SuppliesSummary";
import BankDeposits from "./BankDeposits";
import Expenses from "./Expenses";
import SalesSummary from "./SalesSummary";
import ClientPaymentStatus from "./ClientPaymentStatus";
import DebtsSummary from "./DebtsSummary";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, userId }) => {
  const [loading, setLoading] = useState(false);

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
        const dateRange = `Period: ${format(new Date(dateFilter.startDate), "MMM dd, yyyy")} — ${format(new Date(dateFilter.endDate), "MMM dd, yyyy")}`;
        doc.text(dateRange, 18, yPosition + 4);
        yPosition += 22;
      }

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
            totalEarnings: { halign: "right", cellWidth: 35 },
            discountedEarnings: { halign: "right", cellWidth: 35 },
            status: { halign: "center", cellWidth: 30 },
            updatedAt: { halign: "center", cellWidth: 35 },
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

      yPosition = SuppliesSummary({ doc, data, products, addTable, yPosition });
      yPosition = BankDeposits({ doc, data, addTable, yPosition });
      yPosition = Expenses({ doc, data, addTable, yPosition });
      yPosition = SalesSummary({ doc, data, products, addTable, yPosition });
      yPosition = ClientPaymentStatus({ doc, data, clients, dateFilter, addTable, yPosition });
      yPosition = DebtsSummary({ doc, data, clients, addTable, yPosition });

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
