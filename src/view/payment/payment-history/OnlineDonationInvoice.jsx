import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetpaymentdetailsQuery } from "../../../features/userPanel/onlineDonation/onlineDonationSlice";

const OnlineDonationInvoice = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const {schoolid } = useParams(); 

  const { data, isLoading: accessTokenLogin, error } = useGetpaymentdetailsQuery(
    { tran_id, schoolid },
    { skip: !tran_id }
  );

  if (accessTokenLogin) return <div>Loading...</div>;
  if (error) return <div>Something went wrong</div>;

  return (
    <div
      className="p-6 mt-5 pb-3 font-SolaimanLipi bg-white text-sm text-black relative max-w-3xl mx-auto"
      style={{ fontSize: "0.875rem" }} // 14px
    >
    
      {/* PAID Ribbon */}
      <div className="absolute right-0 top-0 overflow-hidden w-32 h-32">
        <div
          className="absolute bg-[#22c55e] text-white font-bold text-center shadow-md w-48 py-2 -right-12 top-6 rotate-45 border-2 border-green-600"
          style={{ fontSize: "24px" }}
        >
          PAID
        </div>
      </div>

      {/* Header */}
      {/* Invoice Info */}
      <div className="mt-8 py-1 mb-1 bg-gray-100 flex flex-col gap-2">
        <h2 className="text-xl font-bold">Invoice #{data?.TransactionID}</h2>
        <p className="text-base font-medium">
          Invoice Date :{" "}
          {data?.CreateAt
            ? new Date(data.CreateAt).toLocaleDateString('en-GB')
            : "N/A"}
        </p>
      </div>

      {/* Invoiced To */}
      <div className="mt-8">
        <p className="font-bold text-[18px] mb-2">Invoiced To</p>
        <p className="text-[16px] leading-[26px]">{data?.DonorName}</p>
        <p className="text-[16px] leading-[26px]">{data?.DonorAddress}</p>
        {data?.DonorPhone !== 1 ? <p className="text-[16px] leading-[26px]">Sender Number: {data?.DonorPhone}</p> : null}
      </div>

      {/* Description Table */}
      <div className="mt-8 border border-gray-300">
        <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300 font-bold">
          <div className="col-span-3 p-1 border-r border-gray-300 text-center">
            Description
          </div>
          <div className="p-1 text-center">Total</div>
        </div>

        <div className="grid grid-cols-4 border-b border-gray-300 h-10">
          <div className="col-span-3 p-1 border-r border-gray-300">
            {/* {data?.Intent === "quota"
              ? `Addon ${data?.size} Quota`
              : `Renew For ${data?.size} years`} */}
            {/* {data?.Description ? data?.Description : ""} */}
          </div>
          <div className="p-1 text-center">BDT {data?.Amount}TK</div>
        </div>

        <div className="grid grid-cols-4 border-b border-gray-300 font-bold bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Sub Total
          </div>
          <div className="p-1 text-center">BDT {data?.Amount}TK</div>
        </div>

        <div className="grid grid-cols-4 border-t border-gray-300 font-bold bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Credit
          </div>
          <div className="p-1 text-center">BDT 0TK</div>
        </div>

        <div className="grid grid-cols-4 font-bold border-t border-gray-300 bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Total
          </div>
          <div className="p-1 text-center">BDT {data?.Amount}TK</div>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-10">
        <h3 className="font-bold text-base mb-5">Transactions</h3>
        <div className="border border-gray-300">
          <div className="grid grid-cols-4 bg-gray-100 font-bold border-b border-gray-300 text-center">
            <div className="p-1 border-r border-gray-300">Transaction Date</div>
            <div className="p-1 border-r border-gray-300">Gateway</div>
            <div className="p-1 border-r border-gray-300">Transaction ID</div>
            <div className="p-1">Amount</div>
          </div>
          <div className="grid grid-cols-4 border-b border-gray-300 text-center">
            <div className="p-1 border-r border-gray-300">
              {data?.CreateAt
                ? new Date(data.CreateAt).toLocaleDateString()
                : "N/A"}
            </div>
            <div className="p-1 border-r border-gray-300"></div>
            <div className="p-1 border-r border-gray-300">
              {data?.TransactionID}
            </div>
            <div className="p-1 text-center">BDT {data?.Amount}TK</div>
          </div>
          <div className="grid grid-cols-4 font-bold bg-gray-100">
            <div className="col-span-3 p-1 text-right border-r border-gray-300">
              Balance
            </div>
            <div className="p-1 text-center">BDT {data?.Amount}TK</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-sm text-black flex justify-between">
        <p>Manual signature is not required for system generated invoice.</p>
        <p>
          PDF Generated{" "}
          {data?.CreateAt
            ? new Date(data.CreateAt).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    </div>
  );
};
export default OnlineDonationInvoice;
