import useTranslate from '../utils/Translate';
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import SortableTable from '../components/Tables/SortableTable';
import EditButton from '../components/Button/EditButton';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../components/Button/Button';


const ExamHallList = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const { data: examHallList } = useGetExamHallListQuery();

    const handleHallEdit = (hall) => {
        navigate(`/exam/exam-halledit/${hall.HallID}`, {
            state: { hall },
        });
    };
    const methods = useForm()
    const columns = [
        {
            title: translate('Action'),
            hozAlign: 'center',
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    <EditButton onClick={() => handleHallEdit(row)} />
                </div>
            ),
        },
        {
            title: translate('ID'),
            hozAlign: 'center',
            render: (row, index) => (
                <div className="flex justify-center items-center gap-2">
                    {index + 1}
                </div>
            ),
        },
        {
            title: translate('Hall Name'),
            field: 'HallName',
            hozAlign: 'center'
        },
        {
            title: translate('Number of sets'),
            field: 'TotalSeats',
            hozAlign: 'center'
        },

    ];

    const { handleSubmit, control, reset } = methods;


    return (
        <div className="p-7 font-SolaimanLipi">
            <div className='mb-4 text-end'>
                <Link className='py-2 px-2 bg-blue-500 text-white rounded-[4px] mb-2' to='/exam/exam-hallsetup'> {translate("Add Exam Hall")} </Link>
            </div>
            <SortableTable
                columns={columns}
                data={examHallList}
                isFilterColumn={false}
            />
        </div>
    );
};

export default ExamHallList;


/*class SSLCommerzController extends Controller
{
    public function initiatePayment($order_id)
    {
        $order = Order::findOrFail($order_id);

        $order->payment->update([
            'payment_process' => 1,
        ]);
        $discountAmount = floor($order->amount * 0.10);
        $postData = [
            'store_id'     => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'total_amount' => $order->amount - $discountAmount,
            'currency'     => 'BDT',
            'tran_id'      => uniqid($order->id . '_'),

            'success_url'  => route('ssl.success'),
            'fail_url'     => route('ssl.fail'),
            'cancel_url'   => route('ssl.cancel'),

            'cus_name'     => $order->name,
            'cus_phone'    => $order->phone,
            'cus_email'    => $order->id . 'customer@gmail.com',
            'cus_add1'     => $order->address,
            'cus_city'     => $order->area,
            'cus_country'  => 'Bangladesh',

            'value_a'      => $order->id,
            'value_d'      => $discountAmount,
        ];

        $apiUrl = config('services.sslcommerz.sandbox')
            ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

        $handle = curl_init($apiUrl);
        curl_setopt_array($handle, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($handle);
        curl_close($handle);

        $result = json_decode($response, true);

        if (!empty($result['GatewayPageURL'])) {
            return redirect()->away($result['GatewayPageURL']);
        }

        return back()->with('error', 'SSLCommerz payment failed.');
    }



    public function success(Request $request)
    {

        $currencyAmount = (float) ($request->currency_amount ?? 0);
        $currencyRate   = (float) ($request->currency_rate ?? 0);
        $paymentDiscount = (float) ($request->value_d ?? 0);

        $order = Order::where('id', $request->value_a)->first();

        $order->discount = $paymentDiscount;
        $order->amount = $order->amount - ($currencyAmount * $currencyRate) - $paymentDiscount;
        if($order->order_status == 2) {
            $order->order_status = 1;
        }
        $order->save();

        $payment = Payment::where(['order_id' => $order->id])->first();
        $purchaseEventID = uniqid();
        if ($payment->payment_process != null) {
            Session::put('purchase_event_id', $purchaseEventID);
            Session::put('fb_am_phone', preg_replace('/\D/', '', $order->customer->phone));
        }


        $payment->payment_method = "sslcommerz";
        $payment->amount = $payment->amount - ($currencyAmount * $currencyRate) - $paymentDiscount;
        $payment->advance = ($currencyAmount * $currencyRate);
        $payment->trx_id         = $request->tran_id;
        $payment->sender_number  = $request->card_no;
        $payment->payment_status = "paid";
        $payment->payment_process = 2;
        $payment->payment_details = json_encode($request->all());
        $payment->save();


        // ->with('purchese_event_id', $purchaseEventID)

        return redirect(route('customer.order_success', ['id' => $order->id]));
    }

    public function fail(Request $request)
    {

        // dd($request->all());
        $order = Order::where('id', $request->value_a)->first();
        $payment = Payment::where(['order_id' => $order->id])->first();
        if($payment->payment_method !== "sslcommerz") {
            $payment->update([
                'payment_process' => null,
            ]);
        }
        else {
            $payment->update([
                'payment_process' => 0,
            ]);
        }

        return redirect(route('customer.order_success', ['id' => $order->id]));
    }

    public function cancel(Request $request)
    {
        $order = Order::where('id', $request->value_a)->first();
        $payment = Payment::where(['order_id' => $order->id])->first();
        if($payment->payment_method !== "sslcommerz") {
            $payment->update([
                'payment_process' => null,
            ]);
        }
        else {
            $payment->update([
                'payment_process' => 0,
            ]);
        }

        return redirect(route('customer.order_success', ['id' => $order->id]));
    }




    public function initiateApiPayment(request $request)
    {
        $customer_id = $request->customer_id;
        $package_id = $request->package_id;

        $packageList = [
            1 => ['name' => 'Basic Package', 'amount' => 100],
            2 => ['name' => 'Standard Package', 'amount' => 200],
            3 => ['name' => 'Premium Package', 'amount' => 300],
        ];

        $package = $packageList[$package_id] ?? null;
        if (!$package) {
            return back()->with('error', 'Invalid package selected.');
        }
 
        $postData = [
            'store_id'     => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'total_amount' => $package['amount'],
            'currency'     => 'BDT',
            'tran_id'      => uniqid($customer_id . '_'),

            'success_url'  => route('api.ssl.success'),
            'fail_url'     => route('api.ssl.fail'),
            'cancel_url'   => route('api.ssl.cancel'),

            'cus_name'     => 'Customer ' . $customer_id,
            'cus_country'  => 'Bangladesh'
        ];

        $apiUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        $handle = curl_init($apiUrl);
        curl_setopt_array($handle, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($handle);
        curl_close($handle);

        $result = json_decode($response, true);
        return $result;
    }
    public function apiSuccess(Request $request)
    {
        $response = Http::post(
            config('services.sslcommerz.apiSuccessRedirectUrl'),
            [
                'status' => 'success',
                'data' => $request->all(),
            ]
        );

        return response()->json($response->json());
    }
}*/