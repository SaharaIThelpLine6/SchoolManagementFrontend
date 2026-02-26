import { useState } from 'react';

const SwitcherThree = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div>
      <label
        htmlFor="toggle3"
        className="flex cursor-pointer select-none items-center"
      >
        {/* w-[200px] h-4 bg-red */}
        <div className="relative">
          <input
            type="checkbox"
            id="toggle3"
            className="sr-only"
            onChange={() => {
              setEnabled(!enabled);
            }}
          />
          <div className={`block h-4 w-10 rounded-full ${enabled ? "bg-theme-color" : "bg-meta-9"}`}></div>
          {/* <div className={`dot absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${enabled && '!right-1 !translate-x-full !bg-primary'
            }`}
          > */}
            <div className={`dot absolute left-1 top-1/2 -translate-y-1/2 flex h-3 w-3 items-center justify-center rounded-full bg-white transition ${enabled && 'translate-x-[20px] !bg-primary'}`}>
              <span className={`hidden ${enabled && '!block'}`}>
                <svg
                  className="fill-white"
                  width="11"
                  height={12}
                  viewBox="0 0 11 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                    fill=""
                    stroke=""
                    strokeWidth="0.4"
                  ></path>
                </svg>
              </span>
              <span className={`${enabled && 'hidden'}`}>
                <svg  xmlns="http://www.w3.org/2000/svg"   width={10}  height={10}  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth={2}  strokeLinecap="round"  strokeLinejoin="round"  className="text icon icon-tabler icons-tabler-outline icon-tabler-x text-gray-700"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
              </span>
            </div>
          {/* </div> */}
        </div>
      </label>
    </div>
  );
};

export default SwitcherThree;
