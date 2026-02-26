import { useCallback, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import { toast } from "react-toastify";

import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import {
  useDeleteGeneralLedgersByFundAndCaidsMutation,
  useGetChartOFAccountQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersByFundAndCaidsQuery,
  usePostGeneralLedgersByFundAndCaidsMutation,
  useUpdateGeneralLedgersByFundAndCaidsMutation,
} from "../../features/feeCollection/feeCollectionSlice";
import SortableTable from "../../components/Tables/SortableTable";
import EditButton from "../../components/Button/EditButton";
import DeleteButton from "../../components/Button/DeleteButton";
import bnBijoy2Unicode from "../../utils/conveter";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import { hideModal, showModal } from "../../utils/ModalControlar";

const GeneralForm = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset, watch, resetField, setValue } = methods;

  // Watch Fund & Chart Account
  const [FundID, CAID] = watch(["FundID", "CAID"]);

  // Queries
  const { data: fundNamesData } = useGetFundNamesQuery();
  const { data: chartOfAccountData } = useGetChartOFAccountQuery();
  const { data: generalLedgersData, refetch } =
    useGetGeneralLedgersByFundAndCaidsQuery(
      { fundId: FundID, caId: CAID },
      {
        skip: !FundID || !CAID,
      }
    );

  // Mutations
  const [postGeneral, { isLoading: isCreating }] =
    usePostGeneralLedgersByFundAndCaidsMutation();
  const [updateLedger, { isLoading: isUpdating }] =
    useUpdateGeneralLedgersByFundAndCaidsMutation();
  const [deleteLedger, { isLoading: isDeleting }] =
    useDeleteGeneralLedgersByFundAndCaidsMutation();

  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // 🔹 Submit handler
  const onSubmit = async (data) => {
    try {
      if (editRow) {
        await updateLedger({
          FundID,
          CAID,
          GLID: editRow.GLID,
          data,
        }).unwrap();
        toast.success(translate("General Ledger updated successfully!"));
      } else {
        await postGeneral({ ...data, FundID, CAID }).unwrap();
        toast.success(translate("General Ledger created successfully!"));
      }
      // Reset only GlName field, keep FundID and CAID
      resetField("GlName");
      setShowForm(false);
      setEditRow(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || translate("Something went wrong!"));
    }
  };

  // 🔹 Edit
  const handleEditOpen = (row) => {
    setEditRow(row);
    setValue("GlName", row.GlName); // Explicitly set GlName value
    setShowForm(true);
  };

  // 🔹 Delete
  const handleDelete = async (row) => {
    try {
      await deleteLedger({
        FundID: row.FundID,
        CAID: row.CAID,
        GLID: row.GLID,
      }).unwrap();
      toast.success(translate("General Ledger deleted successfully!"));
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || translate("Failed to delete General Ledger")
      );
    }
  };

  const handleCreateData = () => {
    setShowForm(true);
    resetField("GlName", { defaultValue: "" });
  };

    const handleGeneralOpenModal = useCallback(() => {
      hideModal();
      // ছোট delay দিয়ে modal আবার show করো
      setTimeout(() => {
        showModal(translate("Sub General Ledgers"), "OPEN_SUB_GENERAL");
      }, 100);
    }, [translate]);


  // Table columns
  const columns = [
    {
      title: translate("Action"),
      field: "action",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpen(row)} />
          <DeleteButton
            onClick={() => handleDelete(row)}
            loading={isDeleting}
          />
        </div>
      ),
    },
    {
      title: translate("Fund"),
      field: "FundName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row.AccFund?.FundName || "")}</p>,
    },
    {
      title: translate("Chart Account"),
      field: "ChartOfAcName",
      hozAlign: "center",
      render: (row) => (
        <p>{bnBijoy2Unicode(row.AccChartOfAccount?.ChartOfAcName || "")}</p>
      ),
    },
    {
      title: translate("General Name"),
      field: "GlName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row.GlName)}</p>,
    },
    {
      title: translate("Sub Ledger"),
      field: "GlName",
      hozAlign: "center",
      render: (row) => (
        <>
          <Button onClick={handleGeneralOpenModal}>Info</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <FormProvider {...methods}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <DefaultSelect
            label="Fund"
            options={fundNamesData ?? []}
            valueField="FundID"
            nameField="FundName"
            registerKey="FundID"
            unicode={true}
            require={translate("Fund is required!")}
          />
          <DefaultSelect
            label="Deposit/Cost"
            options={chartOfAccountData ?? []}
            valueField="CAID"
            nameField="ChartOfAcName"
            registerKey="CAID"
            unicode={true}
            require={translate("Deposit/Cost is required!")}
          />
        </div>

        {showForm ? (
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="font-lato p-6 bg-gray-50 rounded-xl shadow-md mb-6"
          >
            <div className="mb-4">
              <DefaultInput
                registerKey="GlName"
                require={translate("General name is required")}
                type="text"
                placeholder={translate("Enter General name") + " ..."}
                label="General Name"
              />
            </div>
            <div className="flex gap-3">
              <Button
                loading={isCreating || isUpdating}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                type="submit"
              >
                {editRow ? translate("Update") : translate("Save")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  resetField("GlName"); // Reset only GlName
                  setEditRow(null);
                  setShowForm(false);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                {translate("Cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center my-5">
            <h2 className="text-lg font-semibold">
              {translate("All Generals")}
            </h2>
            {FundID && CAID && (
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                type="button"
                onClick={handleCreateData}
              >
                {translate("Create")}
              </Button>
            )}
          </div>
        )}
      </FormProvider>

      <SortableTable
        columns={columns}
        data={generalLedgersData ?? []}
        isFilterColumn={false}
      />
    </>
  );
};

export default GeneralForm;
