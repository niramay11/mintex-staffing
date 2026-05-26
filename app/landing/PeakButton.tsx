// components/PeekButton.tsx
const PeekButton = () => {
  return (
    <div
      className="group relative mt-8 inline-flex items-center pl-6 pr-14 h-12 cursor-pointer
                 hover:brightness-110 transition-all duration-200"
      style={{
        background: 'rgb(126, 212, 234)',
        clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 50%, calc(100% - 22px) 100%, 0 100%)',
      }}
    >
      <span className="text-gray-900 text-base font-semibold whitespace-nowrap">Peak at the roles</span>

      {/* Eyes 👀 */}
      <span className="flex items-center gap-1.5 ml-4">
        <span className="relative w-6 h-7 border-2 border-gray-900 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-3 h-3.5 bg-gray-900 rounded-full transform -translate-x-1 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <span className="relative w-6 h-7 border-2 border-gray-900 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-3 h-3.5 bg-gray-900 rounded-full transform -translate-x-1 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </span>
    </div>
  );
};

export default PeekButton;
