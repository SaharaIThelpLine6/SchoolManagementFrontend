const Contact = () => {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-primary-navy via-primary-dark to-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm mb-4 backdrop-blur-sm">
            আমাদের সাথে যোগাযোগ
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            যোগাযোগ
          </h1>
          <p className="text-base md:text-lg text-white/85 max-w-2xl mx-auto">
            আপনার প্রশ্ন, পরামর্শ বা প্রয়োজনে নির্দ্বিধায় যোগাযোগ করুন। আমরা সর্বদা আপনার পাশে আছি।
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-xl animate-bounce-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Address */}
            <div className="text-center md:text-left">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ঠিকানা</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                ভাঙ্গা প্রেস, যাত্রাবাড়ী<br />
                ঢাকা, বাংলাদেশ
              </p>
            </div>

            {/* Phone */}
            <div className="text-center md:text-left">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ফোন</h3>
              <a
                href="tel:+8801822930055"
                className="text-primary-dark font-bold text-lg hover:underline transition"
              >
                ০১৮২২-৯৩০০৫৫
              </a>
              <p className="text-sm text-gray-500 mt-2">(কল করার জন্য উপরে ক্লিক করুন)</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+8801822930055"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-dark to-primary text-white font-semibold text-sm rounded-full shadow-lg hover:opacity-90 transition"
            >
              <span className="mr-2">📞</span> কল করুন
            </a>
            <a
              href="https://wa.me/8801822930055"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold text-sm rounded-full shadow-lg hover:bg-green-600 transition"
            >
              <span className="mr-2">💬</span> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
