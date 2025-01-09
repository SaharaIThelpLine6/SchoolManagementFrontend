import { useState, useEffect } from 'react';
import Fourdots from '../../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getUserInfo } from '../../utils/read/api';
import { useDispatch, useSelector } from 'react-redux';
import { setItemsPerPage } from '../../features/pagination/paginationSlice';
import { logout } from '../../features/auth/authSlice';

const TableOne = () => {
  const [brandData, setBrandData] = useState([]);
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const dispatch = useDispatch();
  const tokenDux = useSelector((state)=>state.auth.token)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserInfo(itemPerPage,tokenDux);
        setBrandData(data);
        console.log(data);

      } catch (error) {
        // dispatch(logout());
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [itemPerPage, tokenDux]);

  const handleDelete = (index) => {
    const confirmDelete = window.confirm('Are you sure delete this?');
    if (confirmDelete) {
      const updatedData = brandData.filter((_, i) => i !== index);
      setBrandData(updatedData);
    }
  };

  return (
    <div className="rounded-sm bg-white pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <select className="bg-transparent pl-2" onChange={(e) => dispatch(setItemsPerPage(e.target.value))}>
          <option value="2">2</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <table className="w-full table-auto border-collapse">
          <thead className='bg-[#3F4885] text-white h-fit'>
            <tr className="text-center">
              {[
                <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" />,
                <img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" />,
                'দাখেলা', 'ইউজার নাম', 'পিতার নাম', 'মোবাইল নাম্বার', 'ইউজার ধরন'
              ].map((header, index) => (
                <th key={index} className="px-4 py-1 font-medium border border-white">
                  {typeof header === 'string' ? header : <div className="flex justify-center">{header}</div>}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {brandData.length && brandData.map((brand, key) => (
              <tr key={key} className={`${key % 2 !== 0 ? 'bg-[#f5f3f3]' : ''} border border-white`}>
                {[
                  <FaEdit key={`edit-${key}`} />,
                  <FaTrash key={`trash-${key}`} onClick={() => handleDelete(key)} />,
                  brand.UserCode, 
                  brand.UserName, 
                  brand.FatherName, 
                  brand.Mobile1, 
                  brand.UserType.TypeName
                ].map((data, index) => (
                  <td key={index} className="py-1 px-4 border border-white dark:border-strokedark">
                    {typeof data === 'string' ? (
                      <p className="text-black dark:text-white">{data}</p>
                    ) : (
                      <button className={index === 0 ? 'text-blue-500 hover:text-blue-700' : 'text-red-500 hover:text-red-700'}>
                        {data}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOne;
