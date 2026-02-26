import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import { toast } from "react-toastify";

import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import {
  useDeleteFundMutation,
  useGetFundNamesQuery,
  usePostFundMutation,
  useUpdateFundMutation,
  useUpdateFundStatusMutation,
} from "../../features/feeCollection/feeCollectionSlice";
import SortableTable from "../../components/Tables/SortableTable";
import EditButton from "../../components/Button/EditButton";
import DeleteButton from "../../components/Button/DeleteButton";
import ToggleSwitch from "../../components/Switchers/ToggleSwitch";
import bnBijoy2Unicode from "../../utils/conveter";

const FundForm = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset } = methods;

  const { data: fundNamesData, refetch } = useGetFundNamesQuery();
  const [postFund, { isLoading: isCreating }] = usePostFundMutation();
  const [updateFund, { isLoading: isUpdating }] = useUpdateFundMutation();
  const [deleteFund, { isLoading: isDeleting }] = useDeleteFundMutation();
  const [updateFundStatus] = useUpdateFundStatusMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const onSubmit = async (data) => {
    try {
      if (editId) {
        await updateFund({ id: editId, data }).unwrap();
        toast.success(translate("Fund updated successfully!"));
      } else {
        await postFund(data).unwrap();
        toast.success(translate("Fund created successfully!"));
      }
      reset();
      setShowForm(false);
      setEditId(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || translate("Something went wrong!"));
    }
  };

    const handleToggleAction = async (id, currentAction) => {
      try {
        const newAction = currentAction === 1 ? 0 : 1; // Toggle
        await updateFundStatus({ id, Action: newAction }).unwrap();
        toast.success("Status updated successfully!");
        refetch(); // Refresh table
      } catch (error) {
        toast.error(error?.data?.error || "Something went wrong!");
      }
    };

  const handleEditOpen = (row) => {
    setEditId(row.FundID);
    reset({ FundName: row.FundName, Action: row.Action });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFund(id).unwrap();
      toast.success(translate("Fund deleted successfully!"));
      refetch();
    } catch (error) {
      toast.error(error?.data?.error || translate("Failed to delete fund"));
    }
  };

  const columns = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpen(row)} />
          <DeleteButton onClick={() => handleDelete(row.FundID)} />
        </div>
      ),
    },
    {
      title: translate("FundID"),
      field: "FundID",
      hozAlign: "center",
      render: (row) => <p>{row.FundID}</p>,
    },
    {
      title: translate("Name"),
      field: "FundName",
      hozAlign: "center",
      render: (row) => <p>{bnBijoy2Unicode(row.FundName)}</p>,
    },
    {
      title: translate("Status"),
      field: "Action",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center">
          <ToggleSwitch
            checked={row.Action === 1}
            onChange={() => handleToggleAction(row.FundID, row.Action)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {showForm ? (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="font-lato p-6 bg-gray-50 rounded-xl shadow-md mb-6"
          >
            <div className="mb-4">
              <DefaultInput
                registerKey="FundName"
                require={translate("Fund name is required")}
                type="text"
                placeholder={translate("Enter fund name") + " ..."}
                label="Fund Name"
              />
            </div>
            <div className="flex gap-3">
              <Button
                loading={isCreating || isUpdating}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                type="submit"
              >
                {editId ? translate("Update") : translate("Save")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  reset();
                  setEditId(null);
                  setShowForm(false);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                {translate("Cancel")}
              </Button>
            </div>
          </form>
        </FormProvider>
      ) : (
        <div className="flex justify-end items-center my-5">
          {/* <h2 className="text-lg font-semibold">{translate("All Funds")}</h2> */}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            type="button"
            onClick={() => setShowForm(true)}
          >
            {translate("Create")}
          </Button>
        </div>
      )}

      <SortableTable
        columns={columns}
        data={fundNamesData ?? []}
        isFilterColumn={false}
      />
    </>
  );
};

export default FundForm;
