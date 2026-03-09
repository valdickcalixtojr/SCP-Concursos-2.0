import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden relative`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-white rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Icon */}
      <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 text-white relative z-10" fill="none">
        {/* Document */}
        <rect x="20" y="15" width="45" height="60" rx="4" stroke="currentColor" strokeWidth="6" fill="white" fillOpacity="0.15" />
        
        {/* Lines on document */}
        <line x1="30" y1="32" x2="55" y2="32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="45" x2="50" y2="45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="58" x2="45" y2="58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        
        {/* Checkmark badge */}
        <circle cx="70" cy="65" r="22" fill="white" />
        <circle cx="70" cy="65" r="18" fill="currentColor" />
        <path d="M60 65 L67 72 L80 58" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}
