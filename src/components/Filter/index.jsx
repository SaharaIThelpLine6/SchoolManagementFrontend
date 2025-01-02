const Filter = () => {
    return (
        <div className="flex flex-col p-4 pl-10">

            <div className="flex gap-4 text-[14px] text-[rgb(51,51,51)]">
                {/* Filter by Type
                <div className="relative inline-flex items-center gap-x-1">
                   
                    <select className="appearance-none top-1/2 rounded-full px-2 py-0.5 bg-[#EDEDED] text-[14px] text-[rgb(51,51,51)]">
                        <option value="">Type</option>
                        <option value="">Document</option>
                        <option value="">Image</option>
                        <option value="">Video</option>
                    </select>
                
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 9l6 6l6 -6" />
                        </svg>
                    </div>
                </div> */}

                {/*Filter by Last Modified */}
                {/*Filter by Last Modified */}
                <div className="relative outline-none">
                    <select className="rounded-full outline-none py-0.5 px-2 bg-[#EDEDED]">
                        <option value="">Last Modified</option>
                        <option value="">Today</option>
                        <option value="">Last Week</option>
                        <option value="">Last Month</option>
                    </select>
                </div>
                {/* Filter by Date Added*/}
                <div className="relative outline-none">
                    <select className="rounded-full outline-none px-2 py-0.5 bg-[#EDEDED]">
                        <option value="">Date Added</option>
                        <option value="">Newest First</option>
                        <option value="">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>
        
    )
}

export default Filter;