import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { banglaDigitMap, banglaMonthMap, months } from "../../Data/monthsData";
import { fetchClassData } from "../../features/class/classSlice";
import {
  useEditMonthMutation,
  useGetMonthListQuery,
  useInsertMonthMutation,
} from "../../features/months/montListSlice";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import { hideModal } from "../../utils/ModalControlar";
import useTranslate from "../../utils/Translate";
import Button from "../Button/Button";
import Input from "../Input/Input";
import DefaultSelect from "./DefaultSelect";

const MonthNamesForm = ({ id, isEdit = false }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();

  const { academicSession, status: settingsStatus } = useSelector(
    (state) => state.settings
  );
  const { classList, status: classStatus } = useSelector(
    (state) => state.class
  );

  const { data: monthsList = [] } = useGetMonthListQuery();

  // 👇 Hooks MUST go before early return
  const [insertMonth] = useInsertMonthMutation();
  const [editMonth] = useEditMonthMutation();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const defaultValues = useMemo(() => {
    const item = monthsList.find((item) => item.ID === id);
    if (!item) return {};

    const monthNamesArray = months.map(
      (_, index) => item[`Month${index + 1}`] || ""
    );

    return {
      monthNames: monthNamesArray,
      ClassID: item?.ClassID || "",
      SessionID: item?.SessionID || "",
    };
  }, [id, monthsList]);

  useEffect(() => {
    if (settingsStatus === "idle") {
      dispatch(fetchSettingsData());
    }
    if (classStatus === "idle") {
      dispatch(fetchClassData());
    }
  }, [dispatch, settingsStatus, classStatus]);

  useEffect(() => {
    if (isEdit && defaultValues) {
      reset(defaultValues);
    } else if (!isEdit) {
      const blankValues = {
        ClassID: "",
        SessionID: "",
        monthNames: months.map(() => ""),
      };
      reset(blankValues);
    }
  }, [defaultValues, isEdit, reset]);

  // SweetAlert validation for empty data
  useEffect(() => {
    if (
      settingsStatus === "succeeded" &&
      Array.isArray(academicSession) &&
      academicSession.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: translate("No academic sessions found"),
        text: translate("Please set up academic sessions before proceeding."),
      });
    }

    if (
      classStatus === "succeeded" &&
      Array.isArray(classList) &&
      classList.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: translate("No classes found"),
        text: translate("Please set up classes before proceeding."),
      });
    }
  }, [academicSession, classList, settingsStatus, classStatus, translate]);

  // Guard rendering if data is not ready
  const isLoading =
    settingsStatus !== "succeeded" || classStatus !== "succeeded";

  if (isLoading) return <div className="text-center py-6">Loading...</div>;

  const convertBanglaToEnglishDigit = (str) =>
    str
      .split("")
      .map((char) => banglaDigitMap[char] ?? char)
      .join("");

  const autoConvertMonthName = (value) => {
    const num = parseInt(convertBanglaToEnglishDigit(value), 10);
    return banglaMonthMap[num] || null;
  };

  const onSubmit = async (data) => {
    try {
      const monthObject = {};
      data.monthNames.forEach((value, index) => {
        monthObject[`Month${index + 1}`] = value;
      });

      const finalData = {
        ClassID: data.ClassID,
        SessionID: data.SessionID,
        ...monthObject,
      };

      if (isEdit) {
        await editMonth({ id, ...finalData }).unwrap();
      } else {
        await insertMonth(finalData).unwrap();
      }

      Swal.fire({
        title: translate(
          isEdit
            ? "Month names updated successfully!"
            : "Month names saved successfully!"
        ),
        icon: "success",
      });

      reset();
      hideModal();
    } catch (error) {
      console.error("Save failed", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to save month names"),
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-lato">
        <div className="px-6 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {months.map((month, index) => {
              const fieldName = `monthNames.${index}`;
              const fieldError = errors?.monthNames?.[index];

              return (
                <Input
                  key={month}
                  label={`${translate(month)}`}
                  placeholder={translate(`Enter name or number for ${month}`)}
                  type="text"
                  {...register(`monthNames.${index}`, {
                    required: translate(month + ' ' + 'name is required'),
                  })}
                  helperText={fieldError?.message}
                  error={!!fieldError}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' || e.key === 'Enter') {
                      const inputVal = e.target.value.trim();
                      const convertedVal = autoConvertMonthName(inputVal);
                      if (convertedVal) {
                        e.preventDefault();
                        setValue(fieldName, convertedVal);
                        e.target.value = convertedVal;

                        setTimeout(() => {
                          const formElements = e.target.form.elements;
                          const i = [...formElements].indexOf(e.target);
                          const nextElement =
                            formElements[i + 1] || formElements[0];
                          nextElement.focus();
                        }, 0);
                      }
                    }
                  }}
                />
              );
            })}
            <DefaultSelect
              options={academicSession}
              require={translate('Session is required')}
              nameField={'SessionName'}
              valueField={'SessionID'}
              registerKey={'SessionID'}
              type={'number'}
              label="Session"
              unicode
              disabled={isEdit ? true : false}
            />

            <DefaultSelect
              options={classList}
              require={translate('Class is required')}
              nameField={'ClassName'}
              valueField={'ClassID'}
              registerKey={'ClassID'}
              type={'number'}
              label="Class"
              unicode
              disabled={isEdit ? true : false}
            />
          </div>

          <div className="flex justify-start mt-6">
            <Button type="submit">
              {translate(isEdit ? 'Update' : 'Save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default MonthNamesForm;
