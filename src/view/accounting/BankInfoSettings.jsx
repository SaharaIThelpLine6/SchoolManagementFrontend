import { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import { useDeleteBankInfoLedgerMutation, useGetPaymentTypeQuery, useGetSubLedgerQuery, usePostBankInfoLedgerMutation, usePostSubGeneralLedgerMutation, usePutBankInfoLedgerMutation } from "../../features/feeCollection/feeCollectionSlice";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import SortableTable from "../../components/Tables/SortableTable";
import DeleteButton from "../../components/Button/DeleteButton";
import EditButton from "../../components/Button/EditButton";
import useTranslate from "../../utils/Translate";

const BankInfoSettings = () => {
  const {
    data: paymentType,
    error: paymentError,
    isLoading: paymentLoading,
  } = useGetPaymentTypeQuery();
  const translate = useTranslate();
  const [postBankInfoLedger, { isLoading: isCreating }] = usePostBankInfoLedgerMutation();
  const [putBankInfoLedger, { isLoading: isUpdating }] = usePutBankInfoLedgerMutation();
  const [deleteBankInfoLedger, { isLoading: isDeleting }] = useDeleteBankInfoLedgerMutation();

  const methods = useForm({
    defaultValues: {
      FundID: 0,
      GLID: 0,
      SlName: "",
      AccountNumber: "",
      Phone1: "",
      Phone2: "",
      Address: ""
    }
  });

  const { watch, handleSubmit, setValue, register, reset } = methods;
  const [GLID] = watch(["GLID"]);
  const { data: subLedger, error: subLedgerError } = useGetSubLedgerQuery(
    GLID,
    {
      skip: !GLID,
    }
  );

  const [editingRow, setEditingRow] = useState(null);

  const handleEdit = (row) => {
    setEditingRow(row);
    // load values into form
    setValue("FundID", row.FundID);
    setValue("GLID", row.GLID);
    setValue("SlName", row.SlName);
    setValue("AccountNumber", row.AccBankInfo?.AccountNumber || "");
    setValue("Phone1", row.AccBankInfo?.Phone1 || "");
    setValue("Phone2", row.AccBankInfo?.Phone2 || "");
    setValue("Address", row.AccBankInfo?.Address || "");
  };

  const onDelete = async (data) => {
    try {

      await deleteBankInfoLedger(data).unwrap();
      Swal.fire({ title: "Updated successfully!", icon: "success" });
      reset(); // clear form
      setEditingRow(null); // exit edit mode
    } catch (error) {
      console.log(error);
      Swal.fire({ title: "Operation failed", icon: "error" });
    }
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEdit(row)} />
          <DeleteButton onClick={()=>{onDelete(row.SLID)}}  />
        </div>
      ),
    },
    {
      title: translate("Code"),
      hozAlign: "center",
      render: (row) => <>{row?.SLID}</>,
    },
    {
      title: translate("Account Name"),
      hozAlign: "center",
      render: (row) => <>{row?.SlName}</>,
    },
    {
      title: translate("Account Number"),
      hozAlign: "center",
      render: (row) => <>{row.AccBankInfo?.AccountNumber}</>,
    },
    {
      title: translate("Mobile"),
      hozAlign: "center",
      render: (row) => <>{row.AccBankInfo?.Phone1}</>,
    }
  ];
  const onSubmit = async (data) => {
    try {
      if (editingRow) {
        // update request
        await putBankInfoLedger({
          GLID: editingRow.GLID,
          SLID: editingRow.SLID,
          ...data,
        }).unwrap();

        Swal.fire({ title: "Updated successfully!", icon: "success" });
      } else {
        // create request
        await postBankInfoLedger(data).unwrap();
        Swal.fire({ title: "Created successfully!", icon: "success" });
      }

      reset(); // clear form
      setEditingRow(null); // exit edit mode
    } catch (error) {
      console.log(error);
      Swal.fire({ title: "Operation failed", icon: "error" });
    }
  };


  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-lato p-6 bg-gray-50 rounded-xl shadow-md mb-6">
        <input type="hidden" {...register("FundID")} />
        <DefaultSelect
          label={"Account Type"}
          nameField={"GlName"}
          registerKey={"GLID"}
          valueField={"GLID"}
          options={paymentType}
          require={"This Field is require"}
        />
        <DefaultInput
          label={"Accountant name"}
          registerKey={"SlName"}
          type={"text"}
        />
        <DefaultInput
          label={"Accountant Number"}
          registerKey={"AccountNumber"}
          type={"text"}
        />
        <DefaultInput
          label={"Mobile 1"}
          registerKey={"Phone1"}
          type={"text"}
        />
        <DefaultInput
          label={"Mobile 2"}
          registerKey={"Phone2"}
          type={"text"}
        />

        <div className="flex gap-4 mt-2">
          <Button type="submit">Submit</Button>
        </div>
      </form>
      {
        subLedger && subLedger.length > 0 ? (
          <div className="overflow-x-auto">
            <SortableTable
              columns={columns}
              data={subLedger}
              isFilterColumn={false}
            />
          </div>

        ) : null
      }

    </FormProvider>
  );
};

export default BankInfoSettings;
