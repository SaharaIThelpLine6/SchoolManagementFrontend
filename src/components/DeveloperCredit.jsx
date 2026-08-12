const DeveloperCredit = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 py-3 bg-gradient-to-r from-[#0a1f13] to-[#0f2d1b] text-gray-300 text-sm border-t border-white/10 text-center print:hidden z-[99] backdrop-blur-sm">
      <span className="opacity-80">
        &copy; {year} Developed by{' '}
        <a
          href="https://saharait.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-300"
        >
          SAHARA IT
        </a>
        . All rights reserved.
      </span>
    </footer>
  );
};

export default DeveloperCredit;
