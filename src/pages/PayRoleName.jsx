import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import EditButton from "../components/Button/EditButton";
import Button from "../components/Button/Button";
import SortableTable from "../components/Tables/SortableTable";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useMemo, useState } from "react";
import { useGetStudentsVacationTypeListQuery } from "../features/student/studentQuerySlice";
import DeleteButton from "../components/Button/DeleteButton";
import OwenGuide from "../Routes/OwenGuide";

const PAGE_SIZE = 5;

const PayRoleName = () => {
  const methods = useForm();
  const translate = useTranslate();

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const columns = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ID)} />
          <DeleteButton onClick={() => handleEditOpenModal(row.ID)} />
        </div>
      ),
    },
    {
      title: translate("পে-রোলের নাম"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
        <OwenGuide/>
        <div className="md:flex w-full px-3 gap-3">
          {/*Input form Start*/}
          <div className="md:w-[50%]">
            <div className="text-sm font-medium space-y-1 text-black items-center gap-2 grid grid-cols-1 lg:grid-cols-2">
              <div className="">
                <DefaultSelect
                  type="number"
                  label={<span>ফান্ড :</span>}
                  registerKey={"UserTypeID"}
                  valueField={"id"}
                  nameField={"value"}
                />
              </div>
              <div className="">
                <DefaultSelect
                  type="number"
                  label={<span>জে-লেজার :</span>}
                  registerKey={"UserTypeID"}
                  valueField={"id"}
                  nameField={"value"}
                />
              </div>
              <div className="">
                <DefaultSelect
                  type="number"
                  label={<span>সাব-লেজার :</span>}
                  registerKey={"UserTypeID"}
                  valueField={"id"}
                  nameField={"value"}
                />
              </div>
              <div className="">
                <DefaultInput
                  label={"পে-খাতের নাম :"}
                  type={"text"}
                  placeholder={""}
                  registerKey={"FatherName"}
                />
              </div>
              <div className="">
                <DefaultInput
                  label={"সিরিয়াল :"}
                  type={"text"}
                  placeholder={""}
                  registerKey={"FatherName"}
                />
              </div>
            </div>
            <div className="text-center flex py-3 gap-3">
              <Button>Save</Button>
              <Button>New</Button>
            </div>
          </div>
          {/*Input form End*/}

          {/*Table start*/}
          <div className="md:w-[50%] font-lato">
            <SortableTable columns={columns} data={paginatedData} />

            {/* Pagination Controls */}
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};



export default PayRoleName
