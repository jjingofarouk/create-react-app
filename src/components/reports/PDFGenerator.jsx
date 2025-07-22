
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

  // Timeframe-specific colors for buttons and styling
  const timeframeColors = {
    today: [34, 197, 94],     // Fresh Green for Daily
    week: [59, 130, 246],     // Blue for Weekly  
    month: [168, 85, 247],    // Purple for Monthly
    custom: [245, 158, 11],   // Amber for Custom
    all: [71, 85, 105]        // Slate for All Time
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
      const darkBg = [17, 24, 39];      // Dark background
      const darkCard = [31, 41, 55];    // Dark card background

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

      // Function to add footer with circled CONFIDENTIAL
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
        
        // Center - CONFIDENTIAL with double red circle
        const centerX = pageWidth / 2;
        const confidentialY = footerY - 3;
        
        // Outer red circle
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(1.2);
        doc.circle(centerX, confidentialY, 18, "D");
        
        // Inner red circle
        doc.setLineWidth(0.8);
        doc.circle(centerX, confidentialY, 14, "D");
        
        // CONFIDENTIAL text in red
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("CONFIDENTIAL", centerX, footerY, { align: "center" });
        
        // Right side - Page number
        doc.setTextColor(...secondary);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: "right" });
      };

      // Add dark themed introduction card
      const addIntroductionCard = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        // Dark card background with gradient effect
        doc.setFillColor(...darkBg); // Very dark background
        doc.roundedRect(15, yPos, pageWidth - 30, 80, 6, 6, "F");
        
        // Subtle inner border for depth
        doc.setDrawColor(55, 65, 81);
        doc.setLineWidth(1);
        doc.roundedRect(16, yPos + 1, pageWidth - 32, 78, 5, 5, "D");
        
        // Get timeframe color
        const timeframeColor = timeframeColors[dateFilter.type] || timeframeColors.all;
        
        // Accent bar on the left
        doc.setFillColor(...timeframeColor);
        doc.roundedRect(15, yPos, 6, 80, 3, 3, "F");
        
        // Title area with subtle gradient
        doc.setFillColor(...darkCard);
        doc.roundedRect(25, yPos + 10, pageWidth - 50, 25, 4, 4, "F");
        
        // Main Title - larger and more prominent
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("times", "bold");
        doc.text(getReportTitle(), 35, yPos + 22);
        
        // Timeframe badge with dynamic color
        const badgeX = pageWidth - 90;
        doc.setFillColor(...timeframeColor);
        doc.roundedRect(badgeX, yPos + 15, 65, 20, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        
        let badgeText = "";
        switch (dateFilter.type) {
          case 'today': badgeText = "DAILY"; break;
          case 'week': badgeText = "WEEKLY"; break;
          case 'month': badgeText = "MONTHLY"; break;
          case 'custom': badgeText = "CUSTOM"; break;
          default: badgeText = "ALL TIME";
        }
        doc.text(badgeText, badgeX + 32.5, yPos + 26, { align: "center" });
        
        // Content section
        const cardContentY = yPos + 50;
        
        // Generated date and time with icons effect
        doc.setTextColor(156, 163, 175); // Light gray
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text("●", 30, cardContentY);
        
        doc.setTextColor(229, 231, 235); // Almost white
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("Generated:", 38, cardContentY);
        
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text(format(new Date(), "MMM dd, yyyy 'at' HH:mm"), 90, cardContentY);
        
        // Report period with more emphasis on dates
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text("●", 30, cardContentY + 15);
        
        doc.setTextColor(229, 231, 235);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("Period:", 38, cardContentY + 15);
        
        // Make dates more prominent with timeframe color
        doc.setTextColor(...timeframeColor);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text(getPeriodDescription(), 80, cardContentY + 15);

        return yPos + 90;
      };

      // Add modern approval section with dark theme matching
      const addApprovalSection = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        // Dark card background
        doc.setFillColor(...darkBg);
        doc.roundedRect(15, yPos, pageWidth - 30, 85, 6, 6, "F");
        
        // Subtle border
        doc.setDrawColor(55, 65, 81);
        doc.setLineWidth(1);
        doc.roundedRect(16, yPos + 1, pageWidth - 32, 83, 5, 5, "D");
        
        // Header section with accent color
        doc.setFillColor(...darkCard);
        doc.roundedRect(25, yPos + 10, pageWidth - 50, 18, 4, 4, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("DOCUMENT APPROVAL", 30, yPos + 21);
        
        const cardContentY = yPos + 38;
        
        // Left side - Compiled by
        const leftX = 30;
        const rightX = pageWidth / 2 + 15;
        
        doc.setTextColor(229, 231, 235);
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("COMPILED BY:", leftX, cardContentY);
        
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("SHADIA NAKITTO", leftX, cardContentY + 12);
        doc.setFontSize(9);
        doc.text("Sales & Accounts Assistant", leftX, cardContentY + 20);
        
        // Signature line
        doc.setDrawColor(107, 114, 128);
        doc.setLineWidth(0.5);
        doc.line(leftX, cardContentY + 32, leftX + 65, cardContentY + 32);
        doc.setFontSize(8);
        doc.text("Signature", leftX, cardContentY + 38);
        doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, leftX + 35, cardContentY + 38);
        
        // Vertical divider
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.8);
        doc.line(pageWidth / 2, cardContentY - 8, pageWidth / 2, yPos + 75);
        
        // Right side - Presented to
        doc.setTextColor(229, 231, 235);
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("PRESENTED TO:", rightX, cardContentY);
        
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("CHRISTINE NAKAZIBA", rightX, cardContentY + 12);
        doc.setFontSize(9);
        doc.text("Marketing Manager", rightX, cardContentY + 20);
        
        // Signature line
        doc.setDrawColor(107, 114, 128);
        doc.setLineWidth(0.5);
        doc.line(rightX, cardContentY + 32, rightX + 65, cardContentY + 32);
        doc.setFontSize(8);
        doc.text("Signature & Date", rightX, cardContentY + 38);

        return yPos + 95;
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

        // Adjust column widths for supplies and sales tables
        const isWideTable = sectionType === 'supplies' || sectionType === 'sales';
        const tableWidth = pageWidth - 30;
        
        let columnStyles = {};
        if (isWideTable) {
          const numColumns = columns.length;
          const baseWidth = tableWidth / numColumns;
          
          for (let i = 0; i < numColumns; i++) {
            columnStyles[i] = { 
              cellWidth: baseWidth - 5,
              halign: i === 0 ? "left" : (i >= numColumns - 2 ? "right" : "center")
            };
          }
        } else {
          columnStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto', halign: "center" },
            3: { cellWidth: 'auto', halign: "right" },
            4: { cellWidth: 'auto', halign: "right" },
            5: { cellWidth: 'auto', halign: "right" },
          };
        }

        doc.autoTable({
          columns,
          body: rows,
          startY: startY + 8,
          theme: "plain",
          headStyles: {
            fillColor: sectionColor,
            textColor: [255, 255, 255],
            fontSize: 12,
            fontStyle: "bold",
            halign: "left",
            cellPadding: { top: 7, right: isWideTable ? 6 : 10, bottom: 7, left: isWideTable ? 6 : 10 },
            lineWidth: 0,
            minCellHeight: 18,
          },
          bodyStyles: {
            fontSize: isWideTable ? 10 : 11,
            cellPadding: { top: 6, right: isWideTable ? 6 : 10, bottom: 6, left: isWideTable ? 6 : 10 },
            textColor: secondary,
            lineWidth: 0.2,
            lineColor: border,
            minCellHeight: 16,
          },
          alternateRowStyles: {
            fillColor: background,
          },
          columnStyles: columnStyles,
          margin: { left: 15, right: 15 },
          tableWidth: tableWidth,
          styles: {
            overflow: "ellipsize",
            cellWidth: "wrap",
            fontSize: isWideTable ? 10 : 11,
            font: "times",
          },
        });
        return doc.lastAutoTable.finalY + 20;
      };

      // Enhanced addTable function specifically for debt metrics with modern cards
      const addDebtMetricsTable = (title, columns, rows, startY) => {
        if (startY > pageHeight - 100) {
          doc.addPage();
          startY = 20;
        }

        // Title
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

        // Modern card-style debt metrics
        let currentY = startY + 15;
        const cardWidth = (pageWidth - 45) / 2; // Two cards per row
        const cardHeight = 35;
        let cardX = 15;
        let cardsInRow = 0;

        rows.forEach((row, index) => {
          // Check if we need a new row
          if (cardsInRow >= 2) {
            cardsInRow = 0;
            cardX = 15;
            currentY += cardHeight + 10;
          }

          // Check if we need a new page
          if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = 20;
            cardX = 15;
            cardsInRow = 0;
          }

          // Card background with gradient
          doc.setFillColor(249, 250, 251);
          doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 4, 4, "F");
          
          // Card border
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.5);
          doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 4, 4, "D");
          
          // Accent bar on left
          doc.setFillColor(...sectionColors.debts);
          doc.roundedRect(cardX, currentY, 3, cardHeight, 2, 2, "F");
          
          // Client name
          doc.setTextColor(...primary);
          doc.setFontSize(12);
          doc.setFont("times", "bold");
          doc.text(row[0], cardX + 8, currentY + 12); // Client name
          
          // Separator line
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.3);
          doc.line(cardX + 8, currentY + 16, cardX + cardWidth - 8, currentY + 16);
          
          // Amount owed
          doc.setTextColor(...sectionColors.debts);
          doc.setFontSize(11);
          doc.setFont("times", "bold");
          doc.text(`UGX ${row[1]}`, cardX + 8, currentY + 25); // Amount
          
          // Days overdue (if applicable)
          if (row.length > 2) {
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(9);
            doc.setFont("times", "normal");
            doc.text(row[2], cardX + 8, currentY + 32); // Days/Date
          }

          cardX += cardWidth + 15;
          cardsInRow++;
        });

        return currentY + cardHeight + 25;
      };

      // Start generating PDF - Add header only on first page
      addHeader();
      
      // Add dark-themed introduction card
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
      
      // Use enhanced debt metrics for the debts section
      yPosition = DebtsSummary({ 
        doc, 
        data, 
        clients, 
        dateFilter, 
        addTable: (title, columns, rows, startY) => {
          if (title.toLowerCase().includes('debt') || title.toLowerCase().includes('owed')) {
            return addDebtMetricsTable(title, columns, rows, startY);
          }
          return addTable(title, columns, rows, startY, 'debts');
        }, 
        yPosition 
      });

      // Add dark-themed approval section
      yPosition = addApprovalSection(yPosition);

      // Add footers with circled CONFIDENTIAL to all pages
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

  // Get button styling based on timeframe
  const getButtonStyling = () => {
    const baseClass = "w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (dateFilter.type) {
      case 'today':
        return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
      case 'week':
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
      case 'month':
        return `${baseClass} bg-purple-600 text-white hover:bg-purple-700`;
      case 'custom':
        return `${baseClass} bg-amber-600 text-white hover:bg-amber-700`;
      default:
        return `${baseClass} bg-slate-600 text-white hover:bg-slate-700`;
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className={getButtonStyling()}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span className="font-bold">
            Generate {dateFilter.type === 'today' ? 'Daily' : 
                     dateFilter.type === 'week' ? 'Weekly' : 
                     dateFilter.type === 'month' ? 'Monthly' : 
                     dateFilter.type === 'custom' ? 'Custom' : 'Consolidated'} Report
          </span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;