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
  },
  // Modern gradient header background
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "#1e3a8a", // Deep blue
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
  },
  // Subtle geometric pattern overlay
  headerPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.1,
    backgroundColor: "transparent",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.03,
    fontSize: 80,
    color: "#1e3a8a",
    fontWeight: "bold",
    letterSpacing: 8,
  },
  header: {
    position: "relative",
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 30,
    paddingBottom: 25,
    height: 120,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 20,
    borderRadius: 8,
    border: "3pt solid rgba(255,255,255,0.2)",
  },
  companyInfo: {
    fontSize: 11,
    color: "#ffffff",
    lineHeight: 1.4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
    letterSpacing: 1,
  },
  reportMeta: {
    alignItems: "flex-end",
    color: "#ffffff",
    fontSize: 9,
  },
  contentArea: {
    padding: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 25,
    fontWeight: "normal",
  },
  dateRange: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 25,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderLeft: "4pt solid #3b82f6",
    borderRadius: 4,
  },
  // Modern card-style table
  tableContainer: {
    marginBottom: 25,
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
    padding: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 10,
    padding: 12,
    color: "#374151",
    borderRight: "1pt solid #f3f4f6",
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
  // Modern summary cards
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    border: "1pt solid #e5e7eb",
    marginHorizontal: 3,
    alignItems: "center",
    boxShadow: "0 2 4 -1 rgba(0, 0, 0, 0.05)",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Enhanced footer with modern styling
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8fafc",
    borderTop: "2pt solid #e5e7eb",
    padding: 20,
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
    marginBottom: 3,
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.3,
  },
  confidentialBadge: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "bold",
    padding: 4,
    borderRadius: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 5,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Background Elements */}
        <View style={styles.headerBackground} />
        <Text style={styles.watermark}>RICHMOND</Text>
        
        {/* Header */}
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

          {/* Modern Table */}
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
              {getTableData().map((row, rowIndex) => (
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

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            {getSummaryCards().map((card, index) => (
              <View key={index} style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summaryLabel}>{card.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Footer */}
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