import React, { useState } from 'react';
import DefaultSelect from './DefaultSelect';

const PaymentModal = () => {
    const [amount, setAmount] = useState('');

    const handlePayNow = () => {
        alert(`Paying ${amount}`);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', width: '300px', margin: '0 auto' }}>
            <h2>Payment Modal</h2>
            <DefaultSelect label={"Choose Service"} registerKey={"service"}/>
            <button onClick={handlePayNow} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
                Pay Now
            </button>
        </div>
    );
};

export default PaymentModal;