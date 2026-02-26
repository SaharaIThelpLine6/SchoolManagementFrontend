import { useState } from "react";
import { useGetPaymentHistoryQuery } from "../features/payment/paymentSlice";
import PaymentHistoryInvoiceTable from "../view/payment/payment-history/PaymentHistoryInvoiceTable";
import PaymentHistoryInvoice from "../view/payment/payment-history/PaymentHistoryInvoice";
import Button from "../components/Button/Button";
import useTranslate from "../utils/Translate";
import Loading from "../components/Loading/Loading";
import SvgIcon from "../components/icons/SvgIcon";

const PaymentHistory = () => {
  const translate = useTranslate();
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoice, setInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Fetch data from API
  const { data: paymentData, isError, isLoading } = useGetPaymentHistoryQuery();

  const summaryItems = [
    {
      label: "INVOICES",
      count: paymentData?.length || 0,
      color: "border-blue-400",
      icon: <SvgIcon name={"FaCreditCard"} size={30} />,
      tab: "invoices",
    },
    {
      label: "SERVICES",
      count: 0,
      color: "border-green-400",
      icon: <SvgIcon name={"FaBoxOpen"} size={30} />,
      tab: "services",
    },
    {
      label: "DOMAINS",
      count: 0,
      color: "border-purple-400",
      icon: <SvgIcon name={"FaGlobe"} size={30} />,
      tab: "domains",
    },
    {
      label: "TICKETS",
      count: 0,
      color: "border-yellow-400",
      icon: <SvgIcon name={"FaTicketAlt"} size={30} />,
      tab: "tickets",
    },
  ];
  const handlePrint = () => {
    window.print();
  };
  if (isLoading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg min-h-[300px] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-white p-4 rounded-lg text-red-500 text-center py-8">
        Error loading payment history. Please try again later.
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "services":
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Services
            </h3>
          </>
        );
      case "domains":
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Domains
            </h3>
          </>
        );
      case "tickets":
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tickets
            </h3>
          </>
        );
      default: // invoices
        return (
          <>
            <div className="flex justify-between items-center print:hidden">
              {/* Title Section */}
              <div className="flex-1 bg-[#3598db] rounded-t-md">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 px-4 py-2">
                  {translate("List of Applicants")}
                </h3>
              </div>

              {/* Button Section (Only visible if invoice is true) */}
            </div>
            {invoice && (
              <div className="flex justify-end items-center mt-5 print:hidden">
                <div className="flex items-center gap-3 px-4">
                  <Button
                    onClick={() => setInvoice(false)}
                    className="bg-[#3598db] hover:bg-[#2b7dba] text-white"
                  >
                    {translate("Back")}
                  </Button>

                  <Button
                    onClick={handlePrint}
                    className="bg-[#3598db] hover:bg-[#2b7dba] text-white"
                  >
                    {translate("Print")}
                  </Button>
                </div>
              </div>
            )}

            {invoice ? (
              <PaymentHistoryInvoice data={invoiceData} />
            ) : (
              <PaymentHistoryInvoiceTable
                data={paymentData}
                setInvoice={setInvoice}
                setInvoiceData={setInvoiceData}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
        {summaryItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(item.tab)}
            className={`bg-white rounded-md shadow-sm border-t-4 ${
              item.color
            } p-4 flex flex-row justify-between items-center cursor-pointer transition-all hover:shadow-md ${
              activeTab === item.tab ? "ring-2 ring-blue-300" : ""
            }`}
          >
            <div>
              <div className="text-2xl text-gray-800 font-bold">
                {item.count}
              </div>
              <div className="text-xs text-gray-600 mt-1 tracking-wide">
                {item.label}
              </div>
            </div>
            <div>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white">{renderTabContent()}</div>
    </div>
  );
};

export default PaymentHistory;
