const Notification = () => {
    return(
        <div>
                <div className='
                    flex
                    text-[14px] 
                    font-SolaimanLipi
                    bg-[#323232] 
                    text-[rgba(255,255,255,.7)]                 
                    justify-between                 
                    items-center
                    py-2
                    px-2
                    rounded-[4px]
                    font-normal
                    '
                    style={{ boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)' }}>
                    দুঃখিত, কোন তথ্য পাওয়া যায়নি!
                    <button className='bg-transparent text-[#ff4dcb] -translate-x-3'>Close</button>
                </div>
            </div>
    )
}

export default Notification;