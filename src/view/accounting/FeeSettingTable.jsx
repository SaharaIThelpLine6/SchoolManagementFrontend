import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import DeleteButton from '../../components/Button/DeleteButton';
import EditButton from '../../components/Button/EditButton';
import Loading from '../../components/Loading/Loading';
import { permissionsDataList } from '../../Data/permissions';
import {
  useDeleteStudentFeeSettingsMutation,
  useGetStudentFeeSettingsQuery,
} from '../../features/feeCollection/feeCollectionSlice';
import { ViewPermission } from '../../Routes/ViewPermission';
import bnBijoy2Unicode from '../../utils/conveter';
import useTranslate from '../../utils/Translate';

const FeeSettingTable = ({ setEditData, editId, filter }) => {
  console.log(filter, 'filter');
  const translate = useTranslate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const {
    data: studentFeeSettingData,
    error,
    isFetching,
  } = useGetStudentFeeSettingsQuery({
    sessionId: filter.sessionId,
    classId: filter.classId,
    sfgnid: filter.SLID,
  });

  const [deleteStudentSettings] = useDeleteStudentFeeSettingsMutation();

  useEffect(() => {
    if (!studentFeeSettingData || !editId) return;

    const data = studentFeeSettingData.find((i) => i.SFSID === editId);
    setEditData(data);
  }, [studentFeeSettingData, editId, setEditData]);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(studentFeeSettingData.map((row) => row.SFSID));
    }
    setAllSelected(!allSelected);
  };

  const handleRowToggle = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleEditOpenModal = (id) => {
    setEditData(studentFeeSettingData.find((i) => i.SFSID === id));
  };

  // Single delete with SweetAlert
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'আপনি কি এই ফি সেটিং মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
    });

    if (result.isConfirmed) {
      try {
        // 🧩 API call — Send body as { SFSID: id }
        const response = await deleteStudentSettings({ SFSID: id }).unwrap();

        // 🧹 Update UI state
        setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: response?.message || 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonText: 'ঠিক আছে',
        });
      } catch (error) {
        console.log(error, 'error');

        // 🔍 যদি backend থেকে custom error আসে
        const errorMsg =
          error?.data?.error ||
          'ডাটা মুছে ফেলা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMsg,
          confirmButtonText: 'ঠিক আছে',
        });
      }
    }
  };

  // Multiple delete with SweetAlert
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `আপনি কি ${selectedRows.length}টি ফি সেটিং মুছে ফেলতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল করুন',
    });

    if (result.isConfirmed) {
      try {
        await deleteStudentSettings(selectedRows).unwrap(); // multiple delete
        setSelectedRows([]);
        setAllSelected(false);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonText: 'ঠিক আছে',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'ডাটা মুছে ফেলা যায়নি। আবার চেষ্টা করুন।',
          confirmButtonText: 'ঠিক আছে',
        });
      }
    }
  };
  if (isFetching) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center">
        <p>No data found!</p>
      </div>
    );
  }
  return (
    <div className="bg-white py-4 rounded-lg shadow-sm">
      <div className="flex justify-end mb-2">
        {selectedRows.length > 0 && (
          <ViewPermission
            permissionId={permissionsDataList.fee_setting}
            permissionType="delete"
            empty={true}
          >
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              Delete Selected
            </button>
          </ViewPermission>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b border-gray-200 text-center w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider w-32">
                {translate('Action')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-left text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                {translate('Class Name')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-left text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                {translate('Fee Name')}
              </th>
              <th className="p-3 whitespace-nowrap border-b border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Residence')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Residence')} <br /> {translate('Old')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Non-resident')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Non-resident')} <br /> {translate('Old')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Daycare')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Male Daycare')} <br /> {translate('Old')}
              </th>
              <th className="p-3 whitespace-nowrap border-b border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Residence')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Residence')} <br /> {translate('Old')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Non-resident')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Non-resident')} <br /> {translate('Old')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Daycare')} <br /> {translate('New')}
              </th>
              <th className="p-3 border-b whitespace-nowrap border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                {translate('Female Daycare')} <br /> {translate('Old')}
              </th>
              <th className="p-3 border-b border-gray-200 text-center text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                SFSID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studentFeeSettingData?.map((row) => (
              <tr
                key={row.SFSID}
                className={`${
                  selectedRows.includes(row.SFSID)
                    ? 'bg-orange-50 hover:bg-orange-100'
                    : 'hover:bg-gray-50'
                } transition-colors duration-150`}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.SFSID)}
                    onChange={() => handleRowToggle(row.SFSID)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <ViewPermission
                      permissionId={permissionsDataList.fee_setting}
                      permissionType="edit"
                      empty={true}
                    >
                      <EditButton
                        onClick={() => handleEditOpenModal(row.SFSID)}
                      />
                    </ViewPermission>
                    <ViewPermission
                      permissionId={permissionsDataList.fee_setting}
                      permissionType="delete"
                      empty={true}
                    >
                      <DeleteButton onClick={() => handleDelete(row.SFSID)} />
                    </ViewPermission>
                  </div>
                </td>
                <td className="p-3 text-gray-800 font-medium">
                  {bnBijoy2Unicode(
                    row.ClassName ? row.ClassName : row.Class?.ClassName
                  )}
                </td>
                <td className="p-3 text-gray-600">
                  {bnBijoy2Unicode(
                    row.SlName ? row.SlName : row.SubLedger?.SlName
                  )}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleAbaNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleAbaOld}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleOnaNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleOnaOld}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleDayNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.MaleDayOld}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleAbaNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleAbaOld}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleOnaNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleOnaOld}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleDayNew}
                </td>
                <td className="p-3 text-center text-gray-600">
                  {row.FemaleDayOld}
                </td>
                <td className="p-3 text-center text-gray-600 font-mono">
                  {row.SFSID}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeSettingTable;
