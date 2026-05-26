// components/PeekButton.tsx
import React from "react";

const PeekButton = () => {
  return (
    <button
      aria-label="Peek at the roles"
      style={{
        background: 'rgba(126, 212, 234, 0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(126, 212, 234, 0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 20px rgba(126,212,234,0.2)'
      }}
      className="group relative mt-8 px-5 py-2 h-9
             text-white font-medium rounded-l-md
             flex items-center gap-3
             transition-all duration-250 ease-out
             hover:scale-[1.01]"
    >
      {/* Eyes 👀 */}

      <span className="text-gray-900">Peak at the roles</span>
      <span className="flex items-center gap-1">
        <span className="relative w-4 h-5 border-black border-2 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-2 h-2.5 bg-black rounded-full transform -translate-x-1 transition-transform duration-250 group-hover:translate-x-1"></span>
        </span>

        <span className="relative w-4 h-5 border-black border-2 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-2 h-2.5 bg-black rounded-full transform -translate-x-1 transition-transform duration-250 group-hover:translate-x-1"></span>
        </span>
      </span>

      {/* Outer arrow */}
      <span
        className="absolute top-1/2 -translate-y-1/2 -right-7
               w-0 h-0
               border-t-19 border-b-19 border-l-28
               border-t-transparent border-b-transparent border-l-[rgba(126,212,234,0.5)]"
      ></span>

      {/* Inner white arrow */}
      <span
        className="absolute top-1/2 -translate-y-1/2 -right-4
               w-0 h-0
               border-t-[9px] border-b-[9px] border-l-14
               border-t-transparent border-b-transparent border-l-white"
      ></span>
    </button>
  );
}

export default PeekButton;