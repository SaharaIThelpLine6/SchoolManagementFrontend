const subjects = [
  { id: 1, name: 'বাংলা প্রথম পত্র' },
  { id: 2, name: 'ইংরেজি' },
  { id: 3, name: 'গণিত' },
  { id: 4, name: 'বিজ্ঞান' },
  { id: 5, name: 'ধর্ম' },
];

const dates = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'];

const historyData = {
  'বাংলা প্রথম পত্র': [
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
  ],
  ইংরেজি: [
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
  ],
  গণিত: [
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    true,
    true,
  ],
  বিজ্ঞান: [
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
  ],
  ধর্ম: [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ],
};

const HomeWorkHistory = () => {
  return (
    <div className="bg-sky-100 rounded-xl overflow-x-auto max-w-full">
      <div className="grid grid-flow-col auto-cols-[48px] w-fit">
        {/* Date Column */}
        <div className="min-w-[48px]">
          <div className="h-10" />
          {dates.map((d) => (
            <div
              key={d}
              className="h-10 w-full flex items-center justify-center
                     text-xs font-semibold text-gray-700 border border-white"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Subject Columns */}
        {subjects.map((subject) => (
          <div key={subject.id} className="min-w-[48px] text-center">
            {/* Header with fixed height */}
            <div
              className={`max-h-16 overflow-hidden h-10 w-full
                      rounded-t-xl flex items-center justify-center`}
            >
              <span
                className="text-black text-[12px] font-semibold
                           [writing-mode:vertical-rl] rotate-180"
              >
                {subject.name}
              </span>
            </div>

            {/* Cells */}
            {historyData[subject.name].map((status, i) => (
              <div
                key={i}
                className="h-10 w-full flex items-center justify-center border border-white"
              >
                {status ? (
                  <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center text-[10px] text-white font-bold">
                    ✕
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeWorkHistory;
