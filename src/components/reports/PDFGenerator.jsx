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

  // Timeframe colors for buttons
  const timeframeColors = {
    today: [34, 197, 94],    // Green for daily
    week: [59, 130, 246],    // Blue for weekly
    month: [168, 85, 247],   // Purple for monthly
    custom: [249, 115, 22],  // Orange for custom
    all: [107, 114, 128]     // Gray for all time
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
        
        // Center - CONFIDENTIAL with red double border circle
        const confidentialX = pageWidth / 2;
        const confidentialY = footerY - 3;
        
        // Outer red circle
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(1.2);
        doc.circle(confidentialX, confidentialY, 18, "S");
        
        // Inner red circle
        doc.setLineWidth(0.8);
        doc.circle(confidentialX, confidentialY, 15, "S");
        
        // CONFIDENTIAL text in red
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("CONFIDENTIAL", confidentialX, footerY, { align: "center" });
        
        // Right side - Page number
        doc.setTextColor(...secondary);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: "right" });
      };

      // Add dark introduction card with prominent dates
      const addIntroductionCard = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 120) {
          doc.addPage();
          yPos = 20;
        }

        // Dark card background (black/dark gray)
        doc.setFillColor(17, 24, 39); // Dark gray/black
        doc.setDrawColor(75, 85, 99); // Darker border
        doc.setLineWidth(1);
        doc.roundedRect(15, yPos, pageWidth - 30, 80, 6, 6, "FD");
        
        // Inner subtle border for depth
        doc.setDrawColor(55, 65, 81);
        doc.setLineWidth(0.5);
        doc.roundedRect(17, yPos + 2, pageWidth - 34, 76, 4, 4, "S");
        
        // Title section
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("times", "bold");
        doc.text(getReportTitle(), 25, yPos + 20);
        
        // Subtitle with accent color
        doc.setTextColor(156, 163, 175); // Light gray
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.text("Comprehensive Financial Analysis & Summary", 25, yPos + 32);
        
        // Content area with prominent date display
        const cardContentY = yPos + 50;
        
        // Generated date - more prominent
        doc.setTextColor(34, 197, 94); // Green accent
        doc.setFontSize(13);
        doc.setFont("times", "bold");
        doc.text("GENERATED:", 25, cardContentY);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text(format(new Date(), "MMM dd, yyyy"), 95, cardContentY);
        
        doc.setTextColor(203, 213, 225);
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.text(`at ${format(new Date(), "HH:mm")}`, 150, cardContentY);
        
        // Report period - more prominent
        doc.setTextColor(59, 130, 246); // Blue accent
        doc.setFontSize(13);
        doc.setFont("times", "bold");
        doc.text("PERIOD:", 25, cardContentY + 15);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text(getPeriodDescription(), 80, cardContentY + 15);

        // Colored timeframe badge
        const badgeX = pageWidth - 90;
        const badgeY = cardContentY - 8;
        const currentTimeframeColor = timeframeColors[dateFilter.type] || timeframeColors.all;
        
        // Badge background with timeframe color
        doc.setFillColor(...currentTimeframeColor);
        doc.roundedRect(badgeX, badgeY, 65, 22, 3, 3, "F");
        
        // Badge border for definition
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.8);
        doc.roundedRect(badgeX, badgeY, 65, 22, 3, 3, "S");
        
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
        doc.text(badgeText, badgeX + 32.5, cardContentY + 4, { align: "center" });

        return yPos + 90;
      };

      // Add modern approval section card with dark background
      const addApprovalSection = (yPos) => {
        // Check if we need a new page
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = 20;
        }

        // Dark card background
        doc.setFillColor(17, 24, 39); // Dark gray/black
        doc.setDrawColor(75, 85, 99); // Darker border
        doc.setLineWidth(1);
        doc.roundedRect(15, yPos, pageWidth - 30, 70, 6, 6, "FD");
        
        // Inner subtle border
        doc.setDrawColor(55, 65, 81);
        doc.setLineWidth(0.5);
        doc.roundedRect(17, yPos + 2, pageWidth - 34, 66, 4, 4, "S");
        
        // Header accent bar
        doc.setFillColor(99, 102, 241); // Indigo accent
        doc.roundedRect(15, yPos, pageWidth - 30, 18, 6, 6, "F");
        doc.rect(15, yPos + 12, pageWidth - 30, 6, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("DOCUMENT APPROVAL", 25, yPos + 12);
        
        const cardContentY = yPos + 30;
        
        // Left side - Compiled by
        const leftX = 25;
        const rightX = pageWidth / 2 + 10;
        
        doc.setTextColor(34, 197, 94); // Green accent
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("COMPILED BY:", leftX, cardContentY);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("SHADIA NAKITTO", leftX, cardContentY + 12);
        
        doc.setTextColor(203, 213, 225);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text("Sales & Accounts Assistant", leftX, cardContentY + 20);
        
        // Signature line for compiled by
        doc.setDrawColor(156, 163, 175);
        doc.setLineWidth(0.5);
        doc.line(leftX, cardContentY + 35, leftX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature", leftX, cardContentY + 42);
        doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, leftX + 35, cardContentY + 42);
        
        // Vertical divider line
        doc.setDrawColor(75, 85, 99);
        doc.setLineWidth(0.8);
        doc.line(pageWidth / 2, cardContentY - 5, pageWidth / 2, yPos + 65);
        
        // Right side - Presented to
        doc.setTextColor(59, 130, 246); // Blue accent
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("PRESENTED TO:", rightX, cardContentY);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("CHRISTINE NAKAZIBA", rightX, cardContentY + 12);
        
        doc.setTextColor(203, 213, 225);
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text("Marketing Manager", rightX, cardContentY + 20);
        
        // Signature line for presented to
        doc.setDrawColor(156, 163, 175);
        doc.setLineWidth(0.5);
        doc.line(rightX, cardContentY + 35, rightX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature & Date", rightX, cardContentY + 42);

        return yPos + 80;
      };

      // Add modern debt metrics card
      const addDebtMetricsCard = (yPos, totalDebt, overdueDebt, clientsWithDebt) => {
        // Check if we need a new page
        if (yPos > pageHeight - 70) {
          doc.addPage();
          yPos = 20;
        }

        // Modern card background
        doc.setFillColor(248, 250, 252); // Light background
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.8);
        doc.roundedRect(15, yPos, pageWidth - 30, 55, 6, 6, "FD");
        
        // Header section
        doc.setFillColor(99, 102, 241); // Indigo
        doc.roundedRect(15, yPos, pageWidth - 30, 18, 6, 6, "F");
        doc.rect(15, yPos + 12, pageWidth - 30, 6, "F");
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("DEBT METRICS OVERVIEW", 25, yPos + 12);
        
        // Metrics section with separators
        const metricsY = yPos + 30;
        const sectionWidth = (pageWidth - 40) / 3;
        
        // Total Debt
        const totalX = 25;
        doc.setTextColor(239, 68, 68); // Red
        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(`UGX ${totalDebt?.toLocaleString() || '0'}`, totalX, metricsY);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("Total Outstanding", totalX, metricsY + 10);
        
        // First separator
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(totalX + sectionWidth - 10, metricsY - 10, totalX + sectionWidth - 10, metricsY + 15);
        
        // Overdue Debt
        const overdueX = totalX + sectionWidth;
        doc.setTextColor(220, 38, 38); // Darker red
        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(`UGX ${overdueDebt?.toLocaleString() || '0'}`, overdueX, metricsY);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("Overdue Amount", overdueX, metricsY + 10);
        
        // Second separator
        doc.line(overdueX + sectionWidth - 10, metricsY - 10, overdueX + sectionWidth - 10, metricsY + 15);
        
        // Clients with Debt
        const clientsX = overdueX + sectionWidth;
        doc.setTextColor(249, 115, 22); // Orange
        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.text(`${clientsWithDebt || 0}`, clientsX, metricsY);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("Active Debtors", clientsX, metricsY + 10);

        return yPos + 65;
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

        // Adjust column widths for supplies and sales tables to match other tables
        const isWideTable = sectionType === 'supplies' || sectionType === 'sales';
        const tableWidth = pageWidth - 30;
        
        let columnStyles = {};
        if (isWideTable) {
          // For supplies and sales tables, distribute columns more evenly with narrower widths
          const numColumns = columns.length;
          const baseWidth = tableWidth / numColumns;
          
          for (let i = 0; i < numColumns; i++) {
            columnStyles[i] = { 
              cellWidth: baseWidth - 5, // Slightly narrower to ensure fit
              halign: i === 0 ? "left" : (i >= numColumns - 2 ? "right" : "center")
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

      // Start generating PDF - Add header only on first page
      addHeader();
      
      // Add dark introduction card with prominent dates
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

      // Add modern debt metrics card (you'll need to pass the actual debt metrics data)
      // Example usage - replace with actual calculated values from your data
      const totalDebt = data?.debts?.reduce((sum, debt) => sum + debt.amount, 0) || 0;
      const overdueDebt = data?.debts?.filter(debt => new Date(debt.dueDate) < new Date())
                               .reduce((sum, debt) => sum + debt.amount, 0) || 0;
      const clientsWithDebt = data?.debts?.length || 0;
      
      yPosition = addDebtMetricsCard(yPosition, totalDebt, overdueDebt, clientsWithDebt);

      // Add dark approval section
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

  // Get button colors based on timeframe
  const getButtonColor = () => {
    switch (dateFilter.type) {
      case 'today':
        return 'bg-green-600 hover:bg-green-700';
      case 'week':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'month':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'custom':
        return 'bg-orange-600 hover:bg-orange-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className={`w-full ${getButtonColor()} text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
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
            Generate {dateFilter.type === 'today' ? 'DAILY' : 
                     dateFilter.type === 'week' ? 'WEEKLY' : 
                     dateFilter.type === 'month' ? 'MONTHLY' : 
                     dateFilter.type === 'custom' ? 'CUSTOM' : 'CONSOLIDATED'} Report
          </span>
          <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-normal">
            {getPeriodDescription()}
          </span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;