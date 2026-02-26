import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../../../components/Button/Button";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { showModal } from "../../../utils/ModalControlar";
import useTranslate from "../../../utils/Translate";

// Mobile Banking Logos
const nagadLogo = "/banking/Nagad.png";
const rocketLogo = "/banking/Rocket.jpg";
const bkashLogo = "/banking/BKash.png";

// Net Banking Logos
const alArafaIslamicLogo = "/banking/al_islami_bank.jpg";
const dutchBanglaLogo = "/banking/Dutch-bangla-bank.png";
const asiaBankLogo = "/banking/asia-bank.jpg";
const janataBankLogo = "/banking/janata-bank.jpg";

// Card Logos
const visaLogo = "/banking/visa card.webp";
const masterLogo = "/banking/master-card.png";
const dbblLogo = "/banking/dBBL-card.jpeg";


const PaymentGetway = () => {
  const translate = useTranslate();
  const methods = useForm();
  const [activeTab, setActiveTab] = useState("Mobile");
  const [selectedMethod, setSelectedMethod] = useState({
    type: "Mobile",
    name: "bKash",
    account: "01822930055",
  });

  // Payment methods data
  const paymentMethods = {
    Mobile: [
      { name: "bKash", logo: bkashLogo, account: "01822930055" },
      { name: "Rocket", logo: rocketLogo, account: "018229300554" },
      { name: "Nagad", logo: nagadLogo, account: "01822930055" },
    ],
    "Net Banking": [
      { name: "Al-Arafah Islami Bank", logo: alArafaIslamicLogo },
      { name: "Dutch Bangla Bank", logo: dutchBanglaLogo },
      { name: "Asia Bank", logo: asiaBankLogo },
      { name: "Janata Bank", logo: janataBankLogo },
    ],
    Cards: [
      { name: "Visa", logo: visaLogo },
      { name: "MasterCard", logo: masterLogo },
      { name: "DBBL Card", logo: dbblLogo },
    ],
    Login: [
      { name: "Bank Login", logo: "" }, // Add appropriate logo if available
    ],
  };

  // Instruction texts for different methods
  const instructions = {
    Mobile: `টাকা ${selectedMethod.account} নম্বরে ${selectedMethod.name} সেন্ড মানি করুন। ফি সহ মেসেজ হতে Trxid নিয়ে
    (Trxid/Varify Code/Chack Number) এ প্রদান করে <strong>Send</strong> বাটনে ক্লিক করুন।
    দ্রঃ উক্ত নম্বরে টাকাই সেন্ড মানি করতে হবে। অন্যথায় রিকোয়েস্ট গ্রহণ করা হবে না।`,
    "Net Banking":
      "লগইন করে আপনার নেট ব্যাংকিং অ্যাকাউন্ট থেকে পেমেন্ট সম্পন্ন করুন।",
    Cards: "আপনার ক্রেডিট/ডেবিট কার্ডের তথ্য প্রদান করে পেমেন্ট সম্পন্ন করুন।",
    Login: "ব্যাংক অ্যাকাউন্টে লগইন করে পেমেন্ট সম্পন্ন করুন।",
  };

  const handlePaymentGetwayOpenModal = useCallback(() => {
    showModal(translate("Payment Getway"), "PAYMENT_GETWAY");
  }, []);

  const onSubmit = async (data) => {
    handlePaymentGetwayOpenModal();
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="font-lato p-4 max-w-lg mx-auto bg-white border shadow-md rounded"
      >
        {/* Top Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.keys(paymentMethods).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-center py-2 border rounded ${
                activeTab === tab
                  ? "bg-green-200 border-green-500"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {translate(tab)}
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-wrap justify-around mb-4 gap-2">
          {paymentMethods[activeTab].map((method, idx) => (
            <div
              key={idx}
              onClick={() => handleMethodSelect({ ...method, type: activeTab })}
              className={`relative p-2 rounded cursor-pointer ${
                selectedMethod.name === method.name &&
                selectedMethod.type === activeTab
                  ? "bg-green-50 border border-green-300"
                  : "hover:bg-gray-50"
              }`}
            >
              <img
                src={method.logo}
                alt={method.name}
                className="w-20 h-10 object-contain mx-auto"
              />
              {selectedMethod.name === method.name &&
                selectedMethod.type === activeTab && (
                  <span className="absolute top-0 right-0 bg-green-500 w-4 h-4 rounded-full border border-white"></span>
                )}
            </div>
          ))}
        </div>

        {/* Instruction Text */}
        {selectedMethod && (
          <div
            className="bg-gray-100 p-3 rounded text-sm leading-relaxed mb-4 text-justify"
            dangerouslySetInnerHTML={{ __html: instructions[activeTab] }}
          />
        )}

        {/* Account Number Display (for Mobile Banking) */}
        {activeTab === "Mobile" && selectedMethod.account && (
          <div className="bg-blue-50 p-3 rounded mb-4 text-center font-medium">
            Account: {selectedMethod.account}
          </div>
        )}

        {/* Input Field (changes based on active tab) */}
        <div className="mb-4">
          <DefaultInput
            registerKey={
              activeTab === "Mobile"
                ? "trxid"
                : activeTab === "Cards"
                ? "cardDetails"
                : "loginDetails"
            }
            require={translate("This field is required")}
            placeholder={
              activeTab === "Mobile"
                ? translate("Trxid/Varify Code/Chack Number")
                : activeTab === "Cards"
                ? translate("Card Number, CVV, etc.")
                : translate("Login credentials")
            }
            label={
              activeTab === "Mobile"
                ? translate("Trxid/Varify Code/Chack Number")
                : activeTab === "Cards"
                ? translate("Card Details")
                : translate("Login Information")
            }
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button type="submit" className="w-full text-xl font-semibold">
            {activeTab === "Mobile" ? translate("Send") : translate("Pay Now")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PaymentGetway;
