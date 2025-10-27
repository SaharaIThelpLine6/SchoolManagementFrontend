import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultInput from '../../../components/Forms/DefaultInput';
import Textarea from '../../../components/Forms/Textarea';
import DefaultRadio from '../../../components/Radio/DefaultRadio';

const FeeSMSTamplateModal = () => {
  const methods = useForm();
  const [templateName, setTemplateName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const handlePreview = () => {
    // Logic for preview
    console.log('Preview clicked');
  };

  const handleSave = () => {
    // Logic for save
    console.log('Save clicked');
  };

  const feeStatus = [
    { id: 1, name: 'সাদা-কালা' },
    { id: 2, name: 'রঙিন' },
    { id: 3, name: 'প্রেসে ছাপানো কাগজে' },
  ];
  const permissionFeeStatus = [
    { id: 1, name: 'হ্যাঁ' },
    { id: 2, name: 'না' },
  ];

  return (
    <FormProvider {...methods}>
      <div className="bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-xl font-semibold">Demo Madrasa</h2>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* Template Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <DefaultInput registerKey={'UserID'} label={'User ID'} />
              </div>

              <div>
                <DefaultInput registerKey={'UserID'} label={'Receipt No'} />
              </div>
            </div>

            {/* Student Name & Father Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <DefaultInput registerKey={'UserID'} label={'Total Fee'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission:
                </label>
                <DefaultRadio
                  options={permissionFeeStatus}
                  registerKey="PIsActive"
                  defaultValue={1}
                />
              </div>
            </div>
            <div>
              <Textarea label={'Message'} registerKey={'Message'} />
            </div>

            {/* Buttons Row */}
            <div className="flex justify-between space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={handlePreview}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Preview
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save
              </button>
            </div>
            <div className="flex justify-between space-x-4 pt-4 border-t border-gray-200">
              <DefaultRadio
                options={feeStatus}
                label={'Receipt Type'}
                registerKey="IsActive"
                defaultValue={1}
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default FeeSMSTamplateModal;
