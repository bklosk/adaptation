"use client";

import React from "react";
import { ViewState } from "./types";

interface CameraControlsProps {
  viewState: ViewState;
  onViewStateChange: (viewState: Partial<ViewState>) => void;
  onResetView: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  viewState,
  onViewStateChange,
  onResetView,
}) => {
  const handleSliderChange = (property: keyof ViewState, value: number) => {
    onViewStateChange({ [property]: value });
  };

  return (
    <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 min-w-64">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Camera Controls
          </h3>
          <button
            onClick={onResetView}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reset View
          </button>
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex justify-between">
            Zoom
            <span className="text-gray-500">{viewState.zoom.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="8"
            max="22"
            step="0.1"
            value={viewState.zoom}
            onChange={(e) =>
              handleSliderChange("zoom", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex justify-between">
            Pitch (Tilt)
            <span className="text-gray-500">{viewState.pitch.toFixed(0)}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="85"
            step="1"
            value={viewState.pitch}
            onChange={(e) =>
              handleSliderChange("pitch", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Bearing Control */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex justify-between">
            Rotation
            <span className="text-gray-500">
              {viewState.bearing.toFixed(0)}°
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={viewState.bearing}
            onChange={(e) =>
              handleSliderChange("bearing", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Quick Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Quick Views
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewStateChange({ pitch: 0, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Top View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 45, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Angle View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 85, bearing: 0 })}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Side View
            </button>
            <button
              onClick={() => onViewStateChange({ pitch: 45, bearing: 45 })}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Corner View
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CameraControls;
