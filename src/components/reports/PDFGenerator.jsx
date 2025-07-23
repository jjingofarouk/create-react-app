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

  // Professional corporate colors
  const sectionColors = {
    supplies: [41, 98, 255],      // Corporate Blue
    bankDeposits: [16, 185, 129], // Professional Green
    expenses: [239, 68, 68],      // Corporate Red
    sales: [139, 69, 19],         // Professional Brown
    debts: [255, 159, 64],        // Corporate Orange
  };

  // Get dynamic report title based on date filter
  const getReportTitle = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'DAILY FINANCIAL REPORT';
      case 'week':
        return 'WEEKLY FINANCIAL REPORT';
      case 'month':
        return 'MONTHLY FINANCIAL REPORT';
      case 'custom':
        return 'CUSTOM PERIOD FINANCIAL REPORT';
      default:
        return 'CONSOLIDATED FINANCIAL REPORT';
    }
  };

  // Get period description for the introduction card
  const getPeriodDescription = () => {
    if (dateFilter.type !== "all" && dateFilter.startDate && dateFilter.endDate) {
      return `${format(new Date(dateFilter.startDate), "MMM dd, yyyy")} — ${format(new Date(dateFilter.endDate), "MMM dd, yyyy")}`;
    }
    return "All Time";
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

      // Function to add header (only on first page)
      const addHeader = () => {
        const headerHeight = 45;
        doc.setFillColor(...primary);
        doc.rect(0, 0, pageWidth, headerHeight, "F");

        if (logoBase64) {
          doc.addImage(logoBase64, "JPEG", 15, 8, 28, 28);
        }

        const logoOffset = logoBase64 ? 50 : 15;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("times", "bold");
        doc.text("RICHMOND MANUFACTURER'S LTD", logoOffset, 18);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
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
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        
        // Left side - Company info
        doc.text("Richmond Manufacturer's Ltd - Financial Report", 15, footerY);
        
        // Center - CONFIDENTIAL (bold, no border)
        doc.setTextColor(220, 38, 38); // Red color
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        
        const confidentialText = "CONFIDENTIAL";
        doc.text(confidentialText, pageWidth / 2, footerY, { align: "center" });
        
        // Right side - Page number
        doc.setTextColor(...secondary);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: "right" });
      };

      // Add stylish introduction card with dark background
      const addIntroductionCard = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        // Card background - light gray
        doc.setFillColor(248, 250, 252); // Light gray background
        doc.setDrawColor(203, 213, 225); // Border color
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPos, pageWidth - 30, 60, 4, 4, "FD");
        
        // Card header with dark background instead of purple
        doc.setFillColor(31, 41, 55); // Dark gray background (slate-800)
        doc.roundedRect(15, yPos, pageWidth - 30, 20, 4, 4, "F");
        doc.rect(15, yPos + 16, pageWidth - 30, 4, "F"); // Fill the rounded bottom
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(getReportTitle(), 20, yPos + 13);
        
        // Content area
        const cardContentY = yPos + 30;
        
        // Generated date and time
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("Generated:", 25, cardContentY);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(12); // Increased from 11 to 12
        doc.setFont("times", "normal");
        doc.text(format(new Date(), "MMM dd, yyyy 'at' HH:mm"), 70, cardContentY);
        
        // Report period
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("Period:", 25, cardContentY + 12);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(12); // Increased from 11 to 12
        doc.setFont("times", "normal");
        doc.text(getPeriodDescription(), 60, cardContentY + 12);

        // Report type badge - keep the dark theme
        const badgeX = pageWidth - 80;
        doc.setFillColor(31, 41, 55); // Dark gray to match header
        doc.roundedRect(badgeX, cardContentY - 5, 55, 18, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        
        let badgeText = "";
        switch (dateFilter.type) {
          case 'today': badgeText = "DAILY"; break;
          case 'week': badgeText = "WEEKLY"; break;
          case 'month': badgeText = "MONTHLY"; break;
          case 'custom': badgeText = "CUSTOM"; break;
          default: badgeText = "ALL TIME";
        }
        doc.text(badgeText, badgeX + 27.5, cardContentY + 5, { align: "center" });

        return yPos + 70;
      };

      // Add modern approval section card
      const addApprovalSection = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        // Card background
        doc.setFillColor(248, 250, 252); // Light gray background
        doc.setDrawColor(203, 213, 225); // Border color
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPos, pageWidth - 30, 70, 4, 4, "FD");
        
        // Card header
        doc.setFillColor(...primary);
        doc.roundedRect(15, yPos, pageWidth - 30, 15, 4, 4, "F");
        doc.rect(15, yPos + 11, pageWidth - 30, 4, "F"); // Fill the rounded bottom
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("DOCUMENT APPROVAL", 20, yPos + 10);
        
        const cardContentY = yPos + 25;
        
        // Left side - Compiled by
        const leftX = 25;
        const rightX = pageWidth / 2 + 10;
        
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("COMPILED BY:", leftX, cardContentY);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("SHADIA NAKITTO", leftX, cardContentY + 12);
        doc.setFontSize(10);
        doc.text("Sales & Accounts Assistant", leftX, cardContentY + 20);
        
        // Signature line for compiled by
        doc.setDrawColor(...secondary);
        doc.setLineWidth(0.5);
        doc.line(leftX, cardContentY + 35, leftX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature", leftX, cardContentY + 42);
        
        doc.setFontSize(9);
        doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, leftX + 35, cardContentY + 42);
        
        // Vertical divider line
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(pageWidth / 2, cardContentY - 5, pageWidth / 2, yPos + 65);
        
        // Right side - Presented to
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("PRESENTED TO:", rightX, cardContentY);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("CHRISTINE NAKAZIBA", rightX, cardContentY + 12);
        doc.setFontSize(10);
        doc.text("Marketing Manager", rightX, cardContentY + 20);
        
        // Signature line for presented to
        doc.setDrawColor(...secondary);
        doc.setLineWidth(0.5);
        doc.line(rightX, cardContentY + 35, rightX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature & Date", rightX, cardContentY + 42);

        return yPos + 80;
      };

      const addTable = (title, columns, rows, startY, sectionType = 'supplies') => {
        // Check if we need a new page for the table header
        if (startY > pageHeight - 60) {
          doc.addPage();
          startY = 20;
        }

        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.setTextColor(...primary);
        doc.text(title, 15, startY);

        if (rows.length === 0) {
          doc.setFontSize(11);
          doc.setTextColor(...secondary);
          doc.text("No data available for this period", 15, startY + 15);
          return startY + 30;
        }

        const sectionColor = sectionColors[sectionType] || sectionColors.supplies;

        // Optimized column styles for compact tables
        let columnStyles = {};
        
        // For supplies and sales summary tables, use more compact widths
        if (sectionType === 'supplies' || sectionType === 'sales') {
          if (columns.length === 6) { // Product summary tables
            columnStyles = {
              0: { cellWidth: 45 }, // Product name - reduced
              1: { cellWidth: 25, halign: "center" }, // Unit - compact
              2: { cellWidth: 20, halign: "center" }, // Qty - compact
              3: { cellWidth: 35, halign: "right" }, // Unit Price - reduced
              4: { cellWidth: 35, halign: "right" }, // Total Cost - reduced
              5: { cellWidth: 20, halign: "center" }, // % - compact
            };
          } else {
            // Standard layout for other table structures
            columnStyles = {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 'auto' },
              2: { cellWidth: 'auto', halign: "center" },
              3: { cellWidth: 'auto', halign: "right" },
              4: { cellWidth: 'auto', halign: "right" },
              5: { cellWidth: 'auto', halign: "right" },
            };
          }
        } else {
          // Standard column styles for other tables
          columnStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto', halign: "center" },
            3: { cellWidth: 'auto', halign: "right" },
            4: { cellWidth: 'auto', halign: "right" },
            5: { cellWidth: 'auto', halign: "right" },
          };
        }

        const tableOptions = {
          columns,
          body: rows,
          startY: startY + 8,
          theme: "plain",
          headStyles: {
            fillColor: sectionColor,
            textColor: [255, 255, 255],
            fontSize: 11, // Slightly smaller for compact tables
            fontStyle: "bold",
            halign: "left",
            cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, // Reduced padding
            lineWidth: 0,
            minCellHeight: 16, // Reduced height
          },
          bodyStyles: {
            fontSize: 10, // Smaller font for compact tables
            cellPadding: { top: 5, right: 8, bottom: 5, left: 8 }, // Reduced padding
            textColor: secondary,
            lineWidth: 0.2,
            lineColor: border,
            minCellHeight: 14, // Reduced height
          },
          alternateRowStyles: {
            fillColor: background,
          },
          columnStyles: columnStyles,
          margin: { left: 15, right: 15 },
          styles: {
            overflow: "ellipsize",
            cellWidth: "wrap",
            fontSize: 10,
            font: "times",
          },
          // Add custom hook to ensure proper spacing from footer
          didDrawPage: function (data) {
            // Check if this is the last page and add margin if needed
            const currentPage = doc.getCurrentPageInfo().pageNumber;
            const totalPages = doc.getNumberOfPages();
            
            // If table ends close to footer, ensure minimum margin
            if (data.cursor.y > pageHeight - 40) {
              // Table is too close to footer, move to next page
              if (currentPage === totalPages) {
                doc.addPage();
              }
            }
          }
        };

        doc.autoTable(tableOptions);
        
        // Ensure minimum margin from footer for tables that continue to next page
        let finalY = doc.lastAutoTable.finalY;
        if (finalY > pageHeight - 35) {
          // Add extra space or move to next page if too close to footer
          return finalY + 25; // Add extra margin
        }
        
        return finalY + 20;
      };

      // Start generating PDF - Add header only on first page
      addHeader();
      
      // Add introduction card instead of separate title and period sections
      let yPosition = 55;
      yPosition = addIntroductionCard(yPosition);

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
      yPosition = addApprovalSection(yPosition);

      // Add footers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      // Save PDF with dynamic filename
      const reportTypeForFile = dateFilter.type === 'today' ? 'Daily' : 
                               dateFilter.type === 'week' ? 'Weekly' : 
                               dateFilter.type === 'month' ? 'Monthly' : 
                               dateFilter.type === 'custom' ? 'Custom' : 'Consolidated';
      
      const fileName = `${reportTypeForFile}_Financial_Report_${format(new Date(), "yyyy-MM-dd")}_RML.pdf`;
      doc.save(fileName);
      toast.success(`${reportTypeForFile} report generated successfully!`);
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
          <span>Generate {dateFilter.type === 'today' ? 'Daily' : 
                         dateFilter.type === 'week' ? 'Weekly' : 
                         dateFilter.type === 'month' ? 'Monthly' : 
                         dateFilter.type === 'custom' ? 'Custom' : 'Consolidated'} Report</span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;