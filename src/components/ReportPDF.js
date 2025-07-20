import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import logo from "./logo.jpg";
import { Download } from "lucide-react";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    position: "relative",
    paddingBottom: 120, // Reserve space for footer
  },
  // Fixed gradient header background - positioned behind content
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "#1e3a8a",
    zIndex: 1, // Behind the header content
  },
  // Watermark positioned correctly
  watermark: {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.02,
    fontSize: 100,
    color: "#1e3a8a",
    fontWeight: "bold",
    letterSpacing: 8,
    zIndex: 0, // Behind everything
  },
  // Header content positioned above the background
  header: {
    position: "relative",
    zIndex: 10, // Above the background
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 30,
    paddingBottom: 25,
    minHeight: 140,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 20,
    borderRadius: 8,
    border: "3pt solid rgba(255,255,255,0.3)",
  },
  companyInfo: {
    fontSize: 11,
    color: "#ffffff",
    lineHeight: 1.5,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 1,
  },
  reportMeta: {
    alignItems: "flex-end",
    color: "#ffffff",
    fontSize: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 6,
  },
  // Content area with proper spacing
  contentArea: {
    padding: 30,
    paddingTop: 20,
    minHeight: 600, // Ensure minimum content height
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 25,
    fontWeight: "normal",
  },
  dateRange: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderLeft: "4pt solid #3b82f6",
    borderRadius: 6,
  },
  // Modern card-style table with better spacing
  tableContainer: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
    border: "1pt solid #e5e7eb",
    boxShadow: "0 4 6 -1 rgba(0, 0, 0, 0.1)",
  },
  table: {
    display: "table",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#1f2937",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
    padding: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 10,
    padding: 15,
    color: "#374151",
    borderRight: "1pt solid #f3f4f6",
    lineHeight: 1.3,
  },
  tableCellLast: {
    borderRight: "none",
  },
  evenRow: {
    backgroundColor: "#f9fafb",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  // Modern summary cards with better spacing
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 40,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    border: "1pt solid #e5e7eb",
    alignItems: "center",
    boxShadow: "0 2 4 -1 rgba(0, 0, 0, 0.05)",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Fixed footer positioning
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8fafc",
    borderTop: "2pt solid #e5e7eb",
    padding: 25,
    zIndex: 5,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  recipient: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  confidentialBadge: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
    padding: 6,
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  // Page break helpers
  pageBreak: {
    marginTop: 40,
    marginBottom: 40,
  },
  // Continuation header for subsequent pages
  continuationHeader: {
    backgroundColor: "#f8fafc",
    padding: 20,
    marginBottom: 20,
    borderBottom: "2pt solid #e5e7eb",
    borderRadius: 6,
  },
  continuationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
  },
});

