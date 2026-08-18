import { useState } from 'react';

const SwitcherOne = ({ label, registerKey }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"

      className="sr-only peer"
    />

    <div className="relative w-9 h-5 rounded-full bg-neutral-quaternary
      peer-focus:ring-4 peer-focus:ring-brand-soft
      peer-checked:bg-brand
      after:absolute after:top-[2px] after:start-[2px]
      after:h-4 after:w-4 after:rounded-full after:bg-white
      after:transition-all after:content-['']
      peer-checked:after:translate-x-full">
    </div>

    <span className="ms-3 text-sm font-medium text-heading">
      {label}
    </span>
  </label>
);


export default SwitcherOne
