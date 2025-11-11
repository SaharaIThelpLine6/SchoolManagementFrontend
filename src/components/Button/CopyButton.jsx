import { useState } from 'react';

export default function CopyButton({ text = '', className = '', onClick }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }

      // যদি parent থেকে onClick দেওয়া থাকে, সেটা execute করবে
      if (onClick) {
        onClick();
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700
        shadow-sm transition-all duration-200 hover:bg-gray-200 active:scale-95
        ${copied ? 'bg-emerald-100 text-emerald-700 border-emerald-400' : ''}
        ${className}`}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 16 16"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all ${copied ? 'text-emerald-600' : ''}`}
      >
        <path
          fillRule="evenodd"
          d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
        ></path>
      </svg>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
