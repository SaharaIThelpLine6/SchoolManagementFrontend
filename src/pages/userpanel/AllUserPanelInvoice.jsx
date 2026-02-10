import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import { useGetAllPaymentInvoicesQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import useTranslate from '../../utils/Translate';
import PaymentAllIncoivesPdf from './userpanelPdf/PaymentAllIncoivesPdf';
import PaymentSingleIncoivesPdf from './userpanelPdf/PaymentSingleIncoivesPdf';

const AllUserPanelInvoice = () => {
  const translate = useTranslate();
  const method = useForm();

  const { watch } = method;
  const [startDate, endDate] = watch(['startDate', 'endDate']);

  const formatDate = (date) => {
    if (!date) return ''; // handle empty
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  console.log(formatDate(startDate), formatDate(endDate), 'Dates');

  const [singleInvoice, setSingleInvoice] = useState(null);
  const [printType, setPrintType] = useState(null); // 'all' | 'single'

  const { data: filteredInvoices } = useGetAllPaymentInvoicesQuery({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  });

  const invoicesList = filteredInvoices?.data || [];

  console.log(invoicesList, 'invoicesList');

  // ✅ Print All
  const handlePrintPDf = () => {
    if (invoicesList.length > 0) {
      setPrintType('all');
      setSingleInvoice(null);
      setTimeout(() => window.print(), 100);
    } else {
      toast.error('ডেটা পাওয়া যায়নি');
    }
  };

  // ✅ Print Single
  const handleSinglePrintPDf = (invoice) => {
    if (invoice) {
      setSingleInvoice(invoice);
      setPrintType('single');
      setTimeout(() => window.print(), 100);
    } else {
      toast.error('ডেটা পাওয়া যায়নি');
    }
  };

  // ✅ print শেষে reset (important)
  window.onafterprint = () => {
    setPrintType(null);
    setSingleInvoice(null);
  };

  return (
    <FormProvider {...method}>
      {/* ================= SCREEN VIEW ================= */}
      <div className="p-4 space-y-4 mb-20 print:hidden">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-xl font-bold text-black">
            {translate('All Invoices')}
          </h2>
          <Button onClick={handlePrintPDf}>Print All Invoices</Button>
        </div>

        {/* <div className="flex gap-3">
          <DatePickerOne
            dateCalender={translate('Start Date')}
            registerKey="startDate"
            require="Date Required"
          />
          <DatePickerOne
            dateCalender={translate('EndDate')}
            registerKey="endDate"
            require="Date Required"
          />
        </div> */}

        {invoicesList.map((invoice, index) => (
          <div key={invoice.GOPID} className="bg-white shadow rounded-xl">
            <div className="p-4 border-b bg-gray-50 flex justify-between">
              <h2 className="font-semibold text-lg">Invoice #{index + 1}</h2>
              {/* <Button onClick={() => handleSinglePrintPDf(invoice)}>
                Print Invoice
              </Button> */}
              <div>
                <span className="font-medium text-gray-700">তারিখ:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(invoice.CreatedAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Fee Type</th>
                    <th className="px-4 py-2">Session</th>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.InvoiceDetails.map((item) => (
                    <tr key={item.GOPIDID} className="border-t">
                      <td className="px-4 py-2">{item.FeeType}</td>
                      <td className="px-4 py-2">{item.SessionName}</td>
                      <td className="px-4 py-2">{item.MonthName}</td>
                      <td className="px-4 py-2 text-right">{item.Amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-2 text-right font-semibold"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2 text-right font-bold">
                      ৳ {invoice.TotalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PRINT VIEW ================= */}
      {printType === 'all' && (
        <div className="bg-white relative hidden print:block">
          <PaymentAllIncoivesPdf invoices={invoicesList} />
        </div>
      )}

      {/* {printType === 'single' && singleInvoice && (
        <div className="bg-white relative hidden print:block">
          <PaymentSingleIncoivesPdf invoice={singleInvoice} />
        </div>
      )} */}
    </FormProvider>
  );
};

export default AllUserPanelInvoice;
