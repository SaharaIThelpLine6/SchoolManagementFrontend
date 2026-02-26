import React, { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { hideModal, showModal } from "../../../utils/ModalControlar";
import useTranslate from "../../../utils/Translate";
import DefaultInput from "../../../components/Forms/DefaultInput";
import Button from "../../../components/Button/Button";

const SMSBuy = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset } = methods;

    const handlePaymentGetwayOpenModal = useCallback(() => {
    showModal(translate("Payment Getway"), "PAYMENT_GETWAY");
  }, []);

  const onSubmit = async (data) => {

    handlePaymentGetwayOpenModal()
    // try {
    //   if (userId)
    //     Swal.fire({
    //       title: translate("Designation created successfully!"),
    //       icon: "success",
    //     });
    //   hideModal();
    // } catch (error) {
    //   Swal.fire({
    //     icon: "error",
    //     title: translate("Failed to save designation"),
    //     confirmButtonColor: "#3B82F6",
    //   });
    // }
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="font-lato p-6 max-w-md mx-auto"
      >
        {/* Form Header */}
        <div className="mb-6 text-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {translate("SMS purchase form")}
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            {translate(
              "Please enter the amount of SMS you would like to receive below."
            )}
          </p>
        </div>

        {/* Amount Input Field */}
        <div className="mb-6">
          <DefaultInput
            registerKey="amount"
            require={translate("The amount of money must be paid.")}
            type="number"
            placeholder={translate("Enter the amount of money (eg: 500).")}
            label="Amount of Taka"
            inputMode="numeric"
            className="text-right" // For right-aligned numbers
          />
          <p className="text-xs text-gray-500 mt-1">
            {translate("SMS can be purchased from a minimum of 500 Taka.")}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            className="w-full py-2 font-medium rounded-md shadow-sm transition-colors"
          >
            {translate("Pay Now")}
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center text-sm text-gray-500 border-t pt-4">
          <p>{translate("SMS can be purchased from a minimum of 500 Taka.")}</p>
          <p className="mt-1">
            {translate(
              "SMS Rate: 0.38 Taka per SMS Approximately 1316 SMS can be sent for 500 Taka"
            )}
          </p>
        </div>
      </form>
    </FormProvider>
  );
};

export default SMSBuy;
