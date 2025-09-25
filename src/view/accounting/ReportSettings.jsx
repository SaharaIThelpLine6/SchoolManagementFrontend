import { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import { useGetAccReportSettingsQuery, useUpdateAccReportSettingMutation } from "../../features/settings/settingsQuerySlice";

const ReportSettings = () => {
  const { data: accReportSettingsData } = useGetAccReportSettingsQuery();
  const [updateUpdateAccReportSettings] = useUpdateAccReportSettingMutation();
  const [selected, setSelected] = useState(null);
  const methods = useForm({
    defaultValues: {
      rows: []
    }
  });
  const { control, handleSubmit, reset } = methods;
  useEffect(() => {
    if (accReportSettingsData) {
      reset({
        rows: Object.entries(accReportSettingsData.ReportSettings).map(
          ([id, values]) => ({
            ID: parseInt(id, 10),
            ...values,
          })
        ),
        "14": String(accReportSettingsData.TblPrintView.Action),
        "YearID": accReportSettingsData.AccRasidSetting.YearID,
      });
      setSelected(String(accReportSettingsData.TblPrintView.Action)); 
      console.log(accReportSettingsData.TblPrintView.Action);
      
    }
  }, [accReportSettingsData, reset, setSelected]);
  // dynamic rows
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows"
  });

  const onSubmit = async (data) => {
    const payload = {};
    data.rows.forEach((row) => {
      const { ID, ...rest } = row;
      payload[ID] = rest;
    });

    payload[14] = data[14]
    payload['YearID'] = data["YearID"]



    try {
      await updateUpdateAccReportSettings(payload).unwrap();
      Swal.fire({
        title: "Institution info updated successfully!",
        icon: "success",
        draggable: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Institution update failed",
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <FormProvider {...methods}>



      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-lato p-6 bg-gray-50 rounded-xl shadow-md mb-6"
      >
        <div className="flex gap-8 mb-4">
          {/* Main options */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <input
                id="bordered-radio-1"
                type="radio"
                value="0"
                {...methods.register("14")}
                onChange={() => setSelected("0")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="bordered-radio-1"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Without Number
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="bordered-radio-2"
                type="radio"
                value="5"
                {...methods.register("14")}
                onChange={() => setSelected("5")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="bordered-radio-2"
                className="ms-2 text-sm font-medium text-gray-900"
              >
                Auto
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="bordered-radio-3"
                type="radio"
                value={"3"}
                {...methods.register("14")}
                onChange={() => setSelected("3")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="bordered-radio-3"
                className="ms-2 text-sm font-medium text-gray-900"
              >
                Manual
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="bordered-radio-4"
                type="radio"
                value={"2"}
                {...methods.register("14")}
                onChange={() => setSelected("2")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="bordered-radio-4"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Selected Recepted
              </label>
            </div>
          </div>

          {/* Conditional children for Auto */}
          {selected === "5" && (
            <div className="flex flex-col gap-2 pl-6 border-l border-gray-300">
              <div className="flex items-center">
                <input
                  id="auto-session"
                  type="radio"
                  value="5"
                  {...methods.register("14")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="auto-session"
                  className="ms-2 text-sm font-medium text-gray-900"
                >
                  Session Wise
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="auto-order"
                  type="radio"
                  value="1"
                  {...methods.register("14")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="auto-order"
                  className="ms-2 text-sm font-medium text-gray-900"
                >
                  Order
                </label>
              </div>
            </div>
          )}

          {/* Conditional children for Manual */}
          {(selected === "3" || selected === "4") && (
            <div className="flex flex-col gap-2 pl-6 border-l border-gray-300">
              <div className="flex items-center">
                <input
                  id="manual-without"
                  type="radio"
                  value="3"
                  {...methods.register("14")}
                  onChange={() => setSelected("3")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="manual-without"
                  className="ms-2 text-sm font-medium text-gray-900"
                >
                  Without Session ID
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="manual-session"
                  type="radio"
                  value="4"
                  {...methods.register("14")}
                  onChange={() => setSelected("4")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="manual-session"
                  className="ms-2 text-sm font-medium text-gray-900"
                >
                  Session ID First
                </label>
              </div>
              {selected === "4" ? <DefaultInput label={"Session ID First"} require={true} registerKey={"YearID"} /> : null}

            </div>
          )}
        </div>




        {fields.map((field, index) => (
          <div key={field.id} className=" gap-2 mb-4">
            {/* <DefaultInput registerKey={`rows.${index}.ID`} label="ID" /> */}
            <input className="hidden" {...methods.register(`rows.${index}.ID`)} />

            <div className="grid grid-cols-3 gap-2">
              <div className="flex gap-4 items-center">
                <label htmlFor={`rows.${index}.SettingColumn1`}>Col 3</label>
                <input
                  type="checkbox"
                  className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  {...methods.register(`rows.${index}.SettingColumn1`)}
                />
              </div>
              <div className="flex gap-4 items-center">
                <label htmlFor={`rows.${index}.SettingColumn2`}>Col 3</label>
                <input
                  type="checkbox"
                  className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  {...methods.register(`rows.${index}.SettingColumn2`)}
                />
              </div>
              <div className="flex gap-4 items-center">
                <label htmlFor={`rows.${index}.SettingColumn3`}>Col 3</label>
                <input
                  type="checkbox"
                  className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  {...methods.register(`rows.${index}.SettingColumn3`)}
                />
              </div>
              <DefaultInput registerKey={`rows.${index}.Value1`} />
              <DefaultInput registerKey={`rows.${index}.Value2`} />
              <DefaultInput registerKey={`rows.${index}.Value3`} />
            </div>

          </div>
        ))}

        <div className="flex gap-4">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ReportSettings;
