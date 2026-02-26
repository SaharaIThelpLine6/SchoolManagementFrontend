import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const PaymentCancel = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { schoolid } = useParams();

  const tranId = params.get('tran_id');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/${schoolid}/dashboard/monthly-fee`);
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, schoolid]);

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1 style={{ color: 'orange' }}>⚠️ Payment Cancelled</h1>
      <p>আপনি পেমেন্টটি বাতিল করেছেন।</p>

      {tranId && (
        <p>
          <strong>Transaction ID:</strong> {tranId}
        </p>
      )}

      {/* <p>১ সেকেন্ড পরে ফি পেজে নিয়ে যাওয়া হবে…</p> */}

      <button onClick={() => navigate(`/${schoolid}/dashboard/monthly-fee`)}>
        আবার চেষ্টা করুন
      </button>
    </div>
  );
};

export default PaymentCancel;
