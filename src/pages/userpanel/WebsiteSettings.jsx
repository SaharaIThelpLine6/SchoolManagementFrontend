import { useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import Select from "react-select";
import Swal from 'sweetalert2';
import DefaultImageUpload from '../../components/Forms/DefaultImageUpload';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useGetWebSettingsQuery,
  usePostWebsitesettingsMutation,
} from '../../features/settings/settingsQuerySlice';
import useTranslate from '../../utils/Translate';
import Keyword from '../../components/Keywords/Keywords';
import DefaultSelect from '../../components/Forms/DefaultSelect';
const API_URL = import.meta.env.VITE_SERVER_URL;

export default function WebsiteSettings() {
  const [bannerImg, setBannerImg] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  const [aboutImg, setAboutImg] = useState(null);
  const [aboutUrl, setAboutUrl] = useState(null);

  const methods = useForm({
    defaultValues: {
      fblink: '',
      ylink: '',
      studentListHeading: '',
      primaryHeading: '',
      aboutText: '',
      whyUsTitle: '',
      subjectListTitle: '',
      teacherListTitle: '',
      bannerImage: null,
      singleImage: null,
      whyUsList: [{ text: '' }],
      classList: [{ text: '', subjects: [] }],
      teachers: [],
      // Color Palette Default Values
      primary: '#265d3e',
      secondary: '#fbbf24',
    },
  });
  const translate = useTranslate();
  const { reset, control, register, setValue, watch } = methods;
  const { fields, append, remove, replace, insert } = useFieldArray({
    control,
    name: 'whyUsList',
  });
  const { fields: classSubjectFields, append: appendClassSubjectFields, remove: removeClassSubjectFields, replace: replaceClassSubjectFields, insert: insertClassSubjectFields } = useFieldArray({
    control,
    name: 'classList',
  });

  const [sendWebsiteSettings] = usePostWebsitesettingsMutation();
  const { data, error, isLoading } = useGetWebSettingsQuery();
  const [teacherOptions, setTeacherOptions] = useState([]);


  const [classSubjectList, setClassSubjectList] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const watchedClassList = useWatch({
    control,
    name: 'classList'
  });
  useEffect(() => {
    if (data) {
      console.log(data);

      data.forEach((item) => {
        const key = item.FieldKey;
        let value = item.FieldValue;
        if (key == 'whyUsItems') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = [{ text: '' }];
          }
          remove(0);

          replace(value);
        } else {
          setValue(key, value); // for single values, images, and our new 'primary' / 'secondary' colors
        }
        if (key == 'BannerImage') {
          setBannerUrl(`${API_URL}/public${value}`);
        }
        if (key == 'whyUsImage') {
          setAboutUrl(`${API_URL}/public${value}`);
        }

        if (key == 'teachers') {
          const teachersData = Array.isArray(value) ? value : [];
          const options = teachersData.map((t) => ({
            value: t.UserID,
            label: t.UserName,
          }));
          const activeTeachers = teachersData.filter((t) =>
            Number(t.OnlineAction) === 1
          );

          const teacherIds = activeTeachers.map((t) => t.UserID);

          setValue("teachers", teacherIds);
          setTeacherOptions(options);
        }
        if (key == 'subjectClass') {
          try {
            const classSubjectsData = Array.isArray(value) ? value : [];
            setClassSubjectList(classSubjectsData);
          } catch (error) {
            console.error('Error parsing subjectClass:', error);
            setClassSubjectList([]);
          }
        }
      });
    }
  }, [data, setValue, append]);

  const onSubmit = async (data) => {
    const formattedSubjects = data.classList
      .filter(item => item.text && item.subjects.length > 0)
      .map(item => ({
        subClassId: Number(item.text),
        subjectIds: item.subjects
      }));


    const formData = new FormData();
    // Text fields
    formData.append('fblink', data.fblink);
    formData.append('ylink', data.ylink);
    formData.append('primaryHeading', data.primaryHeading);
    formData.append('studentListHeading', data.studentListHeading);
    formData.append('aboutText', data.aboutText);
    formData.append('whyUsTitle', data.whyUsTitle);
    // JSON (stringify!)
    formData.append('whyUsList', JSON.stringify(data.whyUsList));
    formData.append('subjectListTitle', data.subjectListTitle);
    formData.append('teacherListTitle', data.teacherListTitle);
    
    // Colors
    formData.append('primary', data.primary);
    formData.append('secondary', data.secondary);

    // Images (only if selected)
    if (data.bannerImage instanceof File) {
      formData.append('bannerImage', data.bannerImage);
    }
    if (data.singleImage instanceof File) {
      formData.append('singleImage', data.singleImage);
    }
    formData.append("teachers", JSON.stringify(data.teachers));
    formData.append('subjectClasses', JSON.stringify(formattedSubjects));
    try {
      await sendWebsiteSettings(formData).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text:
          error?.data?.message || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  const toggleAll = (index, academicSubjects) => {
    const allIds = academicSubjects.map(s => s.SubjectID);
    const selected = watchedClassList?.[index]?.subjects || [];

    setValue(
      `classList.${index}.subjects`,
      selected.length === allIds.length ? [] : allIds
    );
  };

  const toggleOne = (index, subjectId) => {
    const selected = watchedClassList?.[index]?.subjects || [];

    setValue(
      `classList.${index}.subjects`,
      selected.includes(subjectId)
        ? selected.filter(id => id !== subjectId)
        : [...selected, subjectId]
    );
  };

  const isAllChecked = (index, academicSubjects) => {
    const selected = watchedClassList?.[index]?.subjects || [];
    return selected.length === academicSubjects.length && academicSubjects.length;
  };



  const getAcademicSubjects = (index) => {
    const selectedSubClassID = watchedClassList?.[index]?.text;
    if (!selectedSubClassID) return [];
    const found = classSubjectList.find(
      item => item.SubClassID === Number(selectedSubClassID)
    );

    return found?.AcademicSubjects || [];
  };


  return (
    <FormProvider {...methods}>
      <div className="website-settings">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mt-2">
            <DefaultInput
              registerKey="primaryHeading"
              type="text"
              label={translate("Primary Title")}
            />
          </div>

          {/* Color Palette Section */}
          <div className="mt-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{translate('Color Palette')}</h3>
              <button
                type="button"
                onClick={() => {
                  setValue('primary', '#265d3e');   // default primary
                  setValue('secondary', '#fbbf24'); // default secondary
                }}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
              >
                {translate("Reset Colors")}
              </button>
            </div>
            <div className="flex gap-6">
              {/* Primary Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">{translate('Primary Color')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('primary')}
                    className="w-10 h-10 cursor-pointer border-0 rounded bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={watch('primary') || '#265d3e'}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.charAt(0) !== '#') val = '#' + val;
                      // basic hex validation
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setValue('primary', val);
                      } else if (val.length <= 7) {
                        // allow partial input while typing
                        setValue('primary', val);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#265d3e"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">{translate('Secondary Color')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('secondary')}
                    className="w-10 h-10 cursor-pointer border-0 rounded bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={watch('secondary') || '#fbbf24'}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.charAt(0) !== '#') val = '#' + val;
                      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                        setValue('secondary', val);
                      } else if (val.length <= 7) {
                        setValue('secondary', val);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                    placeholder="#fbbf24"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* End Color Palette Section */}

          <DefaultInput
            registerKey="aboutText"
            type="textarea"
            label={translate("About Section Text")}
            require="About text is required"
          />
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {translate('Upload About Image')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="bannerImage"
                require="This is required"
                image={bannerImg}
                setPreviewUrl={setBannerUrl}
                previewUrl={bannerUrl}
              />
            </div>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="studentListHeading"
              type="text"
              label={translate("Student Stats Title")}
            />
          </div>

          <DefaultInput
            registerKey="whyUsTitle"
            type="text"
            label={translate("Why Choose Us Title")}
          />
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {translate('Upload About Image')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="singleImage"
                require="This is required"
                image={aboutImg}
                setPreviewUrl={setAboutUrl}
                previewUrl={aboutUrl}
              />
            </div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <DefaultInput
                defaultValue={field.text}
                registerKey={`whyUsList.${index}.text`}
                placeholder={`Point ${index + 1}`}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className="gap-4 flex items-center">
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            >
              {translate("Add")}
            </button>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="subjectListTitle"
              type="text"
              label={translate("Subject List Title")}
            />
          </div>



          {classSubjectFields.map((field, index) => {
            const academicSubjects = getAcademicSubjects(index);

            return (
              <div key={field.id} className="flex flex-wrap md:flex-nowrap gap-6 items-start mb-4 mt-4">


                <div className="w-full md:w-1/2">
                  {classSubjectList?.length > 0 && (
                    <DefaultSelect
                      options={classSubjectList}
                      nameField="SubClass"
                      valueField="SubClassID"
                      registerKey={`classList.${index}.text`}

                    />
                  )}
                </div>

                {academicSubjects.length > 0 && (
                  <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default w-full md:w-1/2">
                    <table className="w-full text-xl text-left text-body">

                      <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                          <th className="px-4 py-2" width="50">
                            <input
                              type="checkbox"
                              checked={isAllChecked(index, academicSubjects)}
                              onChange={() => toggleAll(index, academicSubjects)}
                            />
                          </th>
                          <th>{translate("Subject Name")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {academicSubjects.map(subject => {
                          const selected =
                            watchedClassList?.[index]?.subjects?.includes(subject.SubjectID);

                          return (
                            <tr key={subject.SubjectID} className="border-b">
                              <td className="px-4">
                                <input
                                  type="checkbox"
                                  checked={selected || false}
                                  onChange={() => toggleOne(index, subject.SubjectID)}
                                />
                              </td>
                              <td>{subject.SubjectName}</td>
                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>
                )}


                {classSubjectFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeClassSubjectFields(index)}
                    className="bg-red-500 text-white px-2 rounded h-8"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}


          <div className="mt-2">
            <div className="gap-4 flex items-center">
              <button
                type="button"
                onClick={() => appendClassSubjectFields({ text: '' })}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
              >
                {translate("Add")}
              </button>
            </div>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="teacherListTitle"
              type="text"
              label={translate("Teacher List Card Title")}
            />
          </div>
          <div className="mt-2 flex flex-wrap md:flex-nowrap gap-2">
            <DefaultInput
              registerKey="fblink"
              type="text"
              label={translate("Facebook Link")}
            />
            <DefaultInput
              registerKey="ylink"
              type="text"
              label={translate("Youtube Link")}
            />
          </div>
          <div className="mt-2">
            <label>{translate('Add Teacher Profile')}</label>

            <Controller
              name="teachers"
              control={control}
              defaultValue={[]}
              render={({ field }) => {
                const isAllChecked =
                  teacherOptions.length > 0 &&
                  teacherOptions.every(opt => field.value?.includes(opt.value));

                const toggleAll = () => {
                  if (isAllChecked) {
                    field.onChange([]);
                  } else {
                    field.onChange(teacherOptions.map(opt => opt.value));
                  }
                };

                const toggleOne = (id) => {
                  if (field.value?.includes(id)) {
                    field.onChange(field.value.filter(v => v !== id));
                  } else {
                    field.onChange([...field.value, id]);
                  }
                };

                return (
                  <>
                    <div className='relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default'>
                      <table className="w-full text-xl text-left rtl:text-right text-body">
                        <thead className='text-xl text-body bg-neutral-secondary-soft border-b rounded-base border-default'>
                          <tr>
                            <th width="50" height="20" className='px-4'>
                              <input
                                type="checkbox"
                                checked={isAllChecked}
                                onChange={toggleAll}
                                className='h-full w-full'
                              />
                            </th>
                            <th>{translate("Teacher Name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherOptions.map((teacher) => (
                            <tr className='bg-neutral-primary border-b border-default' key={teacher.value}>
                              <td width="50" height="20" className='px-4'>
                                <input
                                  type="checkbox"
                                  className='h-full w-full'
                                  checked={field.value?.includes(teacher.value)}
                                  onChange={() => toggleOne(teacher.value)}
                                />
                              </td>
                              <td>{teacher.label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary py-2 px-2 bg-cyan-600 text-white rounded-[4px] mt-4 text-center"
          >
            {translate("Save Settings")}
          </button>
        </form>
      </div>
    </FormProvider>
  );
}
