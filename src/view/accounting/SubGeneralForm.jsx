import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import { toast } from "react-toastify";

import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import {
  useDeleteSubGeneralLedgerMutation,
  useGetChartOFAccountQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersByFundAndCaidsQuery,
  useGetSubGeneralLedgersQuery,
  usePostSubGeneralLedgerMutation,
  useUpdateSubGeneralLedgerMutation,
} from "../../features/feeCollection/feeCollectionSlice";
import SortableTable from "../../components/Tables/SortableTable";
import EditButton from "../../components/Button/EditButton";
import DeleteButton from "../../components/Button/DeleteButton";
import bnBijoy2Unicode from "../../utils/conveter";
import DefaultSelect from "../../components/Forms/DefaultSelect";

const SubGeneralForm = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset, watch, resetField, setValue } = methods;

  // Watch Fund & Chart Account
  const [FundID, CAID, GLID] = watch(["FundID", "CAID", "GLID"]);

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
  const { data: subGeneralLedgersData, refetch: subGLRefetch } =
    useGetSubGeneralLedgersQuery(
      { fundId: FundID, caId: CAID, glid: GLID },
      {
        skip: !GLID || !CAID || !GLID,
      }
    );


  // Mutations
  const [postSubGeneral, { isLoading: isCreating }] =
    usePostSubGeneralLedgerMutation();
  const [updateSubGeneral, { isLoading: isUpdating }] =
    useUpdateSubGeneralLedgerMutation();
  const [deleteSubGeneral, { isLoading: isDeleting }] =
    useDeleteSubGeneralLedgerMutation();

  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // 🔹 Submit handler
  const onSubmit = async (data) => {
    try {
      if (editRow) {
        await updateSubGeneral({
          SlName: data.SlName,
          slId: editRow,
        }).unwrap();
        toast.success(translate("Sub General Ledger updated successfully!"));
      } else {
        await postSubGeneral({ FundID, GLID, SlName: data.SlName }).unwrap();
        toast.success(translate("Sub General Ledger created successfully!"));
      }
      // // Reset only GlName field, keep FundID and CAID
      resetField("SlName");
      setShowForm(false);
      setEditRow(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || translate("Something went wrong!"));
    }
  };

  // 🔹 Edit
  // 🔹 Edit
  const handleEditOpen = (row) => {
    console.log(row, "row");
    setEditRow(row.SLID);
    setShowForm(true); // আগে form খোলো
    setTimeout(() => {
      setValue("SlName", row.SlName, { shouldValidate: true });
    }, 0); // form ready হওয়ার পর value বসাও
  };

  // 🔹 Delete
  const handleDelete = async (row) => {
    try {
      await deleteSubGeneral(row.SLID).unwrap();
      toast.success(translate("Sub General Ledger deleted successfully!"));
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || translate("Failed to delete General Ledger")
      );
    }
  };

  const handleCreateData = () => {
    setShowForm(true);
    resetField("SlName", { defaultValue: "" });
  };

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
        <p>
          {bnBijoy2Unicode(
            row.AccGeneralLedger?.AccChartOfAccount?.ChartOfAcName || ""
          )}
        </p>
      ),
    },
    {
      title: translate("Sub General Name"),
      field: "GlName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row?.SlName)}</p>,
    },
    {
      title: translate("General Name"),
      field: "GlName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row?.AccGeneralLedger?.GlName)}</p>,
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
          />{" "}
          <DefaultSelect
            label="General Ledger"
            options={generalLedgersData ?? []}
            valueField="GLID"
            nameField="GlName"
            registerKey="GLID"
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
                registerKey="SlName"
                require={translate("Sub General name is required")}
                type="text"
                placeholder={translate("Enter General name") + " ..."}
                label="Sub General Name"
                // unicode={true}
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
              {translate("All Sub Generals")}
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
        data={subGeneralLedgersData ?? []}
        isFilterColumn={false}
      />
    </>
  );
};

export default SubGeneralForm;
