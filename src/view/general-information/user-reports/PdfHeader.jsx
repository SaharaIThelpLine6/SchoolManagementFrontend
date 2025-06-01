import React from "react";

const PdfHeader = () => {
  return (
    <div className="flex items-center justify-between  pb-2 print:flex-row print:items-start">
      {/* Logo on the left */}
      <div className="w-20 h-20">
        <img
          src="https://thumbs.dreamstime.com/b/education-badge-logo-design-university-high-school-emblem-education-badge-logo-design-university-high-school-emblem-151924849.jpg"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text on the right */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold">জামেয়া রশীদিয়া ফেনী (ডেমো)</h1>
        <p className="text-sm">হাউজ-১/এ, রোড-১, ব্লক- জে, বারিধারা আ/এ, ঢাকা</p>
        <p className="text-sm">০১৮৮৫৫৯৫৫৫২</p>
      </div>
      <div className="w-20 h-20"></div>
    </div>
  );
};

export default PdfHeader;
