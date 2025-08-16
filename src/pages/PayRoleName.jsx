import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGreen from "../components/Button/DefaultGreen";
import { FormProvider, useForm } from "react-hook-form";
import EditButton from "../components/Button/EditButton";
import DeleteButton from "../components/Button/DeleteButton";

const PayRoleName = () => {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
        <div className="md:flex w-full px-3 gap-3 ">
          {/*Input form Start*/}
          <div className="md:w-[50%]">
            <div className="text-sm font-medium text-black items-center gap-2 grid grid-cols-1 lg:grid-cols-2">
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
              <DefaultGreen submitButtonGreen={"Save"} />
              <DefaultGreen submitButtonGreen={"New"} />
            </div>
          </div>
          {/*Input form End*/}

          {/*Table start*/}
          <div className="md:w-[50%] font-lato">
            <table className="w-full">
              <thead className="text-left bg-slate-700 ">
                <tr className="font-normal text-sm text-white">
                  <th className="px-2 py-1">সিরিয়াল</th>
                  <th>পে-রোলের নাম</th>
                  <th className="w-[10%]">Action</th>
                </tr>
              </thead>
              <tbody className="text-left">
                <tr className="font-normal text-sm text-slate-800">
                  <td>১</td>
                  <td>মূল বেতন</td>
                  <td className="flex gap-2 py-2 px-2">
                    <EditButton
                    // onClick={() => ()}
                    />{" "}
                    <DeleteButton
                    // onClick={() => ()}
                    />
                  </td>
                </tr>
                <tr className="font-normal text-sm text-slate-800 ">
                  <td>২</td>
                  <td>চিকিৎসা ভাতা</td>
                  <td className="flex gap-2 py-2 px-2">
                    <EditButton
                    // onClick={() => ()}
                    />{" "}
                    <DeleteButton
                    // onClick={() => ()}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*Table End*/}
        </div>
      </div>
    </FormProvider>
  );
};

export default PayRoleName;
