// SeatCardWatermark.jsx
//
// প্রতিটা সিট কার্ডের ভিতরে বসানোর জন্য ছোট watermark কম্পোনেন্ট।
//
// ব্যবহার: প্রতিটা কার্ডের wrapper div এর ভিতরে, কার্ডের বাকি content এর
// আগে বা পরে (order গুরুত্বপূর্ণ না, এটা position:absolute) বসান।
//
// শর্ত: কার্ডের wrapper div এ position: relative (বা className এ "relative")
// থাকতে হবে, যাতে এই watermark সঠিক কার্ডের ভিতরেই bound থাকে, পুরো পেজ
// জুড়ে না।
//
// ⭐ ঘনত্ব (opacity) আর মাপ এখন বাইরে থেকে দেওয়া যায়।
//
// আগে opacity কোডে ০.০৫ এ বাঁধা ছিল, তাই সেটিংস থেকে কমানো-বাড়ানোর কোনো
// উপায় ছিল না — আর অনেক লোগোতে ০.০৫ এ কাগজে কিছুই বোঝা যেত না। এখন
// প্রপে এলে সেটাই, না এলে আগের ০.০৫ ই — তাই পুরোনো কোনো কল ভাঙে না।

const SeatCardWatermark = ({
  documentLogo,
  logoIsActive,
  // ভগ্নাংশে (০.০৮ = ৮%)। সেটিংস শতাংশে রাখে, কল করার সময় ভাগ করে নেওয়া হয়।
  opacity = 0.05,
  // কার্ডের কত অংশ জুড়ে — চওড়ার শতাংশে
  size = '60%',
}) => {
  if (!documentLogo || !logoIsActive) return null;

  return (
    <img
      src={documentLogo}
      alt=""
      aria-hidden="true"
      className="seat-card-watermark"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        maxWidth: size,
        opacity,
        pointerEvents: 'none',
        // negative z-index ব্যবহার করা হয়নি — তাতে print/PDF এ অদৃশ্য
        // হয়ে যাওয়ার ঝুঁকি থাকে
        zIndex: 1,
        // এটা <img>, CSS background-image নয় — তাই ক্রোমের
        // "Background graphics" বন্ধ থাকলেও ছাপা হয়
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    />
  );
};

export default SeatCardWatermark;
