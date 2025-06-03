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
  minSize = 1,
  maxSize = 50,
}) => {
  return (
    <div className="absolute top-16 left-3 bg-white p-3 rounded-lg shadow-lg font-space-grotesk">
      <label htmlFor="pointSize" className="block mb-1 text-sm font-bold">
        Point Size: {pointSize}
      </label>
      <input
        id="pointSize"
        type="range"
        min={minSize}
        max={maxSize}
        value={pointSize}
        onChange={(e) => onPointSizeChange(Number(e.target.value))}
        className="w-48"
      />
    </div>
  );
};

export default PointSizeControl;
