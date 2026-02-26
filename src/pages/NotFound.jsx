import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center bg-white h-screen px-4 font-SolaimanLipi">
      <div className="p-8 md:p-12 max-w-2xl w-full text-center">
        <img
          src="/page-not-found.avif"
          alt="404 Illustration"
          className="mx-auto w-full max-w-xs mb-6"
        />
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
          ওহ্ না! পেইজটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-gray-600 mb-6">
          আপনি যে পেইজটি খুঁজছেন তা হয়তো মুছে ফেলা হয়েছে, নাম পরিবর্তন হয়েছে বা কখনো ছিলই না।
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full text-lg font-medium hover:bg-indigo-700 transition duration-300"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    </div>
  );
};

export default NotFound;
