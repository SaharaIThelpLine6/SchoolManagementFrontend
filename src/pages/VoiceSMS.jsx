import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import ParentsAndAllUserTable from '../view/general-information/sms/ParentsAndAllUserTable';
import OthersTable from '../view/general-information/sms/OthersTable';
import AllUsersData from '../view/general-information/sms/AllUsersData';
import { showModal } from '../utils/ModalControlar';
import { useGetCheckBalanceQuery } from '../features/sms/smsSlice';
import { clearAllUsersData, clearParentsData } from '../features/student/studentSlice';
import { setPageName } from '../features/auth/authSlice';
import VoiceRecording from '../components/VoiceRecording';

const recipientOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Parents', value: 'guardian' },
  { label: 'All Users', value: 'all_users' },
  { label: 'Others', value: 'others' },
];

const VoiceSMS = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { data: checkBalanceData } = useGetCheckBalanceQuery();
  const [selectedRecipient, setSelectedRecipient] = useState('single');
  const [mobileNumbers, setMobileNumbers] = useState(['']);
  const [othersMobileNumbers, setOthersMobileNumbers] = useState(['']);
  const [mobileError, setMobileError] = useState('');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const validateMobileNumber = (number) => {
    if (!number) return '';
    if (number.length !== 11) return translate('Mobile number must be 11 digits');
    const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
    if (!validPrefixes.includes(number.substring(0, 3))) {
      return translate('Invalid mobile number. Must start with 013, 014, 015, 016, 017, 018, or 019');
    }
    return '';
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').substring(0, 11);
    setMobileNumbers([value]);
    setMobileError(validateMobileNumber(value));
  };

  const handleChangeRecipient = (value) => {
    setSelectedRecipient(value);
    setMobileNumbers(['']);
    setMobileError('');
    dispatch(clearParentsData());
    dispatch(clearAllUsersData());
  };

  return (
    <div className="sm:gap-3 font-default bg-white md:p-4 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Voice SMS</h2>
        <div className="flex flex-row justify-center sm:justify-end items-end md:items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {translate('Balance') + ' :'}
          </h2>
          <div className="flex gap-3 text-sm md:text-base text-gray-700 font-medium">
            <h3>mask: {checkBalanceData?.mask}</h3>
            <h3>nonmask: {checkBalanceData?.nonmask}</h3>
            {checkBalanceData?.voice != null && <h3>voice: {checkBalanceData.voice}</h3>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 p-4 gap-10">
        <div className="rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-2 pb-3">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">
              Voice message
            </h2>
            <div className="flex justify-end items-center">
              <Button onClick={() => showModal('Payment', 'PAYMENT', 3)}>
                {translate('Buy SMS')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {recipientOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-2 space-x-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300"
              >
                <input
                  type="radio"
                  name="messageRecipient"
                  value={option.value}
                  checked={selectedRecipient === option.value}
                  onChange={() => handleChangeRecipient(option.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm 2xl:text-base font-semibold 2xl:font-bold text-gray-700">
                  {translate(option.label)}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-3 space-y-4">
            <Input
              label="Mobile Number"
              placeholder={translate('Enter mobile number')}
              type="tel"
              name="mobile"
              value={mobileNumbers[0] || ''}
              onChange={handleMobileChange}
              disabled={selectedRecipient !== 'single'}
              error={mobileError}
              helperText={mobileError}
            />
            <VoiceRecording />
          </div>
        </div>

        {selectedRecipient === 'guardian' && (
          <ParentsAndAllUserTable
            pageTitle={pageTitle}
            checkedValue={selectedRecipient}
          />
        )}
        {selectedRecipient === 'all_users' && (
          <AllUsersData pageTitle={pageTitle} />
        )}
        {selectedRecipient === 'others' && (
          <OthersTable
            pageTitle={pageTitle}
            setMobileNumbers={setOthersMobileNumbers}
            mobileNumbers={othersMobileNumbers}
          />
        )}
      </div>
    </div>
  );
};

VoiceSMS.propTypes = {
  pageTitle: PropTypes.string,
};

export default VoiceSMS;
