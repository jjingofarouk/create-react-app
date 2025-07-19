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
    padding: 30,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "2pt solid #003366",
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 10,
    color: "#333333",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  dateRange: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 20,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
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
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    padding: 8,
    color: "#333333",
  },
  summary: {
    fontSize: 10,
    color: "#333333",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
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
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>Richmond Manufacturer's Ltd</Text>
            <Text>Plot 123, Industrial Area, Kampala, Uganda</Text>
            <Text>Phone: +256 123 456 789 | Email: info@richmondltd.ug</Text>
            <Text>Prepared by: Shadia Nakitto | shadia@richmondltd.ug</Text>
          </View>
        </View>
        <Text style={styles.title}>
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </Text>
        <Text style={styles.dateRange}>
          {startDate && endDate
            ? `From: ${format(new Date(startDate), "MMM dd, yyyy")} To: ${format(
                new Date(endDate),
                "MMM dd, yyyy"
              )}`
            : "All Time"}
        </Text>
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
        <View style={styles.summary}>
          <Text>
            Total: {totals.total.toLocaleString("en-UG", { style: "currency", currency: "UGX" })} | Count: {totals.count}
            {reportType === "debts" && ` | Paid: ${totals.paid} | Pending: ${totals.pending}`}
          </Text>
        </View>
        <Text style={styles.footer}>
          Richmond Manufacturer's Ltd | Confidential Report | Generated on {format(new Date(), "MMM dd, yyyy")}
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
      fileName={`${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
          disabled={loading}
        >
          <Download className="w-5 h-5" />
          <span>{loading ? "Generating PDF..." : "Export PDF"}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ReportPDF;