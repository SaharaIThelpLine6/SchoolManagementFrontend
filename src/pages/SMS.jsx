import { useDispatch, useSelector } from "react-redux";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import ParentsAndAllUserTable from "../view/general-information/sms/ParentsAndAllUserTable";
import OthersTable from "../view/general-information/sms/OthersTable";
import { showModal } from "../utils/ModalControlar";
import { useCallback, useState } from "react";
import { usePostSMSSendMutation } from "../features/sms/smsSlice";
import { FormProvider, useForm } from "react-hook-form";

const SMS = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

  const { handleSubmit } = methods;

  const [selectedRecipient, setSelectedRecipient] = useState("single");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("bangla");
  const [errorMessage, setErrorMessage] = useState("");

  const [mobileNumbers, setMobileNumbers] = useState([""]);
const filteredNumbers = mobileNumbers.filter(num => num.trim() !== "");
  console.log(filteredNumbers);

  const options = [
    { label: "Single", value: "single" },
    { label: "Parents", value: "guardian" },
    { label: "All Users", value: "all_users" },
    { label: "Others", value: "others" },
  ];

  const [sendSMS, { isLoading, isError }] = usePostSMSSendMutation();

  const handleOpenModal = useCallback(() => {
    showModal(translate("SMS Templates"), "SMS_TEMPLATES");
  }, []);

  const handleSMSBuyOpenModal = useCallback(() => {
    showModal(translate("SMS Buy"), "SMS_BUY");
  }, []);


  const validateMobileNumber = (number) => {
    if (!number) return "";

    // Check if it's exactly 11 digits
    if (number.length !== 11) {
      return translate("Mobile number must be 11 digits");
    }

    // Check valid Bangladeshi prefixes
    const validPrefixes = ["013", "014", "015", "016", "017", "018", "019"];
    const prefix = number.substring(0, 3);

    if (!validPrefixes.includes(prefix)) {
      return translate(
        "Invalid mobile number. Must start with 013, 014, 015, 016, 017, 018, or 019"
      );
    }

    return "";
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 11);
    setMobileNumber(value);
    setMobileError(validateMobileNumber(value));
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;

    if (val.length > 765) return; // Enforce max character limit

    const isBangla = /^[\u0980-\u09FF\s.,!?()'"“”‘’\-০-৯\n\r\t]*$/;
    const isEnglish = /^[A-Za-z0-9\s.,!?()'"“”‘’\-`\n\r\t]*$/;

    if (val === "") {
      setMessage(val);
      setErrorMessage("");
    } else if (messageType === "bangla" && isBangla.test(val)) {
      setMessage(val);
      setErrorMessage("");
    } else if (messageType === "english" && isEnglish.test(val)) {
      setMessage(val);
      setErrorMessage("");
    } else {
      setErrorMessage(
        messageType === "bangla"
          ? translate("Write only in Bengali.")
          : translate("Write only in English.")
      );
    }
  };

  const getSMSInfo = (text) => {
    const len = text.length;
    if (len === 0) return { charCount: 0, smsCount: 0 };

    const firstSMS = 70;
    const nextSMS = 67;

    if (len <= firstSMS) return { charCount: len, smsCount: 1 };

    const remaining = len - firstSMS;
    const extraSMS = Math.ceil(remaining / nextSMS);

    return { charCount: len, smsCount: 1 + extraSMS };
  };

  const { charCount, smsCount } = getSMSInfo(message);

  const onSubmit = () => {
    // Prepare the payload with only mobile number and message
    const payload = {
      mobile: mobileNumber,
      message: message,
      messageType: messageType,
    };

    console.log(payload);

    // Call the mutation with the payload
    // sendSMS(payload)
    //   .unwrap()
    //   .then((response) => {
    //     // Handle successful submission
    //     console.log("SMS sent successfully:", response);
    //     // You might want to show a success message to the user
    //   })
    //   .catch((error) => {
    //     // Handle error
    //     console.error("Failed to send SMS:", error);
    //     // You might want to show an error message to the user
    //   });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 p-4 gap-10 sm:gap-3 font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg">
      <div className="rounded-lg bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 pb-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
            {translate("SMS Sending Form")}
          </h2>
          <div className="flex justify-end items-center">
            <Button onClick={handleSMSBuyOpenModal}>
              {translate("Buy SMS")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-2 space-x-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300"
            >
              <input
                type="radio"
                name="messageRecipient"
                value={option.value}
                checked={selectedRecipient === option.value}
                onChange={() => setSelectedRecipient(option.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm 2xl:text-base font-semibold 2xl:font-bold text-gray-700">
                {translate(option.label)}
              </span>
            </label>
          ))}
        </div>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1">
                <Input
                  label={translate("Mobile Number") + " :"}
                  placeholder={translate("Enter mobile number")}
                  type="tel"
                  name="mobile"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  disabled={selectedRecipient !== "single"}
                  error={mobileError}
                />
              </div>

              {/* Message Type */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {translate("Message Type") + " :"}
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="messageType"
                      value="bangla"
                      checked={messageType === "bangla"}
                      onChange={() => {
                        setMessageType("bangla");
                        setMessage("");
                        setErrorMessage("");
                      }}
                      className="accent-custom-focus text-gray-700"
                    />
                    {translate("Bangla")}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="messageType"
                      value="english"
                      checked={messageType === "english"}
                      onChange={() => {
                        setMessageType("english");
                        setMessage("");
                        setErrorMessage("");
                      }}
                      className="accent-custom-focus text-gray-700"
                    />
                    {translate("English")}
                  </label>
                </div>
              </div>

              {/* Message Template */}
              <div className="col-span-2">
                <Button className="w-full" onClick={handleOpenModal}>
                  {translate("Message Template")}
                </Button>
              </div>

              {/* Message Textarea */}
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  {translate("Message") + " :"}
                </label>
                <textarea
                  name="message"
                  placeholder={translate("Enter your message")}
                  rows={4}
                  value={message}
                  onChange={handleMessageChange}
                  className="p-2 w-full rounded border-[1.5px] h-[100px] text-black outline-none text-[14px] transition border-stroke focus:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}
              </div>

              {/* Character/SMS Counter */}
              <div className="space-y-3 col-span-2 text-center">
                <div className="text-gray-700 text-sm 2xl:text-base font-normal">
                  <p
                    className={charCount >= 765 ? "text-red-600 font-bold" : ""}
                  >
                    {charCount}/765 {translate("Characters typed")}
                  </p>

                  <p>
                    {smsCount} {translate("SMS")} ({translate("70 Char/SMS")},{" "}
                    {translate("next SMS from 67 chars")})
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600 transition-colors"
                    disabled={
                      !!mobileError ||
                      (selectedRecipient === "single" && !mobileNumber) ||
                      !message
                    }
                    type="submit"
                    loading={isLoading}
                  >
                    {translate("Send SMS")}
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 transition-colors"
                    onClick={() => {
                      setMessage("");
                      setErrorMessage("");
                      setMobileNumber("");
                      setMobileError("");
                    }}
                  >
                    {translate("Reset SMS")}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      {["guardian", "all_users"].includes(selectedRecipient) && (
        <ParentsAndAllUserTable
          pageTitle={pageTitle}
          checkedValue={selectedRecipient}
        />
      )}
      {["others"].includes(selectedRecipient) && (
        <OthersTable
          pageTitle={pageTitle}
          setMobileNumbers={setMobileNumbers}
          mobileNumbers={mobileNumbers}
        />
      )}
    </div>
  );
};

export default SMS;
