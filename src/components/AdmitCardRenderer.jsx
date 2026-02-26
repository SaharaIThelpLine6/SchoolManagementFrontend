import AdmitCardArabicA4Four from "../view/exam/AdmitCardPdf/Arabi/AdmitCardArabicA4Four";
import AdmitCardArabicA4FourAlt from "../view/exam/AdmitCardPdf/Arabi/AdmitCardArabicA4FourAlt";
import AdmitCardArabicA4Six from "../view/exam/AdmitCardPdf/Arabi/AdmitCardArabicA4Six";
import AdmitCardArabicA4Two from "../view/exam/AdmitCardPdf/Arabi/AdmitCardArabicA4Two";
import AdmitCardBanglaA4Four from "../view/exam/AdmitCardPdf/Bangla/AdmitCardBanglaA4Four";
import AdmitCardBanglaA4Two from "../view/exam/AdmitCardPdf/Bangla/AdmitCardBanglaA4Two";
import AdmitCardBanglaA5 from "../view/exam/AdmitCardPdf/Bangla/AdmitCardBanglaA5";

const AdmitCardRenderer = ({ type, data }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <p>ডাটা পাওয়া যায়নি।</p>;
  }

  console.log(data, "data")

  const renderComponent = (student, index, isLast) => {
    const props = { data: student };
    const pageStyle = {
      pageBreakAfter: isLast ? "auto" : "always",
    };

    switch (type) {
      case "1":
        return (
          <div key={index} style={pageStyle}>
            <AdmitCardBanglaA5 {...props} />
          </div>
        );
      case "5":
        return (
          <div key={index} style={pageStyle}>
            <AdmitCardArabicA4Two {...props} />
          </div>
        );
      case "6":
        return (
          <div key={index} style={pageStyle}>
            <AdmitCardArabicA4Four {...props} />
          </div>
        );
      case "7":
        return (
          <div key={index} style={pageStyle}>
            <AdmitCardArabicA4Six {...props} />
          </div>
        );
      case "8":
        return (
          <div key={index} style={pageStyle}>
            <AdmitCardArabicA4FourAlt {...props} />
          </div>
        );
      default:
        return (
          <div key={index} style={pageStyle}>
            <p>রিপোর্ট ফরম্যাট সিলেক্ট করুন।</p>
          </div>
        );
    }
  };

  // Special handling for AdmitCardBanglaA4Two (type "2")
  if (type === "2") {
    // Group students into pairs (2 per page)
    const studentPairs = [];
    for (let i = 0; i < data.length; i += 2) {
      studentPairs.push(data.slice(i, i + 2));
    }

    return (
      <>
        {studentPairs.map((pair, index) => (
          <div
            key={index}
            style={{
              pageBreakAfter:
                index === studentPairs.length - 1 ? "auto" : "always",
            }}
          >
            <AdmitCardBanglaA4Two data={pair} />
          </div>
        ))}
      </>
    );
  }
  // Special handling for AdmitCardBanglaA4Two (type "3")
  if (type === "3") {
    // Group students into pairs (4 per page)
    const studentPairs = [];
    for (let i = 0; i < data.length; i += 4) {
      studentPairs.push(data.slice(i, i + 4));
    }

    return (
      <>
        {studentPairs.map((pair, index) => (
          <div
            key={index}
            style={{
              pageBreakAfter:
                index === studentPairs.length - 1 ? "auto" : "always",
            }}
          >
            <AdmitCardBanglaA4Four data={pair} />
          </div>
        ))}
      </>
    );
  }


  // For other types, handle normally
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((student, index) =>
          renderComponent(student, index, index === data.length - 1)
        )}
      </>
    );
  }

  // If data is a single student object
  return renderComponent(data, 0, true);
};

export default AdmitCardRenderer;
