import axios from 'axios';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Keyword from '../components/Keywords/Keywords';
const API_URL = import.meta.env.VITE_SERVER_URL;
const QueryThree = () => {
  const methods = useForm({
    defaultValues: {
      DB_HOST: '10.11.13.161',
      DB_USER: 'TestClass',
      DB_PASSWORD: 'TestClass',
      DB_NAME: 'QMMSoftV10',
      fields: [
        {
          TABLE_NAME: 'Exam_Condition',
          UNIQUE_ID: 'ID',
          COLUMN_tags:
            'MeariDivision, MeariRasibDivision, MostMeariBanDivision',
        },
        {
          TABLE_NAME: 'ExamSubjectAndPassNumber',
          UNIQUE_ID: 'SL',
          COLUMN_tags:
            'Subject1, Subject2, Subject3, Subject4, Subject5, Subject6, Subject7, Subject8, Subject9, Subject10, Subject11, Subject12, Subject13, Subject14',
        },
      ],
    },
  });
  const token = useSelector((state) => state.auth.token);

  const { control, handleSubmit, register } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });
  const onSubmit = async (data) => {
    const id = toast.loading('Please wait...');

    let headersList = {
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let bodyContent = JSON.stringify({
      ...data,
    });

    let reqOptions = {
      url: `${API_URL}/api/users/unicode_converter`,
      method: 'POST',
      headers: headersList,
      data: bodyContent,
    };

    try {
      let response = await axios.request(reqOptions);
      console.log(response.data);
      if (response.data) {
        toast.update(id, {
          render: 'Unicode Converted Successfully',
          type: 'success',
          isLoading: false,
        });
      }
    } catch (err) {
      toast.update(id, {
        render: err.message,
        type: 'error',
        isLoading: false,
      });
      console.error(err);
    }
  };
  return (
    <div>
      <div className="border border-blue-400 p-3 mt-10 mx-auto px-[200px]">
        <h1 className="text-center text-3xl font-semibold mb-2">Query Table</h1>
        <div>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-4 gap-[30px] mt-[30px]"
            >
              <div className="grid grid-cols-1">
                <label htmlFor="DB_HOST" className="">
                  DB_HOST
                </label>
                <input
                  type="text"
                  name="DB_HOST"
                  id="DB_HOST"
                  {...register('DB_HOST', { required: 'DB_HOST Is require' })}
                  className="border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1">
                <label htmlFor="DB_USER">DB_USER</label>
                <input
                  type="text"
                  name="DB_USER"
                  id="DB_USER"
                  {...register('DB_USER', {
                    required: 'DB_USER is Required',
                  })}
                  className="border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="DB_PASSWORD">DB_PASSWORD</label>
                <input
                  type="text"
                  name="DB_PASSWORD"
                  id="DB_PASSWORD"
                  {...register('DB_PASSWORD', {
                    required: 'DB_PASSWORD is Required',
                  })}
                  className="border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1">
                <label htmlFor="">DB_NAME</label>
                <input
                  type="text"
                  name="DB_NAME"
                  id="DB_NAME"
                  className="border border-slate-300"
                  {...register('DB_NAME', {
                    required: 'DB_NAME is Required',
                  })}
                />
              </div>

              <div className="d-flex items-center gap-2">
                <button
                  type="submit"
                  className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  RUN COMMAND
                </button>
              </div>
              {/* <div className="flex gap-2 mt-[20px] items-center">
                            <div className="block">
                                <label htmlFor="">TABLE_NAME</label>
                                <input type="text" name="TABLE_NAME" id="TABLE_NAME" className="border border-slate-300 block" />
                            </div>
                            <div className="block">
                                <label htmlFor="">UNIQUE_ID</label>
                                <input type="text" name="" id="" className="border border-slate-300 block" />
                            </div>


                            <div className="block">
                                <label htmlFor="">COlUMN NAMES</label>
                                <Keyword title={"COLUMN NAMES"} field_prefix={"COLUMN"} />
                            </div>
                        </div> */}
              <div className="col-span-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 mt-[20px] items-end"
                  >
                    <div className="block">
                      <label htmlFor={`fields[${index}].TABLE_NAME`}>
                        TABLE_NAME
                      </label>
                      <input
                        type="text"
                        {...register(`fields[${index}].TABLE_NAME`)}
                        className="border border-slate-300 block"
                      />
                    </div>
                    <div className="block">
                      <label htmlFor={`fields[${index}].UNIQUE_ID`}>
                        UNIQUE_ID
                      </label>
                      <input
                        type="text"
                        {...register(`fields[${index}].UNIQUE_ID`)}
                        className="border border-slate-300 block"
                      />
                    </div>
                    <div className="block w-full">
                      <label htmlFor={`fields[${index}].UNIQUE_ID`}>
                        COLUMN Names
                      </label>
                      <Keyword
                        title="COLUMN NAMES"
                        field_prefix={`fields[${index}].COLUMN`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-white bg-red-500 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="d-flex items-center gap-2">
                <button
                  type="button"
                  className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={() =>
                    append({ TABLE_NAME: '', UNIQUE_ID: '', COLUMN_tags: '' })
                  }
                >
                  +
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default QueryThree;
