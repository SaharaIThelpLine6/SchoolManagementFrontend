const Filter = () => {
    return (
        <div className="flex flex-col px-5 py-2 ">

            <div className="flex gap-4 text-[14px] text-[rgb(51,51,51)]">


       
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