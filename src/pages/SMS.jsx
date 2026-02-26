import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import ParentsAndAllUserTable from '../view/general-information/sms/ParentsAndAllUserTable';
import OthersTable from '../view/general-information/sms/OthersTable';
import { showModal } from '../utils/ModalControlar';
import {
  useGetCheckBalanceQuery,
  usePostSMSSendMutation,
} from '../features/sms/smsSlice';
import {
  clearAllUsersData,
  clearParentsData,
} from '../features/student/studentSlice';
import AllUsersData from '../view/general-information/sms/AllUsersData';
import Swal from 'sweetalert2';
import {
  clearSmsTemplate,
  clearSuccessAndErrorMessage,
  setSuccessAndErrorMessage,
} from '../features/sms/smsReducersSlice';

const SMS = ({ pageTitle }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit } = methods;
  const dispatch = useDispatch();

  const { allUsers, parentsData } = useSelector((state) => state.student);
  const smsTemplateData = useSelector(
    (state) => state.smsSuccessError.smsTemplate
  );
  const { isOpen, id } = useSelector((state) => state.modal);

  const { data: checkBalanceData } = useGetCheckBalanceQuery();

  const parentsNumbers = parentsData.map((student) => student.Mobile1);
  const allUserNumbers = allUsers.map((student) => student.Mobile1);

  const [selectedRecipient, setSelectedRecipient] = useState('single');
  const [mobileNumbers, setMobileNumbers] = useState(['']);
  const [othersMobileNumbers, setOthersMobileNumbers] = useState(['']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('bangla');
  const [mobileError, setMobileError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredOthersNumbers = othersMobileNumbers.filter(
    (num) => num.trim() !== ''
  );

  useEffect(() => {
    if (smsTemplateData) {
      setMessage(smsTemplateData);
    }
  }, [smsTemplateData]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(clearSuccessAndErrorMessage());
    }
  }, [isOpen]);

  const [sendSMS] = usePostSMSSendMutation();

  const options = [
    { label: 'Single', value: 'single' },
    { label: 'Parents', value: 'guardian' },
    { label: 'All Users', value: 'all_users' },
    { label: 'Others', value: 'others' },
  ];

  const handleOpenModal = useCallback(() => {
    showModal(translate('SMS Templates'), 'SMS_TEMPLATES');
  }, [translate]);

  const handleSMSBuyOpenModal = useCallback(() => {
    showModal(translate('SMS Buy'), 'SMS_BUY');
  }, [translate]);

  const handleSuccessAndErrorOpenModal = useCallback(() => {
    showModal(translate('Success and Error'), 'SUCCESSANDERROR');
  }, [translate]);

  const validateMobileNumber = (number) => {
    if (!number) return '';
    if (number.length !== 11)
      return translate('Mobile number must be 11 digits');

    const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
    if (!validPrefixes.includes(number.substring(0, 3))) {
      return translate(
        'Invalid mobile number. Must start with 013, 014, 015, 016, 017, 018, or 019'
      );
    }
    return '';
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 11);
    setMobileNumbers([value]);
    setMobileError(validateMobileNumber(value));
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    if (val.length > 1000) return; // limit to avoid overflow
    setMessage(val);
    setErrorMessage('');
  };

  const handleChangeMessageReci = (value) => {
    setSelectedRecipient(value);
    setMobileNumbers(['']);
    dispatch(clearParentsData());
    dispatch(clearAllUsersData());
    dispatch(clearSmsTemplate());
  };

  // ✅ Correct SMS Count Calculation Function
  const getSMSInfo = (text, type) => {
    const len = text.length;
    if (len === 0) return { charCount: 0, smsCount: 0 };

    // Bangla Message Logic
    if (type === 'bangla') {
      const firstSMS = 70;
      const nextSMS = 67;
      if (len <= firstSMS) return { charCount: len, smsCount: 1 };
      return {
        charCount: len,
        smsCount: 1 + Math.ceil((len - firstSMS) / nextSMS),
      };
    }

    // English Message Logic
    if (type === 'english') {
      const firstSMS = 160;
      const nextSMS = 153;
      if (len <= firstSMS) return { charCount: len, smsCount: 1 };
      return {
        charCount: len,
        smsCount: 1 + Math.ceil((len - firstSMS) / nextSMS),
      };
    }

    return { charCount: len, smsCount: 1 };
  };

  const { charCount, smsCount } = getSMSInfo(message, messageType);

  const onSubmit = async () => {
    let receivers = [];

    if (selectedRecipient === 'others') {
      receivers = filteredOthersNumbers;
    } else if (selectedRecipient === 'single') {
      receivers = mobileNumbers;
    } else if (selectedRecipient === 'guardian') {
      receivers = parentsNumbers;
    } else if (selectedRecipient === 'all_users') {
      receivers = allUserNumbers;
    }

    if (!receivers.length || !message?.trim()) {
      setErrorMessage(translate('Please provide all required information'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await sendSMS({
        receiver: receivers,
        message: message.trim(),
      }).unwrap();

      dispatch(clearParentsData());
      dispatch(clearAllUsersData());
      dispatch(clearSmsTemplate());
      dispatch(setSuccessAndErrorMessage(response.results));
      handleSuccessAndErrorOpenModal();

      setMessage('');
      setMobileNumbers(['']);
      setOthersMobileNumbers(['']);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      setErrorMessage(translate('Failed to send SMS. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sm:gap-3 font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {translate('Send single and multiple SMS')}
        </h2>
        <div className="flex flex-row justify-center sm:justify-end items-end md:items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {translate('Balance') + ' :'}
          </h2>
          <div className="flex gap-3 text-sm md:text-base text-gray-700 font-medium">
            <h3>mask: {checkBalanceData?.mask}</h3>
            <h3>nonmask: {checkBalanceData?.nonmask}</h3>
            {/* <h3>voice: {checkBalanceData?.voice}</h3> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 p-4 gap-10">
        <div className="rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-2 pb-3">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">
              {translate('SMS Sending Form')}
            </h2>
            <div className="flex justify-end items-center">
              <Button onClick={handleSMSBuyOpenModal}>
                {translate('Buy SMS')}
              </Button>
            </div>
          </div>

          {/* Recipient Selection */}
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
                  onChange={() => handleChangeMessageReci(option.value)}
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
                {/* Mobile Input */}
                <div className="flex flex-col gap-1">
                  <Input
                    label="Mobile Number"
                    placeholder={translate('Enter mobile number')}
                    type="tel"
                    name="mobile"
                    value={mobileNumbers[0] || ''}
                    onChange={handleMobileChange}
                    disabled={selectedRecipient !== 'single'}
                    error={mobileError}
                  />
                </div>

                {/* Message Type */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {`${translate('Message Type')} :`}
                  </span>
                  <div className="flex items-center gap-4">
                    {['bangla', 'english'].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="messageType"
                          value={type}
                          checked={messageType === type}
                          onChange={() => {
                            setMessageType(type);
                            setMessage('');
                            setErrorMessage('');
                          }}
                          className="accent-custom-focus text-gray-700"
                        />
                        {translate(
                          type.charAt(0).toUpperCase() + type.slice(1)
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message Template */}
                <div className="col-span-2">
                  <Button
                    className="w-full"
                    onClick={handleOpenModal}
                    type="button"
                  >
                    {translate('Message Template')}
                  </Button>
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    {`${translate('Message')} :`}
                  </label>
                  <textarea
                    name="message"
                    placeholder={translate('Enter your message')}
                    rows={4}
                    value={message}
                    onChange={handleMessageChange}
                    className="p-2 w-full rounded border-[1.5px] h-[100px] text-black outline-none text-[14px] transition border-stroke focus:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                  />
                </div>

                {/* Character/SMS Counter */}
                <div className="space-y-3 col-span-2 text-center">
                  <div className="text-gray-700 text-sm 2xl:text-base font-normal">
                    <p
                      className={
                        charCount >= 765 ? 'text-red-600 font-bold' : ''
                      }
                    >
                      {charCount}/765 {translate('Characters typed')}
                    </p>
                    <p>
                      {smsCount} {translate('SMS')} (
                      {messageType === 'bangla'
                        ? `${translate('70 Char/SMS')}, ${translate(
                            'next SMS from 67 chars'
                          )}`
                        : `${translate('160 Char/SMS')}, ${translate(
                            'next SMS from 153 chars'
                          )}`}
                      )
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-500 hover:bg-green-600 transition-colors"
                      disabled={
                        !!mobileError ||
                        (selectedRecipient === 'single' && !mobileNumbers[0]) ||
                        !message ||
                        isLoading
                      }
                      type="submit"
                      loading={isLoading}
                    >
                      {translate('Send SMS')}
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 transition-colors"
                      onClick={() => {
                        setMessage('');
                        setErrorMessage('');
                        setMobileNumbers(['']);
                        setOthersMobileNumbers(['']);
                        setMobileError('');
                      }}
                      type="button"
                    >
                      {translate('Reset SMS')}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Tables */}
        {['guardian'].includes(selectedRecipient) && (
          <ParentsAndAllUserTable
            pageTitle={pageTitle}
            checkedValue={selectedRecipient}
          />
        )}
        {['all_users'].includes(selectedRecipient) && (
          <AllUsersData pageTitle={pageTitle} />
        )}
        {selectedRecipient === 'others' && (
          <OthersTable
            pageTitle={pageTitle}
            setMobileNumbers={setOthersMobileNumbers}
            mobileNumbers={othersMobileNumbers}
          />
        )}
      </div>
    </div>
  );
};

export default SMS;

// import { useState, useCallback, useMemo, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FormProvider, useForm } from "react-hook-form";
// import useTranslate from "../utils/Translate";
// import Button from "../components/Button/Button";
// import Input from "../components/Input/Input";
// import ParentsAndAllUserTable from "../view/general-information/sms/ParentsAndAllUserTable";
// import OthersTable from "../view/general-information/sms/OthersTable";
// import { showModal } from "../utils/ModalControlar";
// import { useGetCheckBalanceQuery, usePostSMSSendMutation } from "../features/sms/smsSlice";
// import {
//   clearAllUsersData,
//   clearParentsData,
// } from "../features/student/studentSlice";
// import AllUsersData from "../view/general-information/sms/AllUsersData";
// import Swal from "sweetalert2";
// import {
//   clearSmsTemplate,
//   clearSuccessAndErrorMessage,
//   setSuccessAndErrorMessage,
// } from "../features/sms/smsReducersSlice";

// const SMS = ({ pageTitle }) => {
//   const translate = useTranslate();
//   const methods = useForm();
//   const { handleSubmit } = methods;
//   const dispatch = useDispatch();

//   const { allUsers, parentsData } = useSelector((state) => state.student); // ✅ Access correct slice
//   const smsTemplateData = useSelector(
//     (state) => state.smsSuccessError.smsTemplate
//   );
//   const { isOpen, id } = useSelector((state) => state.modal);

//   //
//   const {data: checkBalanceData, isError, isSuccess} = useGetCheckBalanceQuery()

//   const parentsNumbers = parentsData.map((student) => student.Mobile1);
//   const allUserNumbers = allUsers.map((student) => student.Mobile1);
//   // State management
//   const [selectedRecipient, setSelectedRecipient] = useState("single");
//   const [mobileNumbers, setMobileNumbers] = useState([""]);
//   const [othersMobileNumbers, setOthersMobileNumbers] = useState([""]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("bangla");
//   const [mobileError, setMobileError] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Filter empty numbers
//   const filteredOthersNumbers = othersMobileNumbers.filter(
//     (num) => num.trim() !== ""
//   );
//   // Add useEffect to handle template selection
//   useEffect(() => {
//     if (smsTemplateData) {
//       setMessage(smsTemplateData);
//     }
//   }, [smsTemplateData]);

//   useEffect(() => {
//     if (!isOpen) {
//       dispatch(clearSuccessAndErrorMessage());
//     }
//   }, [isOpen]);

//   // API mutation
//   const [sendSMS] = usePostSMSSendMutation();

//   // Constants
//   const options = [
//     { label: "Single", value: "single" },
//     { label: "Parents", value: "guardian" },
//     { label: "All Users", value: "all_users" },
//     { label: "Others", value: "others" },
//   ];

//   // Handlers
//   const handleOpenModal = useCallback(() => {
//     showModal(translate("SMS Templates"), "SMS_TEMPLATES");
//   }, [translate]);

//   const handleSMSBuyOpenModal = useCallback(() => {
//     showModal(translate("SMS Buy"), "SMS_BUY");
//   }, [translate]);

//   // Success and error message
//   const handleSuccessAndErrorOpenModal = useCallback(() => {
//     showModal(translate("Success and Error"), "SUCCESSANDERROR");
//   }, [translate]);

//   const validateMobileNumber = (number) => {
//     if (!number) return "";
//     if (number.length !== 11)
//       return translate("Mobile number must be 11 digits");

//     const validPrefixes = ["013", "014", "015", "016", "017", "018", "019"];
//     if (!validPrefixes.includes(number.substring(0, 3))) {
//       return translate(
//         "Invalid mobile number. Must start with 013, 014, 015, 016, 017, 018, or 019"
//       );
//     }
//     return "";
//   };

//   const handleMobileChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "").substring(0, 11);
//     setMobileNumbers([value]);
//     setMobileError(validateMobileNumber(value));
//   };

//   const handleMessageChange = (e) => {
//     const val = e.target.value;

//     // Limit max characters
//     if (val.length > 765) return;

//     // Empty message handling
//     if (val === "") {
//       setMessage(val);
//       setErrorMessage("");
//       return;
//     }

//     // Default behavior (no language validation)
//     setMessage(val);
//     setErrorMessage("");
//   };

//   const handleChangeMessageReci = (value) => {
//     setSelectedRecipient(value);
//     setMobileNumbers([""]);
//     dispatch(clearParentsData());
//     dispatch(clearAllUsersData());
//     dispatch(clearSmsTemplate());
//   };

//   const getSMSInfo = (text) => {
//     const len = text.length;
//     if (len === 0) return { charCount: 0, smsCount: 0 };

//     const firstSMS = 70;
//     const nextSMS = 67;

//     if (len <= firstSMS) return { charCount: len, smsCount: 1 };

//     return {
//       charCount: len,
//       smsCount: 1 + Math.ceil((len - firstSMS) / nextSMS),
//     };
//   };

//   const { charCount, smsCount } = getSMSInfo(message);

//   const onSubmit = async () => {
//     let receivers = [];

//     if (selectedRecipient === "others") {
//       receivers = filteredOthersNumbers;
//     } else if (selectedRecipient === "single") {
//       receivers = mobileNumbers;
//     } else if (selectedRecipient === "guardian") {
//       receivers = parentsNumbers;
//     } else if (selectedRecipient === "all_users") {
//       receivers = allUserNumbers;
//     }

//     // Basic validation
//     if (!receivers.length || !message?.trim()) {
//       setErrorMessage(translate("Please provide all required information"));
//       return;
//     }

//     setIsLoading(true);
//     setErrorMessage(""); // Clear previous error

//     try {
//       const response = await sendSMS({
//         receiver: receivers,
//         message: message.trim(),
//       }).unwrap();

//       dispatch(clearParentsData());
//       dispatch(clearAllUsersData());
//       dispatch(clearSmsTemplate());
//       dispatch(setSuccessAndErrorMessage(response.results));

//       handleSuccessAndErrorOpenModal();

//       // Reset form on success
//       setMessage("");
//       setMobileNumbers([""]);
//       setOthersMobileNumbers([""]);
//     } catch (error) {
//       console.error("Failed to send SMS:", error);
//       setErrorMessage(translate("Failed to send SMS. Please try again."));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="sm:gap-3 font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg">
//         <div className="grid grid-cols-1 sm:grid-cols-2">
//           <h2 className="text-lg md:text-xl font-bold text-gray-800">
//             {translate("Send single and multiple SMS")}
//           </h2>
//           <div className="flex flex-row justify-center sm:justify-end items-end md:items-center gap-2 md:gap-4">
//             <h2 className="text-lg md:text-xl font-bold text-gray-800">
//               {translate("Balance") + " :"}
//             </h2>
//             <div className="flex gap-3 text-sm md:text-base text-gray-700 font-medium">
//               <h3>mask: {checkBalanceData?.mask}</h3>
//               <h3>nonmask:{checkBalanceData?.nonmask}</h3>
//               <h3>voice: {checkBalanceData?.voice}</h3>
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 xl:grid-cols-2 p-4 gap-10">
//           <div className="rounded-lg bg-white shadow-sm">
//             <div className="grid grid-cols-2 pb-3">
//               <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">
//                 {translate("SMS Sending Form")}
//               </h2>
//               <div className="flex justify-end items-center">
//                 <Button onClick={handleSMSBuyOpenModal}>
//                   {translate("Buy SMS")}
//                 </Button>
//               </div>
//             </div>

//             {/* Recipient Selection */}
//             <div className="grid grid-cols-2 gap-2 md:gap-3">
//               {options.map((option) => (
//                 <label
//                   key={option.value}
//                   className="flex items-center p-2 space-x-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300"
//                 >
//                   <input
//                     type="radio"
//                     name="messageRecipient"
//                     value={option.value}
//                     checked={selectedRecipient === option.value}
//                     onChange={() => handleChangeMessageReci(option.value)}
//                     className="text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <span className="text-sm 2xl:text-base font-semibold 2xl:font-bold text-gray-700">
//                     {translate(option.label)}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             <FormProvider {...methods}>
//               <form onSubmit={handleSubmit(onSubmit)}>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
//                   {/* Mobile Input */}
//                   <div className="flex flex-col gap-1">
//                     <Input
//                       label="Mobile Number"
//                       placeholder={translate("Enter mobile number")}
//                       type="tel"
//                       name="mobile"
//                       value={mobileNumbers[0] || ""}
//                       onChange={handleMobileChange}
//                       disabled={selectedRecipient !== "single"}
//                       error={mobileError}
//                     />
//                   </div>

//                   {/* Message Type */}
//                   <div className="flex flex-col gap-2">
//                     <span className="text-sm font-medium text-gray-700">
//                       {`${translate("Message Type")} :`}
//                     </span>
//                     <div className="flex items-center gap-4">
//                       {["bangla", "english"].map((type) => (
//                         <label
//                           key={type}
//                           className="flex items-center gap-2 text-sm"
//                         >
//                           <input
//                             type="radio"
//                             name="messageType"
//                             value={type}
//                             checked={messageType === type}
//                             onChange={() => {
//                               setMessageType(type);
//                               setMessage("");
//                               setErrorMessage("");
//                             }}
//                             className="accent-custom-focus text-gray-700"
//                           />
//                           {translate(
//                             type.charAt(0).toUpperCase() + type.slice(1)
//                           )}
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Message Template Button */}
//                   <div className="col-span-2">
//                     <Button
//                       className="w-full"
//                       onClick={handleOpenModal}
//                       type="button"
//                     >
//                       {translate("Message Template")}
//                     </Button>
//                   </div>

//                   {/* Message Textarea */}
//                   <div className="flex flex-col gap-1 col-span-2">
//                     <label className="text-sm font-medium text-gray-700">
//                       {`${translate("Message")} :`}
//                     </label>
//                     <textarea
//                       name="message"
//                       placeholder={translate("Enter your message")}
//                       rows={4}
//                       value={message}
//                       onChange={handleMessageChange}
//                       className="p-2 w-full rounded border-[1.5px] h-[100px] text-black outline-none text-[14px] transition border-stroke focus:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
//                     />
//                   </div>

//                   {/* Character/SMS Counter */}
//                   <div className="space-y-3 col-span-2 text-center">
//                     <div className="text-gray-700 text-sm 2xl:text-base font-normal">
//                       <p
//                         className={
//                           charCount >= 765 ? "text-red-600 font-bold" : ""
//                         }
//                       >
//                         {charCount}/765 {translate("Characters typed")}
//                       </p>
//                       <p>
//                         {smsCount} {translate("SMS")} (
//                         {translate("70 Char/SMS")},{" "}
//                         {translate("next SMS from 67 chars")})
//                       </p>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2">
//                       <Button
//                         className="bg-green-500 hover:bg-green-600 transition-colors"
//                         disabled={
//                           !!mobileError ||
//                           (selectedRecipient === "single" &&
//                             !mobileNumbers[0]) ||
//                           !message ||
//                           isLoading
//                         }
//                         type="submit"
//                         loading={isLoading}
//                       >
//                         {translate("Send SMS")}
//                       </Button>
//                       <Button
//                         className="bg-red-500 hover:bg-red-600 transition-colors"
//                         onClick={() => {
//                           setMessage("");
//                           setErrorMessage("");
//                           setMobileNumbers([""]);
//                           setOthersMobileNumbers([""]);
//                           setMobileError("");
//                         }}
//                         type="button"
//                       >
//                         {translate("Reset SMS")}
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </FormProvider>
//           </div>

//           {/* Tables for different recipient types */}
//           {["guardian"].includes(selectedRecipient) && (
//             <ParentsAndAllUserTable
//               pageTitle={pageTitle}
//               checkedValue={selectedRecipient}
//             />
//           )}
//           {["all_users"].includes(selectedRecipient) && (
//             <AllUsersData pageTitle={pageTitle} />
//           )}
//           {selectedRecipient === "others" && (
//             <OthersTable
//               pageTitle={pageTitle}
//               setMobileNumbers={setOthersMobileNumbers}
//               mobileNumbers={othersMobileNumbers}
//             />
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default SMS;
