// components/PeekButton.tsx
const PeekButton = () => {
  return (
    <div
      className="group relative mt-8 inline-flex items-center pl-5 pr-10 h-9 cursor-pointer
                 hover:brightness-110 transition-all duration-200"
      style={{
        background: 'rgb(126, 212, 234)',
        clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)',
      }}
    >
      <span className="text-gray-900 text-sm font-medium whitespace-nowrap">Peak at the roles</span>

      {/* Eyes 👀 */}
      <span className="flex items-center gap-1 ml-3">
        <span className="relative w-4 h-5 border-2 border-gray-900 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-2 h-2.5 bg-gray-900 rounded-full transform -translate-x-1 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <span className="relative w-4 h-5 border-2 border-gray-900 rounded-full flex items-center justify-center overflow-hidden">
          <span className="block w-2 h-2.5 bg-gray-900 rounded-full transform -translate-x-1 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </span>
    </div>
  );
};

export default PeekButton;
