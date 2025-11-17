// StatisticsOfAllExaminees কম্পোনেন্ট
const PdfFind = ({
  queryParams,
  selectedPdfID,
  selectedPdfName,
  pdfOptions,
  reportData,
}) => {
  console.log('Received props in StatisticsOfAllExaminees:');
  console.log('queryParams:', queryParams);
  console.log('selectedPdfID:', selectedPdfID);
  console.log('selectedPdfName:', selectedPdfName);
  console.log('pdfOptions:', pdfOptions);
  console.log('reportData:', reportData);

  // এখানে আপনি এই ডাটা ব্যবহার করে বিভিন্ন PDF show করতে পারবেন
  // উদাহরণ:
  const renderSelectedPdf = () => {
    if (!selectedPdfID) {
      return <div>Please select a PDF</div>;
    }

    // selectedPdfID অনুযায়ী বিভিন্ন PDF render করুন
    switch (selectedPdfID) {
      case '1':
        return <div>PDF 1 Content - {selectedPdfName}</div>;
      case '2':
        return <div>PDF 2 Content - {selectedPdfName}</div>;
      case '3':
        return <div>PDF 3 Content - {selectedPdfName}</div>;
      default:
        return <div>PDF Content for ID: {selectedPdfID}</div>;
    }
  };

  return (
    <div>
      <h2>Statistics of All Examinees</h2>
      {renderSelectedPdf()}

      {/* অথবা যদি API থেকে PDF data fetch করতে চান */}
      {queryParams && (
        <div>
          <h3>Report Parameters:</h3>
          <pre>{JSON.stringify(queryParams, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PdfFind;
