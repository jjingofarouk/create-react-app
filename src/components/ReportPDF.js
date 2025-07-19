import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import logo from "./logo.jpg";
import { Download, FileText } from "lucide-react";

// Register premium fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.ttf", fontWeight: "bold" },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWfAZ9hiA.ttf", fontWeight: "300" },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfAZ9hiA.ttf", fontWeight: "600" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  // Premium gradient header
  headerGradient: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    backgroundColor: "#1e3a8a", // fallback
    padding: 25,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 8,
    border: "2pt solid #ffffff",
  },
  companyBrand: {
    color: "#ffffff",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  companyTagline: {
    fontSize: 9,
    color: "#e2e8f0",
    fontWeight: "300",
    fontStyle: "italic",
  },
  headerInfo: {
    textAlign: "right",
    color: "#ffffff",
  },
  headerInfoText: {
    fontSize: 9,
    color: "#e2e8f0",
    marginBottom: 1,
  },
  headerInfoBold: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  // Content area with premium styling
  contentArea: {
    padding: 30,
    paddingTop: 25,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "2pt solid #e2e8f0",
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportMeta: {
    textAlign: "right",
  },
  dateRange: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 3,
  },
  generatedInfo: {
    fontSize: 9,
    color: "#94a3b8",
    fontWeight: "300",
  },
  // Premium table styling
  tableContainer: {
    marginBottom: 25,
    borderRadius: 8,
    overflow: "hidden",
    border: "1pt solid #e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
    backgroundColor: "#1e3a8a", // fallback
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    padding: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    minHeight: 40,
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  tableRowOdd: {
    backgroundColor: "#ffffff",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 12,
    color: "#334155",
    fontWeight: "400",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  tableCellAmount: {
    fontWeight: "600",
    color: "#059669",
  },
  tableCellStatus: {
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 9,
    letterSpacing: 0.3,
  },
  statusPaid: {
    color: "#059669",
  },
  statusPending: {
    color: "#dc2626",
  },
  // Premium summary cards
  summaryContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    border: "1pt solid #e2e8f0",
    borderRadius: 8,
    padding: 15,
    minHeight: 60,
  },
  summaryCardPrimary: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "bold",
  },
  summaryValuePrimary: {
    color: "#1e3a8a",
    fontSize: 16,
  },
  // Premium footer
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    backgroundColor: "#1e3a8a", // fallback
    padding: 15,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#e2e8f0",
    fontWeight: "300",
  },
  footerBrand: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "600",
  },
  // Watermark
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "#f1f5f9",
    fontWeight: "bold",
    zIndex: -1,
    opacity: 0.05,
  },
});

