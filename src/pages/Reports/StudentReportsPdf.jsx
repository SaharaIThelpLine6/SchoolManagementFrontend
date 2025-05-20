import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import banglaFont from "../../assets/font/kalpurush/kalpurush-v0.256.ttf";
import school_logo from "../../../public/saharait.png";
import { useLocation } from "react-router-dom";
import bnBijoy2Unicode from "../../utils/conveter"; // Adjust the path as needed

// Using fallback fonts approach
// 1. Register normal font with fallback options
Font.register({
  family: "Bengali",
  fonts: [{ src: banglaFont }],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Bengali", // Using our registered font family name
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
  },
  headerTextContainer: {
    marginLeft: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  address: {
    fontSize: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  phone: {
    fontSize: 10,
    fontWeight: "bold",
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    padding: 5,
    border: "1px solid black",
  },
  studentInfo: {
    flexDirection: "row",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottom: "1px solid black",
    paddingBottom: 5,
  },
  studentInfoItem: {
    flex: 1,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    backgroundColor: "#f0f0f0",
  },
  tableColumn1: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableColumn2: {
    width: "25%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableColumn3: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableColumn4: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableColumn5: {
    width: "30%",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableHeaderCell: {
    padding: 5,
    fontWeight: "bold",
    fontSize: 10,
    textAlign: "center",
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "left",
  },
  highlightedRow: {
    backgroundColor: "#e6f2ff",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureContainer: {
    width: "30%",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  noDataMessage: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 14,
    fontWeight: "bold",
  },
});

// Print Page component that uses useLocation and renders the PDF
const StudentReportPrintPage = () => {
  const location = useLocation();
  const reportData = location?.state?.reportData;

  console.log("Report data received:", reportData);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <StudentReportsPdf reportData={reportData} />
      </PDFViewer>
    </div>
  );
};

// StudentReport PDF Document Component
const StudentReportsPdf = ({ reportData }) => {
  // Process the data to ensure it's in the correct format for rendering
  const processedReports = Array.isArray(reportData) ? reportData : [];
  
  // Extract student info from the first report (if available)
  const studentInfo = processedReports.length > 0 ? {
    studentCode: processedReports[0].StudentCode || "",
    studentName: processedReports[0].StudentName ? bnBijoy2Unicode(processedReports[0].StudentName) : "",
  } : { studentCode: "", studentName: "" };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with school info */}
        <View style={styles.header}>
          <View>
            <Image style={styles.logo} src={school_logo} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>টেস্ট মাদরাসা ১১০০০</Text>
            <Text style={styles.address}>
              সরকারি বাঙ্গলা কলেজ রোড, রাশিদ, টাঙ্গাইল
            </Text>
            <Text style={styles.phone}>০১৭১-৯২৫৫৬৬</Text>
          </View>
        </View>

        {/* Report Title */}
        <View style={styles.reportTitle}>
          <Text>শিক্ষার্থীর তথ্য ভান্ডার চারিত্রিক রিপোর্ট</Text>
        </View>

        {/* Student Info (if available) */}
        {studentInfo.studentCode && (
          <View style={styles.studentInfo}>
            <View style={styles.studentInfoItem}>
              <Text>কোড : {studentInfo.studentCode}</Text>
            </View>
            <View style={styles.studentInfoItem}>
              <Text>নাম : {studentInfo.studentName}</Text>
            </View>
          </View>
        )}

        {/* Reports Table */}
        {processedReports.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableColumn1}>
                <Text style={styles.tableHeaderCell}>ক্রমিক</Text>
              </View>
              <View style={styles.tableColumn2}>
                <Text style={styles.tableHeaderCell}>রিপোর্ট ধরণ</Text>
              </View>
              <View style={styles.tableColumn3}>
                <Text style={styles.tableHeaderCell}>তারিখ</Text>
              </View>
              <View style={styles.tableColumn4}>
                <Text style={styles.tableHeaderCell}>রিপোর্ট বিষয়</Text>
              </View>
              <View style={styles.tableColumn5}>
                <Text style={styles.tableHeaderCell}>মন্তব্য</Text>
              </View>
            </View>

            {/* Table Rows */}
            {processedReports.map((report, index) => {
              // Get date from either CreateDate or dataValues.CreateDate
              const date = report.dataValues?.CreateDate || report.CreateDate || "";
              
              // Get and convert report type and category
              const reportType = report.ReportType ? bnBijoy2Unicode(report.ReportType) : "";
              const reportCet = report.ReportCet ? bnBijoy2Unicode(report.ReportCet) : "";
              
              // Get and convert remark
              const remark = report.dataValues?.Remark || report.Remark || "";
              const convertedRemark = remark ? bnBijoy2Unicode(remark) : "";

              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.highlightedRow : {},
                  ]}
                >
                  <View style={styles.tableColumn1}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  <View style={styles.tableColumn2}>
                    <Text style={styles.tableCell}>{reportType}</Text>
                  </View>
                  <View style={styles.tableColumn3}>
                    <Text style={styles.tableCell}>{date}</Text>
                  </View>
                  <View style={styles.tableColumn4}>
                    <Text style={styles.tableCell}>{reportCet}</Text>
                  </View>
                  <View style={styles.tableColumn5}>
                    <Text style={styles.tableCell}>{convertedRemark || "-"}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.noDataMessage}>
            <Text>কোন রিপোর্ট ডাটা পাওয়া যায়নি।</Text>
          </View>
        )}

        {/* Footer with signatures */}
        <View style={styles.footer}>
          {/* Teacher's Signature */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>শিক্ষক স্বাক্ষর</Text>
          </View>

          {/* Date/Stamp Section (optional middle section) */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>তারিখ</Text>
          </View>

          {/* Principal's Signature */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>অধ্যক্ষ স্বাক্ষর</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Create a PDF Download component
const StudentReportDownloadLink = ({
  reportData,
  fileName = "student-report.pdf",
}) => {
  return (
    <PDFDownloadLink
      document={<StudentReportsPdf reportData={reportData} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) =>
        loading ? "ডাউনলোড হচ্ছে..." : "রিপোর্ট ডাউনলোড করুন"
      }
    </PDFDownloadLink>
  );
};

// Export components
export { StudentReportsPdf, StudentReportPrintPage, StudentReportDownloadLink };
export default StudentReportPrintPage;