const ReportDocument = ({ reportType, data, totals, products, startDate, endDate }) => {
  const getTableHeaders = () => {
    switch (reportType) {
      case "debts":
        return ["Client", "Amount (UGX)", "Status", "Date", "Notes"];
      case "sales":
        return ["Client", "Product", "Quantity", "Amount (UGX)", "Date"];
      case "expenses":
        return ["Category", "Amount (UGX)", "Date", "Notes"];
      case "bank":
        return ["Depositor", "Amount (UGX)", "Date", "Description"];
      default:
        return [];
    }
  };

  const getTableData = () => {
    return data.map((item) => {
      if (reportType === "debts") {
        return [
          item.client || "-",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          item.amount === 0 ? "Paid" : "Pending",
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      } else if (reportType === "sales") {
        const product = products.find((p) => p.id === item.product?.productId);
        return [
          item.client || "-",
          product?.name || item.product?.name || "-",
          item.product?.quantity || 0,
          item.totalAmount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
        ];
      } else if (reportType === "expenses") {
        return [
          item.category || "-",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.notes || "-",
        ];
      } else if (reportType === "bank") {
        return [
          item.depositor || "-",
          item.amount.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
          format(item.createdAt, "MMM dd, yyyy HH:mm"),
          item.description || "-",
        ];
      }
      return [];
    });
  };

  const getSummaryCards = () => {
    const cards = [
      {
        label: "Total Amount",
        value: totals.total.toLocaleString("en-UG", { style: "currency", currency: "UGX" }),
      },
      {
        label: "Total Records",
        value: totals.count.toString(),
      },
    ];

    if (reportType === "debts") {
      cards.push(
        {
          label: "Paid",
          value: totals.paid.toString(),
        },
        {
          label: "Pending",
          value: totals.pending.toString(),
        }
      );
    }

    return cards;
  };

  // Split data into chunks for better page management
  const itemsPerPage = 15; // Adjust based on your needs
  const tableData = getTableData();
  const chunks = [];
  for (let i = 0; i < tableData.length; i += itemsPerPage) {
    chunks.push(tableData.slice(i, i + itemsPerPage));
  }

  return (
    <Document>
      {/* First Page */}
      <Page size="A4" style={styles.page}>
        {/* Background Elements */}
        <View style={styles.headerBackground} />
        <Text style={styles.watermark}>RICHMOND</Text>
        
        {/* Header Content */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={logo} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>RICHMOND MANUFACTURER'S LTD</Text>
              <View style={styles.companyInfo}>
                <Text>Plot 19191, Kimwanyi Road, Nakwero</Text>
                <Text>Wakiso District, Kira Municipality</Text>
                <Text>Tel: 0705555498 / 0776 210570</Text>
              </View>
            </View>
          </View>
          <View style={styles.reportMeta}>
            <Text>Report ID: RPT-{format(new Date(), "yyyyMMdd-HHmmss")}</Text>
            <Text>Generated: {format(new Date(), "MMM dd, yyyy HH:mm")}</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
          </Text>
          <Text style={styles.subtitle}>
            Comprehensive {reportType} analysis and insights
          </Text>
          
          <View style={styles.dateRange}>
            <Text>
              📅 Report Period: {startDate && endDate
                ? `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`
                : "All Time Records"}
            </Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            {getSummaryCards().map((card, index) => (
              <View key={index} style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summaryLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* First chunk of table data */}
          {chunks.length > 0 && (
            <View style={styles.tableContainer}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {getTableHeaders().map((header, index) => (
                    <Text 
                      key={index} 
                      style={[
                        styles.tableCell, 
                        styles.tableHeader, 
                        { flex: 1 },
                        index === getTableHeaders().length - 1 ? styles.tableCellLast : {}
                      ]}
                    >
                      {header}
                    </Text>
                  ))}
                </View>
                {chunks[0].map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.tableRow,
                      rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow
                    ]}
                  >
                    {row.map((cell, cellIndex) => (
                      <Text 
                        key={cellIndex} 
                        style={[
                          styles.tableCell, 
                          { flex: 1 },
                          cellIndex === row.length - 1 ? styles.tableCellLast : {}
                        ]}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.recipient}>Prepared for: Marketing Manager</Text>
              <Text style={styles.recipient}>Prepared by: Shadia Nakitto</Text>
              <Text style={styles.footerText}>
                Richmond Manufacturer's Ltd © {new Date().getFullYear()}
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerText}>
                This report contains confidential business information.
              </Text>
              <Text style={styles.footerText}>
                Unauthorized distribution is strictly prohibited.
              </Text>
              <Text style={styles.confidentialBadge}>CONFIDENTIAL</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Additional Pages for remaining data */}
      {chunks.slice(1).map((chunk, pageIndex) => (
        <Page key={pageIndex + 1} size="A4" style={styles.page}>
          <Text style={styles.watermark}>RICHMOND</Text>
          
          {/* Continuation Header */}
          <View style={styles.continuationHeader}>
            <Text style={styles.continuationTitle}>
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - Continued (Page {pageIndex + 2})
            </Text>
          </View>

          <View style={styles.contentArea}>
            <View style={styles.tableContainer}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  {getTableHeaders().map((header, index) => (
                    <Text 
                      key={index} 
                      style={[
                        styles.tableCell, 
                        styles.tableHeader, 
                        { flex: 1 },
                        index === getTableHeaders().length - 1 ? styles.tableCellLast : {}
                      ]}
                    >
                      {header}
                    </Text>
                  ))}
                </View>
                {chunk.map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.tableRow,
                      rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow
                    ]}
                  >
                    {row.map((cell, cellIndex) => (
                      <Text 
                        key={cellIndex} 
                        style={[
                          styles.tableCell, 
                          { flex: 1 },
                          cellIndex === row.length - 1 ? styles.tableCellLast : {}
                        ]}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer for continuation pages */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerText}>
                  Richmond Manufacturer's Ltd © {new Date().getFullYear()}
                </Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.footerText}>Page {pageIndex + 2}</Text>
                <Text style={styles.confidentialBadge}>CONFIDENTIAL</Text>
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const ReportPDF = ({ reportType, data, totals, products, startDate, endDate }) => {
  const professionalFileName = `Richmond_Manufacturers_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`;

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
      fileName={professionalFileName}
    >
      {({ loading }) => (
        <button
          className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={loading}
        >
          <Download className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium">
            {loading ? "Generating PDF..." : "Export PDF Report"}
          </span>
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ReportPDF;