const ReportDocument = ({ reportType, data, totals, products, startDate, endDate }) => {
  const getTableHeaders = () => {
    switch (reportType) {
      case "debts":
        return ["Client Name", "Amount (UGX)", "Status", "Date Created", "Notes"];
      case "sales":
        return ["Client Name", "Product", "Quantity", "Total Amount (UGX)", "Transaction Date"];
      case "expenses":
        return ["Expense Category", "Amount (UGX)", "Date", "Description"];
      case "bank":
        return ["Depositor Name", "Amount (UGX)", "Date", "Transaction Details"];
      default:
        return [];
    }
  };

  const getTableData = () => {
    return data.map((item) => {
      if (reportType === "debts") {
        return [
          item.client || "N/A",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          item.amount === 0 ? "Paid" : "Pending",
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "No notes",
        ];
      } else if (reportType === "sales") {
        const product = products.find((p) => p.id === item.product?.productId);
        return [
          item.client || "N/A",
          product?.name || item.product?.name || "N/A",
          item.product?.quantity?.toLocaleString() || "0",
          item.totalAmount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
        ];
      } else if (reportType === "expenses") {
        return [
          item.category || "Uncategorized",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "No description",
        ];
      } else if (reportType === "bank") {
        return [
          item.depositor || "N/A",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.description || "No details",
        ];
      }
      return [];
    });
  };

  const formatReportType = (type) => {
    const types = {
      debts: "Debt Management",
      sales: "Sales Performance",
      expenses: "Expense Analysis",
      bank: "Banking Transactions"
    };
    return types[type] || type;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Premium Header */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image src={logo} style={styles.logo} />
              <View style={styles.companyBrand}>
                <Text style={styles.companyName}>RICHMOND MANUFACTURER'S LTD</Text>
                <Text style={styles.companyTagline}>Excellence in Manufacturing & Distribution</Text>
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoText}>Plot 19191, Kimwanyi Road, Nakwero</Text>
              <Text style={styles.headerInfoText}>Wakiso District, Kira Municipality</Text>
              <Text style={styles.headerInfoBold}>Tel: 0705555498 / 0776 210570</Text>
              <Text style={[styles.headerInfoText, { marginTop: 8 }]}>Report Prepared by:</Text>
              <Text style={styles.headerInfoBold}>Shadia Nakitto</Text>
              <Text style={styles.headerInfoText}>flowershadrah@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Report Header */}
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>{formatReportType(reportType)} Report</Text>
            <View style={styles.reportMeta}>
              <Text style={styles.dateRange}>
                {startDate && endDate
                  ? `Period: ${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
                  : "Period: All Time"}
              </Text>
              <Text style={styles.generatedInfo}>
                Generated: {format(new Date(), "MMM dd, yyyy 'at' HH:mm")}
              </Text>
            </View>
          </View>

          {/* Premium Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={[styles.summaryValue, styles.summaryValuePrimary]}>
                {totals.total.toLocaleString("en-UG", { style: "currency", currency: "UGX" })}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Records</Text>
              <Text style={styles.summaryValue}>{totals.count.toLocaleString()}</Text>
            </View>
            {reportType === "debts" && (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Paid</Text>
                  <Text style={[styles.summaryValue, { color: "#059669" }]}>{totals.paid}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Pending</Text>
                  <Text style={[styles.summaryValue, { color: "#dc2626" }]}>{totals.pending}</Text>
                </View>
              </>
            )}
          </View>

          {/* Premium Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              {getTableHeaders().map((header, index) => (
                <Text key={index} style={styles.tableHeaderCell}>
                  {header}
                </Text>
              ))}
            </View>
            {getTableData().map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[
                  styles.tableRow,
                  rowIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                ]}
              >
                {row.map((cell, cellIndex) => {
                  let cellStyle = [styles.tableCell];
                  
                  // Style amount columns
                  if (getTableHeaders()[cellIndex]?.includes("Amount")) {
                    cellStyle.push(styles.tableCellAmount);
                  }
                  
                  // Style status column
                  if (getTableHeaders()[cellIndex] === "Status") {
                    cellStyle.push(styles.tableCellStatus);
                    if (cell === "Paid") {
                      cellStyle.push(styles.statusPaid);
                    } else if (cell === "Pending") {
                      cellStyle.push(styles.statusPending);
                    }
                  }
                  
                  return (
                    <Text key={cellIndex} style={cellStyle}>
                      {cell}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>RICHMOND</Text>

        {/* Premium Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              This document contains confidential business information
            </Text>
            <Text style={styles.footerBrand}>
              Richmond Manufacturer's Ltd © {new Date().getFullYear()}
            </Text>
            <Text style={styles.footerText}>
              Page 1 of 1
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const ReportPDF = ({ reportType, data, totals, products, startDate, endDate }) => {
  const formatFileName = (type) => {
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");
    const typeMap = {
      debts: "debt-management",
      sales: "sales-performance", 
      expenses: "expense-analysis",
      bank: "banking-transactions"
    };
    return `richmond-${typeMap[type] || type}-report_${timestamp}.pdf`;
  };

  return (
    <PDFDownloadLink
      document={
        <ReportDocument
          reportType={reportType}
          data={data}
          totals={totals}
          products={products}
          startDate={startDate}
          endDate={endDate}
        />
      }
      fileName={formatFileName(reportType)}
    >
      {({ loading }) => (
        <button
          className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                     text-white rounded-xl hover:from-blue-700 hover:to-blue-800 
                     transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
                     border border-blue-500/20 font-semibold text-sm"
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            )}
            <span className="font-medium">
              {loading ? "Generating Premium Report..." : "Export Premium PDF"}
            </span>
          </div>
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                           -skew-x-12 -translate-x-full group-hover:translate-x-full 
                           transition-transform duration-700" />
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ReportPDF;