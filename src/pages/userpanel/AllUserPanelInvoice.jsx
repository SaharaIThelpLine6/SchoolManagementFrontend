import { FormProvider, useForm } from 'react-hook-form';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import { useGetAllPaymentInvoicesQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import useTranslate from '../../utils/Translate';

const AllUserPanelInvoice = () => {
  const translate = useTranslate();
  const method = useForm();
  const { data, isLoading, error } = useGetAllPaymentInvoicesQuery({
    startDate: '2026-01-01',
    endDate: '2026-02-04',
  });

  console.log(data, 'data');

  const invoicesList = data?.data || [];

  return (
    <FormProvider {...method}>
      <div className="p-4 space-y-4 mb-20">
        <div className="flex justify-between items-center gap-3">
          <DatePickerOne
            dateCalender={`${translate('Date')}`}
            placeholder={''}
            registerKey={'DateValue'}
            require={'Date Require'}
          />
          <DatePickerOne
            dateCalender={`${translate('Date')}`}
            placeholder={''}
            registerKey={'DateValue'}
            require={'Date Require'}
          />
        </div>
        {invoicesList.map((invoice, index) => (
          <div
            key={invoice.GOPIID}
            className="bg-white shadow rounded-xl overflow-hidden"
          >
            {/* Invoice Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-lg">
                    Invoice #{index + 1}
                  </h2>
                  {/* <p className="text-sm text-gray-600">
                  Transaction ID: <br /> {invoice.TransactionID}
                </p> */}
                </div>

                {/* <div className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                <span className="text-green-600 font-semibold">
                  {invoice.PaymentStatus}
                </span>
              </div> */}
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
              <p>
                <span className="font-medium">Name:</span>{' '}
                {invoice.UserDetails.UserName}
              </p>
              <p>
                <span className="font-medium">Mobile:</span>{' '}
                {invoice.UserDetails.Mobile1}
              </p>
            </div> */}
            </div>

            {/* Table (Desktop + Mobile) */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left whitespace-nowrap">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">
                      Session
                    </th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">
                      Month
                    </th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">
                      Amount (৳)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoice.InvoiceDetails.map((item) => (
                    <tr key={item.GOPIDID} className="border-t">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.FeeType}
                      </td>
                      <td className="px-4 py-3">{item.SessionName}</td>
                      <td className="px-4 py-3">{item.MonthName}</td>
                      <td className="px-4 py-3 text-center font-medium">
                        {item.Amount}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-base">
                      ৳ {invoice.TotalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
        {/* <PaymentAllIncoivesPdf invoices={invoicesList} /> */}
      </div>
    </FormProvider>
  );
};

export default AllUserPanelInvoice;
