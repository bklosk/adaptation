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
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg font-space-grotesk z-10">
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
