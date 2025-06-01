import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";
import Swal from "sweetalert2";
import { enToBnNumber } from "../../../helper/languageFormat";

const PdfHeader = () => {
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();
console.log(institutionInfo);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);

  useEffect(() => {
    if (institutionInfoLoading) {
      Swal.fire({
        title: "লোড হচ্ছে...",
        text: "তথ্য আনয়ন করা হচ্ছে। দয়া করে অপেক্ষা করুন।",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close(); // Close the loading alert once loading finishes
    }

    if (institutionInfoError) {
      Swal.fire({
        icon: "error",
        title: "ভুল হয়েছে!",
        text: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে।",
      });
    }
  }, [institutionInfoLoading, institutionInfoError]);

  return (
    <div className="flex items-center justify-between pb-3 print:flex-row print:items-start">
      {/* Logo on the left */}
      <div className="w-20 h-20">
        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
      </div>

      {/* Text in the center */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold">{institutionInfo?.InstitutionName}</h1>
        <p className="text-sm">{institutionInfo?.Address}</p>
        <p className="text-sm">{enToBnNumber(institutionInfo?.ContactNumber)}</p>
      </div>

      {/* Empty placeholder for symmetry */}
      <div className="w-20 h-20"></div>
    </div>
  );
};

export default PdfHeader;
