const DeveloperCredit = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 py-3 bg-gray-50 text-gray-500 text-sm border-t border-gray-200 text-center print:hidden z-[99]">
      &copy; {year} Developed by{" "}
      <a
        href="https://saharait.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        SAHARA IT
      </a>
      . All rights reserved.
    </footer>
  );
};

export default DeveloperCredit;