// src/components/reports/PDFGenerator.jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format, differenceInDays, parseISO } from "date-fns";
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
    supplies: [59, 130, 246],       // Vibrant Blue (Modern UI Blue)
    bankDeposits: [13, 148, 136],   // Teal (Replaces Green, Tailwind Teal-600)
    expenses: [239, 68, 68],        // Red (Danger/Warning, Tailwind Red-500)
    sales: [202, 103, 255],         // Violet (Modern sales metric color)
    debts: [255, 159, 64],          // Orange (Warning/Alert)
  };

  // Get dynamic report title based on date filter
  const getReportTitle = () => {
    if (dateFilter.type === 'today' || dateFilter.type === 'yesterday' || dateFilter.type === 'dayBeforeYesterday') {
      return 'DAILY FINANCIAL REPORT';
    }
    if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const diff = differenceInDays(parseISO(dateFilter.endDate), parseISO(dateFilter.startDate));
      if (diff <= 1) {
        return 'DAILY FINANCIAL REPORT';
      }
    }
    switch (dateFilter.type) {
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
      const background = [248, 250, 252];
      const border = [226, 232, 240];
      const footerSpace = 30; // Space for footer (15px footer + 15px buffer)

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
        
        // Center - CONFIDENTIAL
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("CONFIDENTIAL", pageWidth / 2, footerY, { align: "center" });
        
        // Right side - Page number
        doc.setTextColor(...secondary);
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY, { align: "right" });
      };

      // Add introduction card
      const addIntroductionCard = (yPos) => {
        if (yPos > pageHeight - footerSpace - 60) {
          doc.addPage();
          yPos = 20;
        }

        // Card background
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPos, pageWidth - 30, 60, 4, 4, "FD");
        
        // Card header
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(15, yPos, pageWidth - 30, 20, 4, 4, "F");
        doc.rect(15, yPos + 16, pageWidth - 30, 4, "F");
        
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
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.text(format(new Date(), "MMM dd, yyyy 'at' HH:mm"), 70, cardContentY);
        
        // Report period
        doc.setTextColor(...primary);
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text("Period:", 25, cardContentY + 12);
        
        doc.setTextColor(...secondary);
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.text(getPeriodDescription(), 60, cardContentY + 12);

        // Report type badge
        const badgeX = pageWidth - 80;
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(badgeX, cardContentY - 5, 55, 18, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        
        let badgeText = "";
        if (dateFilter.type === 'today' || dateFilter.type === 'yesterday' || dateFilter.type === 'dayBeforeYesterday') {
          badgeText = "DAILY";
        } else if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
          const diff = differenceInDays(parseISO(dateFilter.endDate), parseISO(dateFilter.startDate));
          badgeText = diff <= 1 ? "DAILY" : "CUSTOM";
        } else {
          switch (dateFilter.type) {
            case 'week': badgeText = "WEEKLY"; break;
            case 'month': badgeText = "MONTHLY"; break;
            case 'custom': badgeText = "CUSTOM"; break;
            default: badgeText = "ALL TIME";
          }
        }
        doc.text(badgeText, badgeX + 27.5, cardContentY + 5, { align: "center" });

        return yPos + 70;
      };

      // Add approval section
      const addApprovalSection = (yPos) => {
        if (yPos > pageHeight - footerSpace - 70) {
          doc.addPage();
          yPos = 20;
        }

        // Card background
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPos, pageWidth - 30, 70, 4, 4, "FD");
        
        // Card header
        doc.setFillColor(...primary);
        doc.roundedRect(15, yPos, pageWidth - 30, 15, 4, 4, "F");
        doc.rect(15, yPos + 11, pageWidth - 30, 4, "F");
        
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
        doc.setFont("times", "normal");
        doc.text("Sales & Accounts Assistant", leftX, cardContentY + 20);
        
        // Signature line
        doc.setDrawColor(...secondary);
        doc.setLineWidth(0.5);
        doc.line(leftX, cardContentY + 35, leftX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature", leftX, cardContentY + 42);
        doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, leftX + 35, cardContentY + 42);
        
        // Vertical divider
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
        doc.setFont("times", "normal");
        doc.text("Marketing Manager", rightX, cardContentY + 20);
        
        // Signature line
        doc.setDrawColor(...secondary);
        doc.setLineWidth(0.5);
        doc.line(rightX, cardContentY + 35, rightX + 70, cardContentY + 35);
        doc.setFontSize(9);
        doc.text("Signature & Date", rightX, cardContentY + 42);

        return yPos + 80;
      };

      // Add table with uniform width and proper page break handling
      const addTable = (title, columns, rows, startY, sectionType = 'supplies') => {
        // Check if we need a new page for the table header
        if (startY > pageHeight - footerSpace - 60) {
          doc.addPage();
          startY = 20;
        }

        doc.setFontSize(16);
        doc.setFont("times", "bold");
        doc.setTextColor(...primary);
        doc.text(title, 15, startY);

        if (!rows || rows.length === 0) {
          doc.setFontSize(11);
          doc.setTextColor(...secondary);
          doc.text("No data available for this period", 15, startY + 15);
          return startY + 30;
        }

        const sectionColor = sectionColors[sectionType] || sectionColors.supplies;
        const tableWidth = pageWidth - 30; // Uniform width for all tables

        // Filter out invalid rows
        const filteredRows = rows.filter(row => 
          row && 
          Object.values(row).some(cell => 
            cell !== null && cell !== undefined && cell.toString().trim() !== ''
          )
        );

        doc.autoTable({
          columns,
          body: filteredRows,
          startY: startY + 8,
          theme: "plain",
          headStyles: {
            fillColor: sectionColor,
            textColor: [255, 255, 255],
            fontSize: 12,
            fontStyle: "bold",
            halign: "left",
            cellPadding: { top: 7, right: 5, bottom: 7, left: 5 },
            lineWidth: 0,
            minCellHeight: 18,
          },
          bodyStyles: {
            fontSize: 11,
            cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
            textColor: secondary,
            lineWidth: 0.2,
            lineColor: border,
            minCellHeight: 16,
          },
          alternateRowStyles: {
            fillColor: background,
          },
          columnStyles: {
            // Let jsPDF-autoTable handle column widths automatically
          },
          margin: { left: 15, right: 15, bottom: footerSpace },
          tableWidth: tableWidth,
          styles: {
            overflow: "ellipsize",
            cellWidth: "wrap",
            font: "times",
            fontSize: 11,
          },
        });

        let finalY = doc.lastAutoTable.finalY || startY + 30;
        return finalY + 20; // Add spacing after table
      };

      // Start generating PDF
      addHeader();
      let yPosition = 55;
      yPosition = addIntroductionCard(yPosition);

      // Generate report sections
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
        products,
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

      // Save PDF
      let reportTypeForFile;
      if (dateFilter.type === 'today' || dateFilter.type === 'yesterday' || dateFilter.type === 'dayBeforeYesterday') {
        reportTypeForFile = 'Daily';
      } else if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
        const diff = differenceInDays(parseISO(dateFilter.endDate), parseISO(dateFilter.startDate));
        reportTypeForFile = diff <= 1 ? 'Daily' : 'Custom';
      } else {
        reportTypeForFile = dateFilter.type === 'week' ? 'Weekly' : 
                           dateFilter.type === 'month' ? 'Monthly' : 
                           'Consolidated';
      }
      
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
          <span>Generate {dateFilter.type === 'today' || dateFilter.type === 'yesterday' || dateFilter.type === 'dayBeforeYesterday' ? 'Daily' : 
                         dateFilter.type === 'week' ? 'Weekly' : 
                         dateFilter.type === 'month' ? 'Monthly' : 
                         dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate && differenceInDays(parseISO(dateFilter.endDate), parseISO(dateFilter.startDate)) <= 1 ? 'Daily' : 
                         dateFilter.type === 'custom' ? 'Custom' : 'Consolidated'} Report</span>
        </>
      )}
    </button>
  );
};

export default PDFGenerator;