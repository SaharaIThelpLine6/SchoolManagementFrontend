import React from "react";

const InvoicePdf = () => {
  return (
    <div
      className="p-6 pb-3 font-SolaimanLipi bg-white text-xs text-black relative max-w-3xl mx-auto"
      style={{ fontSize: "0.75rem" }}
    >
      {/* PAID Ribbon - Improved styling */}
      <div className="absolute right-0 top-0 overflow-hidden w-32 h-32">
        <div
          className="absolute bg-[#22c55e] text-white font-bold text-center shadow-md w-48 py-2 -right-10 top-6 rotate-45 border-2 border-green-600"
          style={{ fontSize: "24px" }}
        >
          PAID
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <img src="/saharait.png" alt="Alpha Net Logo" className="h-24 mb-1" />
        </div>
      </div>
      <div className="text-center text-xxs text-gray-700 leading-4">
        <p className="font-bold text-xl">SAHARA IT</p>
        <p>ATTN: Farhad Hasan</p>
        <p>Masud building, Lift-2, Vangapress, Jatrabari</p>
        <p>Dhaka, Dhaka, 1236</p>
        <p>Bangladesh</p>
      </div>

      {/* Invoice Info */}
      <div className="mt-8 py-1 mb-1 bg-gray-100 flex flex-col gap-2">
        <h2 className="text-xl font-bold">Invoice #INV-2023-1001</h2>
        <p className="text-sm font-medium">Invoice Date : July 23, 2023</p>
      </div>

      {/* Invoiced To */}
      <div className="mt-8">
        <p className="font-bold">Invoiced To</p>
        <p>ABC School & College</p>
        <p>Sender Number: 01711234567</p>
        <p>123 School Street, Dhaka</p>
      </div>

      {/* Description Table */}
      <div className="mt-8 border border-gray-300">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300 font-bold">
          <div className="col-span-3 p-1 border-r border-gray-300 text-center">
            Description
          </div>
          <div className="p-1 text-center">Total</div>
        </div>

        {/* Table Row */}
        <div className="grid grid-cols-4 border-b border-gray-300 h-10">
          <div className="col-span-3 p-1 border-r border-gray-300">
            Renew For 1 years
          </div>
          <div className="p-1 text-center">BDT 5000TK</div>
        </div>

        {/* Subtotal */}
        <div className="grid grid-cols-4 border-b border-gray-300 font-bold bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Sub Total
          </div>
          <div className="p-1 text-center">BDT 5000TK</div>
        </div>

        {/* Credit */}
        <div className="grid grid-cols-4 border-t border-gray-300 font-bold bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Credit
          </div>
          <div className="p-1 text-center">BDT 0TK</div>
        </div>

        {/* Total */}
        <div className="grid grid-cols-4 font-bold border-t border-gray-300 bg-gray-100">
          <div className="col-span-3 p-1 border-r border-gray-300 text-right">
            Total
          </div>
          <div className="p-1 text-center">BDT 5000TK</div>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-10">
        <h3 className="font-bold text-sm mb-5">Transactions</h3>
        <div className="border border-gray-300">
          <div className="grid grid-cols-4 bg-gray-100 font-bold border-b border-gray-300 text-center">
            <div className="p-1 border-r border-gray-300">Transaction Date</div>
            <div className="p-1 border-r border-gray-300">Gateway</div>
            <div className="p-1 border-r border-gray-300">Transaction ID</div>
            <div className="p-1">Amount</div>
          </div>
          <div className="grid grid-cols-4 border-b border-gray-300 text-center">
            <div className="p-1 border-r border-gray-300">July 23, 2023</div>
            <div className="p-1 border-r border-gray-300">bKash</div>
            <div className="p-1 border-r border-gray-300">BK1234567890</div>
            <div className="p-1 text-center">BDT 5000TK</div>
          </div>
          <div className="grid grid-cols-4 font-bold bg-gray-100">
            <div className="col-span-3 p-1 text-right border-r border-gray-300">
              Balance
            </div>
            <div className="p-1 text-center">BDT 5000TK</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-xs text-black flex justify-between">
        <p>Manual signature is not required for system generated invoice.</p>
        <p>PDF Generated July 23, 2023</p>
      </div>
    </div>
    // <div
    //   className="p-6 pb-3 font-SolaimanLipi bg-white text-xs text-black relative max-w-3xl mx-auto"
    //   style={{ fontSize: "0.75rem" }}
    // >
    //   {/* PAID Ribbon - Improved styling */}
    //   <div className="absolute right-0 top-0 overflow-hidden w-32 h-32">
    //     <div
    //       className="absolute bg-[#22c55e] text-white font-bold text-center shadow-md w-48 py-2 -right-10 top-6 rotate-45 border-2 border-green-600"
    //       style={{ fontSize: "24px" }}
    //     >
    //       PAID
    //     </div>
    //   </div>

    //   {/* Header */}
    //   <div className="flex items-center justify-between">
    //     <div>
    //       <img src="/saharait.png" alt="Alpha Net Logo" className="h-24 mb-1" />
    //     </div>
    //   </div>
    //   <div className="text-right text-xxs text-gray-700 leading-4 mt-4">
    //     <p className="font-bold text-xl">Alpha Net</p>
    //     <p>RDR Tower, House #01, Road #01</p>
    //     <p>Airport Road, Nikunja 2</p>
    //     <p>Dhaka-1229, Bangladesh</p>
    //     <p>VAT Number: 002719901-0208</p>
    //   </div>

    //   {/* Invoice Info */}
    //   <div className="mt-8 py-1 mb-1 bg-gray-100 flex flex-col gap-2">
    //     <h2 className="text-xl font-bold">Invoice #211387</h2>
    //     <p className="text-sm font-medium">
    //       Invoice Date: Saturday, July 19th, 2025
    //     </p>
    //     <p className="text-sm font-medium">
    //       Due Date: Saturday, July 19th, 2025
    //     </p>
    //   </div>

    //   {/* Invoiced To */}
    //   <div className="mt-8">
    //     <p className="font-bold">Invoiced To</p>
    //     <p>SAHARA IT</p>
    //     <p>ATTN: Farhad Hasan</p>
    //     <p>Masud building, Lift-2, Vangapress, Jatrabari</p>
    //     <p>Dhaka, Dhaka, 1236</p>
    //     <p>Bangladesh</p>
    //   </div>

    //   {/* Description Table */}
    //   <div className="mt-8 border border-gray-300">
    //     {/* Table Header */}
    //     <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300 font-bold">
    //       <div className="col-span-3 p-1 border-r border-gray-300 text-center">
    //         Description
    //       </div>
    //       <div className="p-1 text-center">Total</div>
    //     </div>

    //     {/* Table Row */}
    //     <div className="grid grid-cols-4 border-b border-gray-300 h-10">
    //       <div className="col-span-3 p-1 border-r border-gray-300">
    //         Addon (VPS 500104 - Sahara IT) - 50GB for 13 Days bill:- (07/19/2025
    //         - 08/01/2025)
    //       </div>
    //       <div className="p-1 text-center">BDT 420TK</div>
    //     </div>

    //     {/* Subtotal */}
    //     <div className="grid grid-cols-4 border-b border-gray-300 font-bold bg-gray-100">
    //       <div className="col-span-3 p-1 border-r border-gray-300 text-right">
    //         Sub Total
    //       </div>
    //       <div className="p-1 text-center">BDT 420TK</div>
    //     </div>

    //     {/* VAT */}
    //     <div className="grid grid-cols-4 border-t border-gray-300 font-bold bg-gray-100">
    //       <div className="col-span-3 p-1 border-r border-gray-300 text-right">
    //         5.00% VAT
    //       </div>
    //       <div className="p-1 text-center">BDT 21TK</div>
    //     </div>

    //     {/* Credit */}
    //     <div className="grid grid-cols-4 border-t border-gray-300 font-bold bg-gray-100">
    //       <div className="col-span-3 p-1 border-r border-gray-300 text-right">
    //         Credit
    //       </div>
    //       <div className="p-1 text-center">BDT 0TK</div>
    //     </div>

    //     {/* Total */}
    //     <div className="grid grid-cols-4 font-bold border-t border-gray-300 bg-gray-100">
    //       <div className="col-span-3 p-1 border-r border-gray-300 text-right">
    //         Total
    //       </div>
    //       <div className="p-1 text-center">BDT 441TK</div>
    //     </div>
    //   </div>

    //   {/* Transactions */}
    //   <div className="mt-10">
    //     <h3 className="font-bold text-sm mb-5">Transactions</h3>
    //     <div className="border border-gray-300">
    //       <div className="grid grid-cols-4 bg-gray-100 font-bold border-b border-gray-300 text-center">
    //         <div className="p-1 border-r border-gray-300">Transaction Date</div>
    //         <div className="p-1 border-r border-gray-300">Gateway</div>
    //         <div className="p-1 border-r border-gray-300">Transaction ID</div>
    //         <div className="p-1">Amount</div>
    //       </div>
    //       <div className="grid grid-cols-4 border-b border-gray-300 text-center">
    //         <div className="p-1 border-r border-gray-300">
    //           Saturday, July 19th, 2025
    //         </div>
    //         <div className="p-1 border-r border-gray-300">
    //           bKash, Rocket, Nexus & Bangladeshi Debit or Credit Card
    //         </div>
    //         <div className="p-1 border-r border-gray-300">
    //           319dd256-649a-11f0-943d-1a2d4d0cded7
    //         </div>
    //         <div className="p-1">BDT 441TK</div>
    //       </div>
    //       <div className="grid grid-cols-4 font-bold bg-gray-100">
    //         <div className="col-span-3 p-1 text-right border-r border-gray-300">
    //           Balance
    //         </div>
    //         <div className="p-1 text-center">BDT 0TK</div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Footer */}
    //   <div className="mt-10 text-xs text-black flex justify-between">
    //     <p>Manual signature is not required for system generated invoice.</p>
    //     <p>PDF Generated on Saturday, July 19th, 2025</p>
    //   </div>
    // </div>
  );
};

export default InvoicePdf;
