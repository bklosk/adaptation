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
  return (
    <div
      className="backdrop-blur-sm p-3 shadow-lg font-space-grotesk border-2 border-white w-full max-w-xs"
      style={{ backgroundColor: "#1B2223" }}
    >
      <label
        htmlFor="pointSize"
        className="block mb-1 text-sm font-black text-white"
      >
        Point Size: {pointSize}
      </label>
      <input
        id="pointSize"
        type="range"
        min={minSize}
        max={maxSize}
        value={pointSize}
        onChange={(e) => onPointSizeChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

export default PointSizeControl;
