// SeatCardWatermark.jsx
// প্রতিটা সিট কার্ডের ভিতরে বসানোর জন্য ছোট watermark কম্পোনেন্ট।
// ব্যবহার: প্রতিটা কার্ডের wrapper div এর ভিতরে, কার্ডের বাকি content এর
// আগে বা পরে (order গুরুত্বপূর্ণ না, এটা position:absolute) বসান।
//
// শর্ত: কার্ডের wrapper div এ position: relative (বা className এ "relative")
// থাকতে হবে, যাতে এই watermark সঠিক কার্ডের ভিতরেই bound থাকে, পুরো পেজ জুড়ে না।

const SeatCardWatermark = ({ documentLogo, logoIsActive }) => {
  if (!documentLogo || !logoIsActive) return null;

  return (
    <img
      src={documentLogo}
      alt="Watermark"
      className="seat-card-watermark"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        maxWidth: '60%',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 1, // কার্ডের বর্ডার/টেক্সটের সাথে সমান স্ট্যাকিং কনটেক্সটে থেকে উপরে বসবে,
                   // negative z-index ব্যবহার করা হয়নি যাতে print/PDF এ অদৃশ্য হয়ে না যায়
      }}
      // print media তে ভালো থাকার জন্য (Chrome background-graphics সেটিং এড়িয়ে)
      // এটা <img> ট্যাগ, CSS background-image না — তাই সবসময় প্রিন্ট হবে।
    />
  );
};

export default SeatCardWatermark;
