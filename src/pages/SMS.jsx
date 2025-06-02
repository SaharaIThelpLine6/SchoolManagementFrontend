import { useDispatch } from "react-redux";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import ParentsAndAllUserTable from "../view/general-information/sms/ParentsAndAllUserTable";
import { useCallback, useState } from "react";
import OthersTable from "../view/general-information/sms/OthersTable";
import { showModal } from "../utils/ModalControlar";

const SMS = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [selectedRecipient, setSelectedRecipient] = useState("");

  const options = [
    { label: "Single", value: "single" },
    { label: "Parents", value: "guardian" },
    { label: "All Users", value: "all_users" },
    { label: "Others", value: "others" },
  ];

  const handleOpenModal = useCallback(() => {
    showModal(translate("SMS Templates"), "SMS_TEMPLATES");
  }, []);
  const handleSMSBuyOpenModal = useCallback(() => {
    showModal(translate("SMS Buy"), "SMS_BUY");
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 p-4 gap-10 sm:gap-3 font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg">
      <div className="rounded-lg bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 pb-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
            {translate("SMS Sending Form")}
          </h2>
          <div className="flex justify-end items-center">
            <Button className="" onClick={handleSMSBuyOpenModal}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {/* Mobile Number Input */}
          <Input
            label={translate("Mobile Number")}
            placeholder={translate("Enter mobile number")}
            type="tel"
            name="mobile"
          />
          {/* Radio Buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              {translate("Message Type")}
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="messageType"
                  value="bangla"
                  className="accent-custom-focus text-gray-700"
                />
                {translate("Bangla")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="messageType"
                  value="english"
                  className="accent-custom-focus text-gray-700"
                />
                {translate("English")}
              </label>
            </div>
          </div>
          <div className="col-span-2">
            <Button className="w-full" onClick={handleOpenModal}>
              {translate("Message Template")}
            </Button>
          </div>
          {/* Textarea Field */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm font-medium text-gray-700">{translate("Message")}</label>
            <textarea
              name="message"
              placeholder={translate("Enter your message")}
              rows={4}
              className="p-2 w-full rounded border-[1.5px] h-[100px] text-black outline-none text-[14px] transition border-stroke focus:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
            />
          </div>
          <div className="space-y-3 col-span-2 text-center">
            {/* Character/SMS Info */}
            <div className="text-gray-700">
              <p className="text-sm 2xl:text-base font-normal">
                {translate("765")} <span className="text-gray-500">{translate("Characters left")}</span>
              </p>
              <p className="text-sm 2xl:text-base font-normal">
                {translate("1 SMS")} <span className="text-gray-500">({translate("70 Char/SMS")})</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button className="bg-green-500 hover:bg-green-600 transition-colors">
                {translate("Send SMS")}
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 transition-colors">
                {translate("Reset SMS")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {["guardian", "all_users"].includes(selectedRecipient) && (
        <ParentsAndAllUserTable
          pageTitle={pageTitle}
          checkedValue={selectedRecipient}
        />
      )}
      {["others"].includes(selectedRecipient) && (
        <OthersTable pageTitle={pageTitle} checkedValue={selectedRecipient} />
      )}
    </div>
  );
};

export default SMS;
