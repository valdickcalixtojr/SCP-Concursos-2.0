import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 overflow-hidden`}>
      <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 text-white" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20h60v60H20z" />
        <path d="M35 40h30M35 60h20" />
        <circle cx="75" cy="75" r="15" stroke="white" fill="white" fillOpacity="0.2" />
        <path d="M85 85l10 10" stroke="white" strokeWidth="10" />
      </svg>
    </div>
  );
}
