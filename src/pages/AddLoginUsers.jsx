import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useCallback, useMemo, useState } from "react";
import SvgIcon from "../components/icons/SvgIcon";
import { showModal } from "../utils/ModalControlar";
import CustomTable from "../view/settings/CustomTable";

const PAGE_SIZE = 5;

const data = [
  {
    ID: 70003,
    Code: "1122",
    LoginName: "শিপু",
    Name: "শিপু",
    Type: "সফটওয়্যার ইউজার",
    LoginType: "Project Moderator",
    Residential: "একটিভ",
    Number: 3,
  },
  {
    ID: 70004,
    Code: "122",
    LoginName: "মোঃ রাকেল",
    Name: "মোঃ রাকেল",
    Type: "সফটওয়্যার ইউজার",
    LoginType: "Project Moderator",
    Residential: "একটিভ",
    Number: 5,
  },
  {
    ID: 70005,
    Code: "133",
    LoginName: "আকিব",
    Name: "আকিব",
    Type: "সফটওয়্যার ইউজার",
    LoginType: "Project Moderator",
    Residential: "একটিভ",
    Number: 6,
  },
  {
    ID: 70006,
    Code: "666",
    LoginName: "ইমন + ইব্রাহিম",
    Name: "ইমন + ইব্রাহিম",
    Type: "শিক্ষক/স্টাফ",
    LoginType: "Project Moderator",
    Residential: "একটিভ",
    Number: 7,
  },
  {
    ID: 200001,
    Code: "mash",
    LoginName: "মাশরাফিন হোসেন",
    Name: "মাশরাফিন হোসেন",
    Type: "শিক্ষক/স্টাফ",
    LoginType: "Project Moderator",
    Residential: "একটিভ",
    Number: 10,
  },
  {
    ID: 100049,
    Code: "test1",
    LoginName: "ইমন",
    Name: "ইমন",
    Type: "শিক্ষার্থী",
    LoginType: "Reseller",
    Residential: "ইনএকটিভ",
    Number: 2,
  },
  {
    ID: 200132,
    Code: "32",
    LoginName: "ইমন",
    Name: "ইমন",
    Type: "শিক্ষার্থী",
    LoginType: "Reseller",
    Residential: "একটিভ",
    Number: 9,
  },
  {
    ID: 10014,
    Code: "366",
    LoginName: "গণপুর",
    Name: "গণপুর",
    Type: "শিক্ষার্থী",
    LoginType: "Users",
    Residential: "ইনএকটিভ",
    Number: 11,
  },
];

const AddLoginUsers = () => {
  const methods = useForm();
  const translate = useTranslate();

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal("Filter Student", "STUDENT_FILTER");
  }, []);



  const columns = [
    { title: "ID", field: "ID" },
    { title: "Code", field: "Code" },
    { title: "Login Name", field: "LoginName" },
    { title: "Name", field: "Name" },
    { title: "Type", field: "Type" },
    { title: "Login Type", field: "LoginType" },
    { title: "Residential", field: "Residential" },
    { title: "Serial", field: "Number" },
  ];

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
        <div className="md:flex w-full px-3 gap-3">
          {/*Input form Start*/}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="flex items-end gap-2">
                <DefaultInput
                  type="text"
                  label={<span> ব্যবহারকারীর নাম :</span>}
                  registerKey={"UserTypeID"}
                  valueField={"id"}
                  nameField={"value"}
                />
                <Button
                  type="button"
                  onClick={handleOpenModal}
                  className="p-2 border"
                >
                  <SvgIcon name={"GrDrag"} size={16} />
                </Button>
              </div>
              <DefaultSelect
                type="number"
                label={<span>User Power :</span>}
                registerKey={"UserPower"}
                valueField={"id"}
                nameField={"value"}
              />
              <DefaultSelect
                type="number"
                label={<span>Login Name :</span>}
                registerKey={"LoginName"}
                valueField={"id"}
                nameField={"value"}
              />
              <DefaultInput
                label={"Password :"}
                type={"password"}
                placeholder={"Enter password"}
                registerKey={"Password"}
              />
              <DefaultInput
                label={"Confirm Password :"}
                type={"password"}
                placeholder={"Confirm password"}
                registerKey={"ConfirmPassword"}
              />
            </div>
            <div className="text-center flex py-3 gap-3 justify-start">
              <Button>Save</Button>
            </div>
          </div>
          {/*Input form End*/}
        </div>

        {/*Table Start*/}
        <div className="w-full font-SolaimanLipi">
          <CustomTable columns={columns} data={paginatedData} />

          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        {/*Table End*/}
      </div>
    </FormProvider>
  );
};

export default AddLoginUsers;
