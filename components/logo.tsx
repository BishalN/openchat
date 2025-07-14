export const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={`bg-black dark:bg-white text-white dark:text-black rounded-md w-8 h-8 flex items-center justify-center ${className}`}
    >
      oC
    </div>
  );
};
