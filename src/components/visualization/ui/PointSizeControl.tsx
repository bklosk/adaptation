import React from "react";

interface PointSizeControlProps {
  pointSize: number;
  onPointSizeChange: (size: number) => void;
  minSize?: number;
  maxSize?: number;
}

const PointSizeControl: React.FC<PointSizeControlProps> = ({
  pointSize,
  onPointSizeChange,
  minSize = 0.5,
  maxSize = 50,
}) => {
  const panelStyle = {
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
  };
  return (
    <div
      className="p-3 shadow-lg font-space-grotesk border border-emerald-300/60 dark:border-emerald-400/40 w-full max-w-xs rounded-2xl bg-white/60 dark:bg-[#1B2223]/70 text-neutral-800 dark:text-neutral-200"
      style={panelStyle}
    >
      <label
        htmlFor="pointSize"
        className="block mb-1 text-sm font-bold text-neutral-700 dark:text-neutral-300"
      >
        Point Size:{" "}
        <span className="font-normal text-neutral-500 dark:text-neutral-400">
          {pointSize.toFixed(1)}
        </span>
      </label>
      <input
        id="pointSize"
        type="range"
        min={minSize}
        max={maxSize}
        step={0.1} // More granular control
        value={pointSize}
        onChange={(e) => onPointSizeChange(Number(e.target.value))}
        className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider border border-neutral-400 dark:border-neutral-600 accent-emerald-500 dark:accent-emerald-400"
      />
    </div>
  );
};

export default PointSizeControl;
