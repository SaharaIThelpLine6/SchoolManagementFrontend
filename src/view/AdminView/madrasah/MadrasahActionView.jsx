// src/view/AdminView/madrasah/MadrasahActionView.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { closeModal } from '../../../features/modal/modalSlice';
import useTranslate from '../../../utils/Translate';

const BASE_DOMAIN = import.meta.env.VITE_MIAN_DOMAIN || "http://localhost:8000";

const MadrasahActionView = ({ id, meta }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  
  // DefaultModal থেকে meta এর মাধ্যমে row data রিসিভ করছি
  const rowData = meta?.rowData || {};
  
  // ডাটাবেস থেকে আসা আগের RedirectUrl থাকলে সেটি বসবে, না থাকলে ফাঁকা
  const [redirectUrl, setRedirectUrl] = useState(rowData.RedirectUrl || '');

  const handleSaveRedirect = async () => {
    try {
      // TODO: এখানে আপনার API কল হবে 
      // উদাহরণ: await updateMadrasahRedirectUrl({ id, redirectUrl }).unwrap();

      console.log('Saving redirect URL for madrasah:', id, redirectUrl);
      
      Swal.fire('Saved!', 'Redirect URL updated successfully.', 'success');
      
      // কাজ শেষে মডেল ক্লোজ করে দেওয়া
      dispatch(closeModal());
    } catch (error) {
      Swal.fire('Error!', 'Failed to update Redirect URL.', 'error');
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translate('Main Domain')}
        </label>
        <input
          type="text"
          value={`${BASE_DOMAIN}/${id}`}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {translate('Redirect URL')}
        </label>
        <input
          type="text"
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
          placeholder="Enter redirect URL"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={handleSaveRedirect}
        className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        {translate('Save Redirect URL')}
      </button>
    </div>
  );
};

export default MadrasahActionView;
