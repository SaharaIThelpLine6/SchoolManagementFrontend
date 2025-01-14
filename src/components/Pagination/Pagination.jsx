import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPage } from "../../features/pagination/paginationSlice";
import { useState } from 'react';




const Pagination = (props) => {
    const currentPage = useSelector((state) => state.pagination.currentPage);
    const dispatch = useDispatch();
    const [isActive, setIsActive] = useState(currentPage);

    // Number of pages to display at a time
    const pageLimit = 5;

    const nextPageNumber = (index) => {
        if (index >= 1 && index<= props.totalpages) {
            dispatch(setCurrentPage(index));
            setIsActive(index);
        } 

    };

    // Calculate the start and end of the visible page range
    const startPage = Math.floor((currentPage - 1)/pageLimit)*pageLimit + 1;
    const endPage = Math.min(startPage + pageLimit - 1, props.totalpages);

    return (
        <div>
            <div className="">
                <nav className='pr-2'>
                    <ul className="flex items-center -space-x-px h-6">
                        {/* Previous Button */}
                        <li>
                            <a
                                href="#"
                                className="flex items-center justify-center px-2 border border-e py-1 ms-0 leading-tight text-gray-600 border-gray-300 rounded-s-sm hover:text-white"
                                onClick={() => nextPageNumber(currentPage - 1)}
                            >
                                <span className="sr-only">Previous</span>
                                <svg
                                    className="w-3 h-3 rtl:rotate-180"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 6 10"
                                >
                                    <path stroke="currentColor" d="M5 1 1 5l4 4" />
                                </svg>
                            </a>
                        </li>

                        {/* Page Numbers */}
                        {Array.from({ length: pageLimit }, (_, i) => startPage + i).map((pageNumber) => (
                            <li key={pageNumber} className={`${isActive === pageNumber ? "bg-gray-200" : ""}`}>
                                <a
                                    href="#"
                                    className="flex items-center justify-center px-2 border border-e leading-tight text-gray-500 hover:text-white"
                                    onClick={() => nextPageNumber(pageNumber)}
                                >
                                    {pageNumber}
                                </a>
                            </li>
                        ))}

                        {/* Next Button */}
                        <li>
                            <a
                                href="#"
                                className="flex items-center justify-center px-2 border border-e py-1 leading-tight text-gray-500 rounded-e-sm hover:text-white"
                                onClick={() => nextPageNumber(currentPage + 1)}
                            >
                                <span className="sr-only">Next</span>
                                <svg
                                    className="w-3 h-3 rtl:rotate-180"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 6 10"
                                >
                                    <path stroke="currentColor" d="m1 9 4-4-4-4" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* <nav className='pr-2'>
                    <ul className="flex items-center -space-x-px h-6">
                        <li>                        
                            <a href="#" className="flex items-center justify-center px-2 border border-e py-1 ms-0 leading-tight text-gray-600  border-gray-300 rounded-s-sm hover:text-white" onClick={() => nextPageNumber(currentPage - 1)}>
                                <span className="sr-only">Previous</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" d="M5 1 1 5l4 4" />
                                </svg>
                            </a>
                        </li>                    
                        <li className={`${isActive === 1 ? "" : ""}`}>
                            <a href="#" className="flex items-center justify-center px-2 border border-e leading-tight text-gray-500hover:text-white" onClick={() => nextPageNumber(1)}>1</a>
                        </li>
                        <li className={`${isActive === 2 ? "" : ""}`}>
                            <a href="#" className="flex items-center justify-center px-2 border border-e leading-tight text-gray-500   
                            hover:text-white" onClick={() => nextPageNumber(2)}>2</a>
                        </li>
                        <li className={`${isActive === 3 ? "" : ""}`}>
                            <a href="#" aria-current="page" className="z-10 flex items-center justify-center px-2 border border-e leading-tight text-gray-500   hover:text-white" onClick={() => nextPageNumber(3)}>3</a>
                        </li>
                        <li className={`${isActive === 4 ? "" : ""}`}>
                            <a href="#" className="flex items-center justify-center px-2 border border-e leading-tight text-gray-500   hover:text-white" onClick={() => nextPageNumber(4)}>4</a>
                        </li>
                        <li className={`${isActive === 5 ? "" : ""}`}>
                            <a href="#" className="flex items-center justify-center px-2 border border-e leading-tight text-gray-500 bg-white  hover:text-white" onClick={() => nextPageNumber(5)}>5</a>
                        </li>                        
                        <li>
                            <a href="#" className="flex items-center justify-center px-2 border border-e py-1 leading-tight text-gray-500  rounded-e-sm  hover:text-white" onClick={() => nextPageNumber(currentPage + 1)}>
                                <span className="sr-only">Next</span>
                                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" d="m1 9 4-4-4-4" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav> */}
            </div>
        </div>

    )
}
export default Pagination;

