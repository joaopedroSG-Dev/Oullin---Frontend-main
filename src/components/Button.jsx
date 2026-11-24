
export default function Button({ onClick, children, className, px, py = 2}) {
  return (
    <button
      onClick={onClick}
      className={`px-${px} py-${py} bg-[#FB8500] text-white rounded-[15px] hover:bg-[#EBEBD3] ${className}`}
    >
      {children}
    </button>
  );
}