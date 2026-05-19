// components/PeekButton.tsx
import React from "react";

const PeekButton = () => {
  return (
    <button
      aria-label="Peek at the roles"
      className="group relative bg-[#7ed4ea] mt-8 px-5 py-2 h-9
             text-white font-medium rounded-l-md 
             flex items-center gap-3
             transition-all duration-200 ease-out
             hover:bg-[#6bcde6] hover:shadow-lg hover:scale-[1.01]"
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
               border-t-transparent border-b-transparent border-l-[#7ed4ea]"
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