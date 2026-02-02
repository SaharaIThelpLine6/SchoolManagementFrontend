import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { schoolid } = useParams();

  const tranId = params.get('tran_id');

  useEffect(() => {
    // optional: auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate(`/${schoolid}/dashboard/monthly-fee`); // বা যেটা চাই
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h1 style={{ color: 'green' }}>✅ Payment Successful</h1>
      <p>আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।</p>

      {tranId && (
        <p>
          <strong>Transaction ID:</strong> {tranId}
        </p>
      )}

      {/* <p>৫ সেকেন্ড পরে ড্যাশবোর্ডে নিয়ে যাওয়া হবে…</p> */}

      <button onClick={() => navigate('/dashboard')}>ড্যাশবোর্ডে যান</button>
    </div>
  );
};

export default PaymentSuccess;
