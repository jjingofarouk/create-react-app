import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font, PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import logo from "./logo.jpg";
import signature from "./signature.png"; // Add your signature file here
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
    padding: 40,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "rgba(0, 51, 102, 0.08)",
    fontWeight: "bold",
    zIndex: -1,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    borderBottom: "3pt solid #003366",
    paddingBottom: 15,
  },
  logoSection: {
    alignItems: "flex-start",
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 5,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.4,
    maxWidth: 280,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 3,
  },
  addressLine: {
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 15,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 1,
  },
  recipientInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderLeft: "4pt solid #003366",
  },
  recipientLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  recipientDetails: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.3,
  },
  dateRange: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 25,
    textAlign: "center",
    fontStyle: "italic",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#003366",
    marginBottom: 25,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableHeader: {
    backgroundColor: "#003366",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 10,
    padding: 10,
  },
  tableCell: {
    fontSize: 9,
    padding: 10,
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  summary: {
    fontSize: 11,
    color: "#333333",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
    border: "1pt solid #003366",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 8,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    alignItems: "center",
    minWidth: 200,
  },
  signatureImage: {
    width: 100,
    height: 50,
    marginBottom: 5,
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: "#003366",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    color: "#333333",
    textAlign: "center",
  },
  signatureName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
    borderTop: "1pt solid #e0e0e0",
    paddingTop: 10,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>RICHMOND MANUFACTURER'S LTD</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={logo} style={styles.logo} />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>RICHMOND MANUFACTURER'S LTD</Text>
            <Text style={styles.addressLine}>Plot 19191, Kimwanyi Road, Nakwero</Text>
            <Text style={styles.addressLine}>Wakiso District, Kira Municipality</Text>
            <Text style={styles.addressLine}>Kira Division, Uganda</Text>
            <Text style={styles.addressLine}>Tel: 0705555498 / 0776 210570</Text>
            <Text style={styles.addressLine}>Email: info@richmondltd.ug</Text>
          </View>
        </View>

        {/* Report Title */}
        <Text style={styles.title}>
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </Text>

        {/* Recipient Information */}
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientLabel}>To:</Text>
          <View style={styles.recipientDetails}>
            <Text>Nakaziba Christine</Text>
            <Text>Marketing Manager</Text>
            <Text>Richmond Manufacturer's Ltd</Text>
          </View>
        </View>

        {/* Date Range */}
        <Text style={styles.dateRange}>
          Report Period: {startDate && endDate
            ? `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(
                new Date(endDate),
                "MMM dd, yyyy"
              )}`
            : "All Time"}
        </Text>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {getTableHeaders().map((header, index) => (
              <Text key={index} style={[styles.tableCell, styles.tableHeader, { flex: 1 }]}>
                {header}
              </Text>
            ))}
          </View>
          {getTableData().map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.tableRow, { backgroundColor: rowIndex % 2 ? "#f8f9fa" : "#ffffff" }]}
            >
              {row.map((cell, cellIndex) => (
                <Text key={cellIndex} style={[styles.tableCell, { flex: 1 }]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Report Summary</Text>
          <Text>
            Total Amount: {totals.total.toLocaleString("en-UG", { style: "currency", currency: "UGX" })}
          </Text>
          <Text>Total Records: {totals.count}</Text>
          {reportType === "debts" && (
            <>
              <Text>Paid Records: {totals.paid}</Text>
              <Text>Pending Records: {totals.pending}</Text>
            </>
          )}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureText}>Prepared by:</Text>
            <Image src={signature} style={styles.signatureImage} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Shadia Nakitto</Text>
            <Text style={styles.signatureText}>Finance Officer</Text>
            <Text style={styles.signatureText}>shadia@richmondltd.ug</Text>
            <Text style={styles.signatureText}>Date: {format(new Date(), "MMM dd, yyyy")}</Text>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureText}>Received by:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Nakaziba Christine</Text>
            <Text style={styles.signatureText}>Marketing Manager</Text>
            <Text style={styles.signatureText}>Date: _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Richmond Manufacturer's Ltd | Confidential Business Report | Generated on {format(new Date(), "MMM dd, yyyy 'at' HH:mm")}
        </Text>
      </Page>
    </Document>
  );
};

const ReportPDF = ({ reportType, data, totals, products, startDate, endDate }) => {
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
      fileName={`${reportType}-report-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          disabled={loading}
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">
            {loading ? "Generating PDF..." : "Export Professional Report"}
          </span>
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ReportPDF;