import { useState, useEffect } from 'react';
import Fourdots from '../../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getUserInfo } from '../../utils/read/api';
import { useDispatch, useSelector } from 'react-redux';
import { setItemsPerPage } from '../../features/pagination/paginationSlice';
import { logout } from '../../features/auth/authSlice';
import { fetchSingleUser, setEditMode } from '../../features/userInfo/userInfoSlice';
import Pagination from '../Pagination/Pagination';

const TableOne = () => {
  const [brandData, setBrandData] = useState([]);
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const currentPage = useSelector((state) => state.pagination.currentPage);
  const dispatch = useDispatch();
  const tokenDux = useSelector((state) => state.auth.token)

  const [totalPage, setTotalPage] = useState();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserInfo(itemPerPage, tokenDux, currentPage);
        setBrandData(data.users);
        setTotalPage(data.totalPages);
        console.log(data);

      } catch (error) {
        // dispatch(logout());
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [itemPerPage,currentPage, tokenDux]);

  const handleDelete = (index) => {
    const confirmDelete = window.confirm('Are you sure delete this?');
    if (confirmDelete) {
      const updatedData = brandData.filter((_, i) => i !== index);
      setBrandData(updatedData);
    }
  };

  return (
    <div className="rounded-sm bg-white pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
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
                <td className="py-1 px-4 border border-white">
                  <button type='button' className='text-blue-500 hover:text-blue-700' onClick={() => {
                    dispatch(setEditMode(1))
                    dispatch(fetchSingleUser(brand.UserID))
                  }}>
                    <FaEdit />
                  </button>
                </td>
                <td className="py-1 px-4 border border-white ">
                  <button className='text-red-500 hover:text-red-700'>
                    <FaTrash /> 
                  </button>
                </td>
                <td className="py-1 px-4 border border-white">
                  <p className="text-black dark:text-white">{brand.UserCode}</p>
                </td>

                <td className="py-1 px-4 border border-white ">
                  <p className="text-black dark:text-white">{brand.UserName}</p>
                </td>
                <td className="py-1 px-4 border border-white">
                  <p className="text-black dark:text-white">{brand.FatherName}</p>
                </td>
                <td className="py-1 px-4 border border-white">
                  <p className="text-black dark:text-white">{brand.Mobile1}</p>
                </td>
                <td className="py-1 px-4 border border-white">
                  <p className="text-black dark:text-white">{brand.UserType.TypeName}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*Pagination Start*/}   
      <div className='flex items-center my-2'>
        <div className='pl-2'>
          <span className="text-md text-gray-800">
            Showing {" "}
            <span className="font-semibold text-black">
              {currentPage} {" "}
            </span>
            - {" "}
            <span className="font-semibold text-black">
              {itemPerPage} {" "}
            </span>
            of {" "}
            <span className="font-semibold text-black">
              {totalPage} {" "}
            </span>
            Pages
          </span>
        </div>
        <div className='ml-auto'>
          <Pagination totalpages={totalPage}/>
        </div>
      </div>
      {/*Pagination End*/}
    </div>
  );
};

export default TableOne;
