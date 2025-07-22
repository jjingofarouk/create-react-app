import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../logo.jpg";
import signature from "../signature.jpg";
import SuppliesSummary from "./SuppliesSummary";
import BankDeposits from "./BankDeposits";
import Expenses from "./Expenses";
import SalesSummary from "./SalesSummary";
import DebtsSummary from "./DebtsSummary";

const PDFGenerator = ({ reportType, dateFilter, data, clients, products, categories, userId }) => {
  const [loading, setLoading] = useState(false);

  // Professional corporate colors (no gradients)
  const sectionColors = {
    supplies: [41, 98, 255],      // Corporate Blue
    bankDeposits: [16, 185, 129], // Professional Green
    expenses: [239, 68, 68],      // Corporate Red
    sales: [139, 69, 19],         // Professional Brown
    debts: [255, 159, 64],        // Corporate Orange
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

      // Load logo
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

      // Load signature
      let signatureBase64 = null;
      try {
        signatureBase64 = await new Promise((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => resolve(null), 5000);
          img.onload = () => {
            clearTimeout(timeout);
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png", 1.0));
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

      // Function to add header to each page
      const addHeader = () => {
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
      };

      // Function to add footer to each page
      const addFooter = (pageNumber, totalPages) => {
        const footerY = pageHeight - 15;
        
        // Footer line
        doc.setDrawColor(...border);
        doc.setLineWidth(0.5);
        doc.line(15, footerY - 8, pageWidth - 15, footerY - 8);
        
        // Footer content
        doc.setTextColor(...secondary);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        // Left side - Company info
        doc.text("Richmond Manufacturer's Ltd - Financial Report", 15, footerY);
        
        // Center - Confidential notice
        doc.setTextColor(220, 38, 38); // Red color for CONFIDENTIAL
        doc.setFont("helvetica", "bold");
        doc.text("CONFIDENTIAL", pageWidth / 2, footerY, { align: "center" });
        
        // Right side - Page number
        doc.setTextColor(...secondary);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: "right" });
      };

      // Add confidential disclaimer at top
      const addConfidentialDisclaimer = (yPos) => {
        // Disclaimer box
        doc.setFillColor(254, 242, 242); // Light red background
        doc.setDrawColor(220, 38, 38); // Red border
        doc.setLineWidth(1);
        doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, "FD");
        
        // Disclaimer text
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CONFIDENTIAL", 20, yPos + 8);
        
        doc.setTextColor(153, 27, 27);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("This document contains confidential and proprietary information of Richmond Manufacturer's Ltd.", 20, yPos + 15);
        doc.text("Unauthorized distribution or disclosure is strictly prohibited.", 20, yPos + 21);
        
        return yPos + 35;
      };

      // Add approval section
      const addApprovalSection = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
          doc.addPage();
          addHeader();
          addFooter(doc.getNumberOfPages(), doc.getNumberOfPages()); // Will be updated later
          yPos = 55;
        }

        // Approval section header
        doc.setFillColor(...primary);
        doc.rect(15, yPos, pageWidth - 30, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DOCUMENT APPROVAL", 20, yPos + 8);
        
        yPos += 20;

        // Compiled by section
        doc.setTextColor(...primary);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Compiled by:", 20, yPos);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Shadia Nakitto", 20, yPos + 8);
        doc.text("Sales & Accounts Assistant", 20, yPos + 15);
        
        // Add signature if available
        if (signatureBase64) {
          try {
            // Calculate signature dimensions (scale down appropriately)
            const maxWidth = 60;
            const maxHeight = 30;
            doc.addImage(signatureBase64, "PNG", 20, yPos + 20, maxWidth, maxHeight);
            yPos += 35;
          } catch (error) {
            console.warn("Error adding signature image:", error);
            yPos += 10;
          }
        } else {
          // Signature line if image not available
          doc.setDrawColor(...secondary);
          doc.setLineWidth(0.5);
          doc.line(20, yPos + 25, 80, yPos + 25);
          doc.setTextColor(...secondary);
          doc.setFontSize(8);
          doc.text("Signature", 20, yPos + 30);
          yPos += 35;
        }
        
        doc.setTextColor(...secondary);
        doc.setFontSize(9);
        doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, 20, yPos);
        
        yPos += 20;

        // Presented to section
        doc.setTextColor(...primary);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Presented to:", 20, yPos);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Christine Nakaziba", 20, yPos + 8);
        doc.text("Marketing Manager", 20, yPos + 15);
        
        // Approval signature line
        doc.setDrawColor(...secondary);
        doc.setLineWidth(0.5);
        doc.line(20, yPos + 25, 80, yPos + 25);
        doc.setTextColor(...secondary);
        doc.setFontSize(8);
        doc.text("Signature & Date", 20, yPos + 30);

        return yPos + 40;
      };

      // Start generating PDF
      addHeader();
      
      // Title and date
      let yPosition = 63;
      doc.setTextColor(...primary);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Consolidated Financial Report", 15, yPosition);
      doc.setTextColor(...secondary);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, pageWidth - 15, yPosition, { align: "right" });
      yPosition += 18;

      // Add confidential disclaimer
      yPosition = addConfidentialDisclaimer(yPosition);

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
        // Check if we need a new page for the table header
        if (startY > pageHeight - 60) {
          doc.addPage();
          addHeader();
          startY = 55;
        }

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
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto', halign: "center" },
            3: { cellWidth: 'auto', halign: "right" },
            4: { cellWidth: 'auto', halign: "right" },
            5: { cellWidth: 'auto', halign: "right" },
          },
          margin: { left: 15, right: 15 },
          tableWidth: pageWidth - 30,
          styles: {
            overflow: "ellipsize",
            cellWidth: "wrap",
            fontSize: 10,
          },
          didDrawPage: function (data) {
            addHeader();
          }
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

      // Add approval section
      addApprovalSection(yPosition);

      // Add footers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

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